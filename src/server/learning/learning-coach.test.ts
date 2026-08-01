import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";

const getCourseBySlug = vi.fn();
const getRelatedCourses = vi.fn();
const findEnrollment = vi.fn();
const getCourseModulesWithLessons = vi.fn();
const calculateCourseProgress = vi.fn();
const getLearningSignals = vi.fn();
const recordLearningActivity = vi.fn();

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
vi.mock("@/server/learning/learning-signals", () => ({
  getLearningSignals: (...args: unknown[]) => getLearningSignals(...args),
}));
vi.mock("@/server/learning/activity", () => ({
  recordLearningActivity: (...args: unknown[]) => recordLearningActivity(...args),
}));

const { getLearningCoachAdvice } = await import("@/server/learning/learning-coach");
const { EnrollmentCourseNotFoundError, NotEnrolledError } = await import("@/server/learning/errors");

const course = { id: "course-1", slug: "javascript-fundamentals", title: "JavaScript Fundamentals" };
const syllabus = [
  {
    id: "m1",
    title: "JavaScript Basics",
    lessons: [
      { id: "l1", slug: "variables-and-data-types", title: "Variables and Data Types", content: "..." },
      { id: "l2", slug: "functions-and-control-flow", title: "Functions and Control Flow", content: "..." },
    ],
  },
];

const baseProgress = {
  totalLessons: 2,
  completedLessons: 1,
  percentage: 50,
  isComplete: false,
  completedLessonSlugs: ["variables-and-data-types"],
};

const baseSignals = {
  completedLessons: 1,
  totalLessons: 2,
  recentPracticeAccuracy: null,
  recentPracticeAttempts: 0,
  recentTutorQuestions: 0,
  lessonsNeedingPractice: [],
  currentLesson: { slug: "variables-and-data-types", title: "Variables and Data Types" },
  nextLesson: { slug: "functions-and-control-flow", title: "Functions and Control Flow" },
  isCourseComplete: false,
};

function fakeProvider(response: string): AIProvider {
  return { name: "fake", generateCompletion: async () => response };
}

beforeEach(() => {
  getCourseBySlug.mockReset();
  getRelatedCourses.mockReset();
  findEnrollment.mockReset();
  getCourseModulesWithLessons.mockReset();
  calculateCourseProgress.mockReset();
  getLearningSignals.mockReset();
  recordLearningActivity.mockReset();
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
    expect(recordLearningActivity).not.toHaveBeenCalled();
  });

  it("sources nextLesson entirely from getLearningSignals (resolveResumeLesson), never from the AI", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue(baseProgress);
    getLearningSignals.mockResolvedValue(baseSignals);

    const provider = fakeProvider(
      JSON.stringify({
        explanation: "Great next step!",
        studyTips: ["Practice writing small functions."],
        practiceSuggestion: null,
      }),
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
    expect(result.signals).toEqual({
      completedLessons: 1,
      totalLessons: 2,
      recentPracticeAccuracy: null,
      recentPracticeAttempts: 0,
    });
    expect(recordLearningActivity).toHaveBeenCalledWith({
      studentId: "student-1",
      courseId: "course-1",
      type: "COACH_REQUEST",
    });
  });

  it("echoes reviewCandidates entirely from getLearningSignals, never from the AI", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue(baseProgress);
    const reviewCandidate = {
      lessonSlug: "variables-and-data-types",
      lessonTitle: "Variables and Data Types",
      moduleTitle: "JavaScript Basics",
      reason: "correct on only 25% of 4 recent practice attempts",
    };
    getLearningSignals.mockResolvedValue({ ...baseSignals, lessonsNeedingPractice: [reviewCandidate] });

    const provider = fakeProvider(
      JSON.stringify({ explanation: "ok", studyTips: [], practiceSuggestion: "Review variables again." }),
    );
    const result = await getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider });

    expect(result.reviewCandidates).toEqual([reviewCandidate]);
    expect(result.practiceSuggestion).toBe("Review variables again.");
  });

  it("falls back to a deterministic explanation when the model output is unusable", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      ...baseProgress,
      completedLessons: 0,
      percentage: 0,
      completedLessonSlugs: [],
    });
    getLearningSignals.mockResolvedValue({
      ...baseSignals,
      completedLessons: 0,
      currentLesson: null,
      nextLesson: { slug: "variables-and-data-types", title: "Variables and Data Types" },
    });

    const provider = fakeProvider("not valid json at all");
    const result = await getLearningCoachAdvice("student-1", "javascript-fundamentals", { provider });

    expect(result.answerSource).toBe("fallback");
    expect(result.explanation).toContain("Variables and Data Types");
    expect(result.nextLesson?.slug).toBe("variables-and-data-types");
    expect(result.practiceSuggestion).toBeNull();
  });

  it("suggests related courses (grounded, not from the AI) once the course is complete", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    calculateCourseProgress.mockResolvedValue({
      ...baseProgress,
      completedLessons: 2,
      percentage: 100,
      isComplete: true,
      completedLessonSlugs: ["variables-and-data-types", "functions-and-control-flow"],
    });
    getLearningSignals.mockResolvedValue({ ...baseSignals, nextLesson: null, isCourseComplete: true });
    getRelatedCourses.mockResolvedValue([
      { slug: "python-for-data-science", title: "Python for Data Science" },
    ]);

    const provider = fakeProvider(
      JSON.stringify({ explanation: "Congrats!", studyTips: [], practiceSuggestion: null }),
    );
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
      ...baseProgress,
      completedLessons: 0,
      percentage: 0,
      completedLessonSlugs: [],
    });
    getLearningSignals.mockResolvedValue({ ...baseSignals, completedLessons: 0 });

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
      ...baseProgress,
      completedLessons: 0,
      percentage: 0,
      completedLessonSlugs: [],
    });
    getLearningSignals.mockResolvedValue({ ...baseSignals, completedLessons: 0 });

    let capturedMessageCount = 0;
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async (request) => {
        capturedMessageCount = request.messages.length;
        return JSON.stringify({ explanation: "ok", studyTips: [], practiceSuggestion: null });
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
