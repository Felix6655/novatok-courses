import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";
import type { TutorRequest } from "@/lib/validation/tutor";

const getCourseBySlug = vi.fn();
const getCourseModulesWithLessons = vi.fn();
const getRelevantLessons = vi.fn();
const getPinnedLessonContext = vi.fn();
const generateTutorAnswer = vi.fn();
const getAIProvider = vi.fn();

vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
}));
vi.mock("@/server/course-content", () => ({
  getCourseModulesWithLessons: (...args: unknown[]) => getCourseModulesWithLessons(...args),
}));
vi.mock("@/server/tutor/content-retrieval", () => ({
  getRelevantLessons: (...args: unknown[]) => getRelevantLessons(...args),
  getPinnedLessonContext: (...args: unknown[]) => getPinnedLessonContext(...args),
}));
vi.mock("@/server/tutor/tutor-response", () => ({
  generateTutorAnswer: (...args: unknown[]) => generateTutorAnswer(...args),
}));
vi.mock("@/ai/get-ai-provider", () => ({
  getAIProvider: (...args: unknown[]) => getAIProvider(...args),
}));

const { getTutorAnswer } = await import("@/server/tutor/tutor-service");
const { TutorCourseNotFoundError, TutorLessonNotFoundError, TutorNoContentError } = await import(
  "@/server/tutor/errors"
);

const fakeProvider: AIProvider = { name: "fake", generateCompletion: vi.fn() };

const baseRequest: TutorRequest = {
  courseSlug: "javascript-fundamentals",
  question: "Explain variables",
  responseMode: "NORMAL",
  history: [],
};

const course = { id: "course-1", slug: "javascript-fundamentals", title: "JavaScript Fundamentals" };
const syllabusWithContent = [{ id: "m1", lessons: [{ id: "l1" }] }];

beforeEach(() => {
  getCourseBySlug.mockReset();
  getCourseModulesWithLessons.mockReset();
  getRelevantLessons.mockReset();
  getPinnedLessonContext.mockReset();
  generateTutorAnswer.mockReset();
  getAIProvider.mockReset();
  getAIProvider.mockReturnValue(fakeProvider);
});

