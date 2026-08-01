import { beforeEach, describe, expect, it, vi } from "vitest";

const activityFindMany = vi.fn();
const activityCount = vi.fn();
const findEnrollment = vi.fn();
const getCourseLessonsFlat = vi.fn();
const calculateCourseProgress = vi.fn();
const resolveResumeLesson = vi.fn();
const getReviewCandidates = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    learningActivity: {
      findMany: (...args: unknown[]) => activityFindMany(...args),
      count: (...args: unknown[]) => activityCount(...args),
    },
  },
}));
vi.mock("@/server/course-content", () => ({
  getCourseLessonsFlat: (...args: unknown[]) => getCourseLessonsFlat(...args),
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
vi.mock("@/server/learning/review-recommendations", () => ({
  getReviewCandidates: (...args: unknown[]) => getReviewCandidates(...args),
}));

const { getLearningSignals } = await import("@/server/learning/learning-signals");

const flatLessons = [
  { id: "l1", slug: "variables-and-data-types", title: "Variables and Data Types" },
  { id: "l2", slug: "functions-and-control-flow", title: "Functions and Control Flow" },
];

beforeEach(() => {
  activityFindMany.mockReset();
  activityCount.mockReset();
  findEnrollment.mockReset();
  getCourseLessonsFlat.mockReset();
  calculateCourseProgress.mockReset();
  resolveResumeLesson.mockReset();
  getReviewCandidates.mockReset();

  getCourseLessonsFlat.mockResolvedValue(flatLessons);
  calculateCourseProgress.mockResolvedValue({
    totalLessons: 2,
    completedLessons: 1,
    percentage: 50,
    isComplete: false,
    completedLessonSlugs: ["variables-and-data-types"],
  });
  activityCount.mockResolvedValue(0);
  activityFindMany.mockResolvedValue([]);
  getReviewCandidates.mockResolvedValue([]);
});

describe("getLearningSignals", () => {
  it("reports null recentPracticeAccuracy when there are no recent practice attempts", async () => {
    findEnrollment.mockResolvedValue({ currentLessonId: null });
    resolveResumeLesson.mockResolvedValue({ lesson: flatLessons[1], isCourseComplete: false });

    const signals = await getLearningSignals("student-1", "course-1");
    expect(signals.recentPracticeAccuracy).toBeNull();
    expect(signals.recentPracticeAttempts).toBe(0);
  });

  it("computes recentPracticeAccuracy from real recent PRACTICE_ATTEMPT metadata", async () => {
    findEnrollment.mockResolvedValue({ currentLessonId: null });
    resolveResumeLesson.mockResolvedValue({ lesson: flatLessons[1], isCourseComplete: false });
    activityFindMany.mockResolvedValue([
      { metadata: { correct: true } },
      { metadata: { correct: true } },
      { metadata: { correct: false } },
      { metadata: { correct: true } },
    ]);

    const signals = await getLearningSignals("student-1", "course-1");
    expect(signals.recentPracticeAttempts).toBe(4);
    expect(signals.recentPracticeAccuracy).toBe(0.75);
  });

  it("resolves currentLesson from the enrollment's currentLessonId", async () => {
    findEnrollment.mockResolvedValue({ currentLessonId: "l1" });
    resolveResumeLesson.mockResolvedValue({ lesson: flatLessons[1], isCourseComplete: false });

    const signals = await getLearningSignals("student-1", "course-1");
    expect(signals.currentLesson).toEqual({
      slug: "variables-and-data-types",
      title: "Variables and Data Types",
    });
  });

  it("resolves nextLesson from resolveResumeLesson, and sets it null once the course is complete", async () => {
    findEnrollment.mockResolvedValue({ currentLessonId: null });
    resolveResumeLesson.mockResolvedValue({ lesson: flatLessons[0], isCourseComplete: true });

    const signals = await getLearningSignals("student-1", "course-1");
    expect(signals.nextLesson).toBeNull();
    expect(signals.isCourseComplete).toBe(true);
  });

  it("passes through completedLessons/totalLessons from calculateCourseProgress", async () => {
    findEnrollment.mockResolvedValue({ currentLessonId: null });
    resolveResumeLesson.mockResolvedValue({ lesson: null, isCourseComplete: false });

    const signals = await getLearningSignals("student-1", "course-1");
    expect(signals.completedLessons).toBe(1);
    expect(signals.totalLessons).toBe(2);
  });

  it("passes through lessonsNeedingPractice from getReviewCandidates unmodified", async () => {
    findEnrollment.mockResolvedValue({ currentLessonId: null });
    resolveResumeLesson.mockResolvedValue({ lesson: null, isCourseComplete: false });
    const candidate = {
      lessonSlug: "variables-and-data-types",
      lessonTitle: "Variables and Data Types",
      moduleTitle: "Basics",
      reason: "correct on only 25% of 4 recent practice attempts",
    };
    getReviewCandidates.mockResolvedValue([candidate]);

    const signals = await getLearningSignals("student-1", "course-1");
    expect(signals.lessonsNeedingPractice).toEqual([candidate]);
  });
});
