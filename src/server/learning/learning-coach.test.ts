import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";

const getCourseBySlug = vi.fn();
const getRelatedCourses = vi.fn();
const findEnrollment = vi.fn();
const getCourseModulesWithLessons = vi.fn();
const calculateCourseProgress = vi.fn();
const resolveResumeLesson = vi.fn();

vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
  getRelatedCourses: (...args: unknown[]) => getRelatedCourses(...args),
}));
vi.mock("@/server/course-content", () => ({
  getCourseModulesWithLessons: (...args: unknown[]) => getCourseModulesWithLessons(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
}));
vi.mock("@/server/learning/progress", () => ({
  calculateCourseProgress: (...args: unknown[]) => calculateCourseProgress(...args),
}));
vi.mock("@/server/learning/resume", () => ({
  resolveResumeLesson: (...args: unknown[]) => resolveResumeLesson(...args),
}));

const { getLearningCoachAdvice } = await import("@/server/learning/learning-coach");
const { EnrollmentCourseNotFoundError, NotEnrolledError } = await import("@/server/learning/errors");

const course = { id: "course-1", slug: "javascript-fundamentals", title: "JavaScript Fundamentals" };
const syllabus = [
  {
    id: "m1",
    title: "JavaScript Basics",
    lessons: [
      { id: "l1", slug: "variables-and-data-types", title: "Variables and Data Types" },
      { id: "l2", slug: "functions-and-control-flow", title: "Functions and Control Flow" },
    ],
  },
];

function fakeProvider(response: string): AIProvider {
  return { name: "fake", generateCompletion: async () => response };
}

beforeEach(() => {
  getCourseBySlug.mockReset();
  getRelatedCourses.mockReset();
  findEnrollment.mockReset();
  getCourseModulesWithLessons.mockReset();
  calculateCourseProgress.mockReset();
  resolveResumeLesson.mockReset();
});

describe("getLearningCoachAdvice", () => {
  it("throws EnrollmentCourseNotFoundError for an unknown/unpublished course", async () => {
    getCourseBySlug.mockResolvedValue(null);
    await expect(
      getLearningCoachAdvice("student-1", "not-a-real-course", { provider: fakeProvider("{}") }),
    ).rejects.toBeInstanceOf(EnrollmentCourseNotFoundError);
  });

  it("throws NotEnrolledError when the student isn't enrolled", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue(null);
    await expect(
      getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider: fakeProvider("{}") }),
    ).rejects.toBeInstanceOf(NotEnrolledError);
  });

  it("sources nextLesson entirely from resolveResumeLesson, never from the AI", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 2,
      completedLessons: 1,
      percentage: 50,
      isComplete: false,
      completedLessonSlugs: ["variables-and-data-types"],
    });
    resolveResumeLesson.mockResolvedValue({
      lesson: { id: "l2", slug: "functions-and-control-flow", title: "Functions and Control Flow", content: "..." },
      isCourseComplete: false,
    });

    const provider = fakeProvider(
      JSON.stringify({ explanation: "Great next step!", studyTips: ["Practice writing small functions."] }),
    );

    const result = await getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider });

    expect(result.nextLesson).toEqual({
      slug: "functions-and-control-flow",
      title: "Functions and Control Flow",
      moduleTitle: "JavaScript Basics",
    });
    expect(result.explanation).toBe("Great next step!");
    expect(result.answerSource).toBe("ai");
    expect(result.suggestedCourses).toEqual([]);
  });

  it("falls back to a deterministic explanation when the model output is unusable", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 2,
      completedLessons: 0,
      percentage: 0,
      isComplete: false,
      completedLessonSlugs: [],
    });
    resolveResumeLesson.mockResolvedValue({
      lesson: { id: "l1", slug: "variables-and-data-types", title: "Variables and Data Types", content: "..." },
      isCourseComplete: false,
    });

    const provider = fakeProvider("not valid json at all");
    const result = await getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider });

    expect(result.answerSource).toBe("fallback");
    expect(result.explanation).toContain("Variables and Data Types");
    expect(result.nextLesson?.slug).toBe("variables-and-data-types");
  });

  it("suggests related courses (grounded, not from the AI) once the course is complete", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 2,
      completedLessons: 2,
      percentage: 100,
      isComplete: true,
      completedLessonSlugs: ["variables-and-data-types", "functions-and-control-flow"],
    });
    resolveResumeLesson.mockResolvedValue({ lesson: syllabus[0].lessons[0], isCourseComplete: true });
    getRelatedCourses.mockResolvedValue([
      { slug: "python-for-data-science", title: "Python for Data Science" },
    ]);

    const provider = fakeProvider(JSON.stringify({ explanation: "Congrats!", studyTips: [] }));
    const result = await getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider });

    expect(result.isCourseComplete).toBe(true);
    expect(result.nextLesson).toBeNull();
    expect(result.suggestedCourses).toEqual([
      { slug: "python-for-data-science", title: "Python for Data Science" },
    ]);
  });

  it("propagates provider failures instead of masking them as a fallback", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 2,
      completedLessons: 0,
      percentage: 0,
      isComplete: false,
      completedLessonSlugs: [],
    });
    resolveResumeLesson.mockResolvedValue({ lesson: syllabus[0].lessons[0], isCourseComplete: false });

    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async () => {
        throw new Error("connection refused");
      },
    };

    await expect(
      getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider }),
    ).rejects.toThrow("connection refused");
  });

  it("forwards recentTutorHistory to the provider as prior chat turns", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 2,
      completedLessons: 0,
      percentage: 0,
      isComplete: false,
      completedLessonSlugs: [],
    });
    resolveResumeLesson.mockResolvedValue({ lesson: syllabus[0].lessons[0], isCourseComplete: false });

    let capturedMessageCount = 0;
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async (request) => {
        capturedMessageCount = request.messages.length;
        return JSON.stringify({ explanation: "ok", studyTips: [] });
      },
    };

    await getLearningCoachAdvice("student-1", "javascript-fundamentals", {
      provider,
      recentTutorHistory: [
        { role: "user", content: "Explain variables" },
        { role: "assistant", content: "A variable stores a value." },
      ],
    });

    // system + 2 history turns + final user message
    expect(capturedMessageCount).toBe(4);
  });
});