describe("getTutorAnswer", () => {
  it("throws TutorCourseNotFoundError when the course doesn't exist or isn't published", async () => {
    getCourseBySlug.mockResolvedValue(null);
    await expect(getTutorAnswer(baseRequest)).rejects.toBeInstanceOf(TutorCourseNotFoundError);
    expect(getCourseModulesWithLessons).not.toHaveBeenCalled();
  });

  it("throws TutorNoContentError when the course has no lessons", async () => {
    getCourseBySlug.mockResolvedValue(course);
    getCourseModulesWithLessons.mockResolvedValue([{ id: "m1", lessons: [] }]);
    await expect(getTutorAnswer(baseRequest)).rejects.toBeInstanceOf(TutorNoContentError);
    expect(getRelevantLessons).not.toHaveBeenCalled();
  });

  it("returns a deterministic redirect without calling the AI provider when out of scope", async () => {
    getCourseBySlug.mockResolvedValue(course);
    getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
    getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: true, isMetaQuestion: false });

    const result = await getTutorAnswer(baseRequest);

    expect(result.outOfScope).toBe(true);
    expect(result.answerSource).toBe("redirect");
    expect(result.grounded).toBe(false);
    expect(result.answer).toContain("JavaScript Fundamentals");
    expect(getAIProvider).not.toHaveBeenCalled();
    expect(generateTutorAnswer).not.toHaveBeenCalled();
  });

  it("calls the AI provider and returns a grounded result for an in-scope question", async () => {
    getCourseBySlug.mockResolvedValue(course);
    getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
    getRelevantLessons.mockResolvedValue({
      lessons: [{ slug: "variables-and-data-types" }],
      outOfScope: false,
      isMetaQuestion: false,
    });
    generateTutorAnswer.mockResolvedValue({
      answer: "A variable stores a value.",
      relevantLessons: [{ slug: "variables-and-data-types", title: "Variables", moduleTitle: "Basics" }],
      outOfScope: false,
      practiceQuestion: null,
      answerSource: "ai",
    });

    const result = await getTutorAnswer(baseRequest);

    expect(result.grounded).toBe(true);
    expect(result.answerSource).toBe("ai");
    expect(result.courseSlug).toBe("javascript-fundamentals");
    expect(generateTutorAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ courseTitle: "JavaScript Fundamentals", question: "Explain variables" }),
      fakeProvider,
    );
  });

  it("uses an injected provider instead of the env-configured one when supplied", async () => {
    getCourseBySlug.mockResolvedValue(course);
    getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
    getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: false, isMetaQuestion: true });
    generateTutorAnswer.mockResolvedValue({
      answer: "General guidance.",
      relevantLessons: [],
      outOfScope: false,
      practiceQuestion: null,
      answerSource: "ai",
    });

    const injectedProvider: AIProvider = { name: "injected", generateCompletion: vi.fn() };
    await getTutorAnswer(baseRequest, { provider: injectedProvider });

    expect(getAIProvider).not.toHaveBeenCalled();
    expect(generateTutorAnswer).toHaveBeenCalledWith(expect.anything(), injectedProvider);
  });

  it("propagates provider errors from generateTutorAnswer", async () => {
    getCourseBySlug.mockResolvedValue(course);
    getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
    getRelevantLessons.mockResolvedValue({
      lessons: [{ slug: "variables-and-data-types" }],
      outOfScope: false,
      isMetaQuestion: false,
    });
    generateTutorAnswer.mockRejectedValue(new Error("provider down"));

    await expect(getTutorAnswer(baseRequest)).rejects.toThrow("provider down");
  });

  describe("lessonSlug pinning", () => {
    const pinnedRequest: TutorRequest = { ...baseRequest, lessonSlug: "variables-and-data-types" };

    it("throws TutorLessonNotFoundError for an unknown lessonSlug", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getPinnedLessonContext.mockResolvedValue(null);

      await expect(getTutorAnswer(pinnedRequest)).rejects.toBeInstanceOf(TutorLessonNotFoundError);
      expect(generateTutorAnswer).not.toHaveBeenCalled();
    });

    it("throws TutorLessonNotFoundError when the lesson belongs to another course", async () => {
      // getPinnedLessonContext looks the lesson up scoped to this course's
      // id, so a lesson from a different course simply isn't found — same
      // null result as an unknown slug.
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getPinnedLessonContext.mockResolvedValue(null);

      await expect(getTutorAnswer(pinnedRequest)).rejects.toBeInstanceOf(TutorLessonNotFoundError);
    });

    it("does not run the out-of-scope keyword check when a lesson is pinned", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getPinnedLessonContext.mockResolvedValue({
        pinnedLesson: { slug: "variables-and-data-types" },
        nearbyLessons: [],
      });
      generateTutorAnswer.mockResolvedValue({
        answer: "A variable stores a value.",
        relevantLessons: [{ slug: "variables-and-data-types", title: "Variables", moduleTitle: "Basics" }],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      const result = await getTutorAnswer({
        ...pinnedRequest,
        question: "something with no keyword overlap at all",
      });

      expect(getRelevantLessons).not.toHaveBeenCalled();
      expect(result.outOfScope).toBe(false);
      expect(result.pinnedLessonSlug).toBe("variables-and-data-types");
    });

    it("passes the pinned lesson and nearby lessons as candidates to the AI step", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getPinnedLessonContext.mockResolvedValue({
        pinnedLesson: { slug: "variables-and-data-types" },
        nearbyLessons: [{ slug: "functions-and-control-flow" }],
      });
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      await getTutorAnswer(pinnedRequest);

      expect(generateTutorAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          candidateLessons: [
            { slug: "variables-and-data-types" },
            { slug: "functions-and-control-flow" },
          ],
          pinnedLessonSlug: "variables-and-data-types",
        }),
        fakeProvider,
      );
    });

    it("falls back to keyword retrieval when no lessonSlug is provided", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getRelevantLessons.mockResolvedValue({
        lessons: [{ slug: "variables-and-data-types" }],
        outOfScope: false,
        isMetaQuestion: false,
      });
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      const result = await getTutorAnswer(baseRequest);

      expect(getPinnedLessonContext).not.toHaveBeenCalled();
      expect(result.pinnedLessonSlug).toBeNull();
    });
  });
});
