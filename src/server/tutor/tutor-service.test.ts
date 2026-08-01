import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";
import type { TutorRequest } from "@/lib/validation/tutor";

const getCourseBySlug = vi.fn();
const getCourseModulesWithLessons = vi.fn();
const getRelevantLessons = vi.fn();
const getPinnedLessonContext = vi.fn();
const generateTutorAnswer = vi.fn();
const getAIProvider = vi.fn();
const recordLearningActivity = vi.fn();
const findEnrollment = vi.fn();
const getLearningSignals = vi.fn();

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
vi.mock("@/server/learning/activity", () => ({
  recordLearningActivity: (...args: unknown[]) => recordLearningActivity(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
}));
vi.mock("@/server/learning/learning-signals", () => ({
  getLearningSignals: (...args: unknown[]) => getLearningSignals(...args),
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
  recordLearningActivity.mockReset();
  findEnrollment.mockReset();
  getLearningSignals.mockReset();
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
    await getTutorAnswer(baseRequest, undefined, { provider: injectedProvider });

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

  describe("studentId behavior (Sprint 6)", () => {
    it("does not record activity or fetch learning context when no studentId is given", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: false, isMetaQuestion: true });
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      await getTutorAnswer(baseRequest);

      expect(recordLearningActivity).not.toHaveBeenCalled();
      expect(findEnrollment).not.toHaveBeenCalled();
    });

    it("records a TUTOR_QUESTION activity with bounded metadata (never the question text) when studentId is given", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: false, isMetaQuestion: true });
      findEnrollment.mockResolvedValue(null);
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      await getTutorAnswer(baseRequest, "student-1");

      expect(recordLearningActivity).toHaveBeenCalledWith({
        studentId: "student-1",
        courseId: "course-1",
        lessonId: null,
        type: "TUTOR_QUESTION",
        metadata: { responseMode: "NORMAL" },
      });
    });

    it("records activity even for an out-of-scope (redirect) question", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: true, isMetaQuestion: false });

      await getTutorAnswer(baseRequest, "student-1");

      expect(recordLearningActivity).toHaveBeenCalled();
      expect(generateTutorAnswer).not.toHaveBeenCalled();
    });

    it("does not fetch learning context when the student isn't enrolled", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: false, isMetaQuestion: true });
      findEnrollment.mockResolvedValue(null);
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      await getTutorAnswer(baseRequest, "student-1");

      expect(getLearningSignals).not.toHaveBeenCalled();
      expect(generateTutorAnswer).toHaveBeenCalledWith(
        expect.objectContaining({ learningContext: null }),
        fakeProvider,
      );
    });

    it("fetches and forwards a bounded learning context when the student is enrolled", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getRelevantLessons.mockResolvedValue({ lessons: [], outOfScope: false, isMetaQuestion: true });
      findEnrollment.mockResolvedValue({ id: "enr-1" });
      getLearningSignals.mockResolvedValue({
        completedLessons: 2,
        totalLessons: 5,
        recentPracticeAccuracy: 0.5,
        recentPracticeAttempts: 4,
        recentTutorQuestions: 1,
        lessonsNeedingPractice: [
          { lessonSlug: "a", lessonTitle: "Lesson A", moduleTitle: "M", reason: "low accuracy" },
          { lessonSlug: "b", lessonTitle: "Lesson B", moduleTitle: "M", reason: "low accuracy" },
          { lessonSlug: "c", lessonTitle: "Lesson C", moduleTitle: "M", reason: "low accuracy" },
        ],
        currentLesson: null,
        nextLesson: null,
        isCourseComplete: false,
      });
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      await getTutorAnswer(baseRequest, "student-1");

      expect(generateTutorAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          learningContext: {
            completedLessonCount: 2,
            totalLessons: 5,
            recentPracticeAccuracy: 0.5,
            // capped to 2 titles even though 3 candidates were returned
            reviewLessonTitles: ["Lesson A", "Lesson B"],
          },
        }),
        fakeProvider,
      );
    });

    it("uses the pinned lesson id as activity lessonId when a lessonSlug is given", async () => {
      getCourseBySlug.mockResolvedValue(course);
      getCourseModulesWithLessons.mockResolvedValue(syllabusWithContent);
      getPinnedLessonContext.mockResolvedValue({
        pinnedLesson: { id: "l1", slug: "variables-and-data-types" },
        nearbyLessons: [],
      });
      generateTutorAnswer.mockResolvedValue({
        answer: "ok",
        relevantLessons: [],
        outOfScope: false,
        practiceQuestion: null,
        answerSource: "ai",
      });

      await getTutorAnswer(
        { ...baseRequest, lessonSlug: "variables-and-data-types" },
        "student-1",
      );

      expect(recordLearningActivity).toHaveBeenCalledWith(
        expect.objectContaining({ lessonId: "l1" }),
      );
    });
  });
});
