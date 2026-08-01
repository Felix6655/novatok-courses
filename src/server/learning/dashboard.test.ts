import { beforeEach, describe, expect, it, vi } from "vitest";

const enrollmentFindMany = vi.fn();
const activityFindMany = vi.fn();
const calculateCourseProgress = vi.fn();
const getReviewCandidates = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    studentEnrollment: { findMany: (...args: unknown[]) => enrollmentFindMany(...args) },
    learningActivity: { findMany: (...args: unknown[]) => activityFindMany(...args) },
  },
}));
vi.mock("@/server/learning/progress", () => ({
  calculateCourseProgress: (...args: unknown[]) => calculateCourseProgress(...args),
}));
vi.mock("@/server/learning/review-recommendations", () => ({
  getReviewCandidates: (...args: unknown[]) => getReviewCandidates(...args),
}));

const { getRecentActivity, getStudentDashboard } = await import("@/server/learning/dashboard");

beforeEach(() => {
  enrollmentFindMany.mockReset();
  activityFindMany.mockReset();
  calculateCourseProgress.mockReset();
  getReviewCandidates.mockReset();
  getReviewCandidates.mockResolvedValue([]);
});

describe("getStudentDashboard", () => {
  it("scopes to the given student and orders by lastAccessedAt desc", async () => {
    enrollmentFindMany.mockResolvedValue([]);
    await getStudentDashboard("student-1");
    expect(enrollmentFindMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      include: { course: { include: { category: true } }, currentLesson: true },
      orderBy: { lastAccessedAt: "desc" },
    });
  });

  it("attaches real calculated progress to each enrollment", async () => {
    enrollmentFindMany.mockResolvedValue([
      {
        courseId: "course-1",
        course: { id: "course-1", slug: "javascript-fundamentals", category: { name: "Software Development" } },
        currentLesson: { slug: "variables-and-data-types" },
        lastAccessedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 4,
      completedLessons: 2,
      percentage: 50,
      isComplete: false,
      completedLessonSlugs: ["a", "b"],
    });

    const result = await getStudentDashboard("student-1");

    expect(result).toHaveLength(1);
    expect(result[0].course.slug).toBe("javascript-fundamentals");
    expect(result[0].progress.percentage).toBe(50);
    expect(result[0].currentLessonSlug).toBe("variables-and-data-types");
    expect(result[0].lastAccessedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(calculateCourseProgress).toHaveBeenCalledWith("student-1", "course-1");
  });

  it("returns null currentLessonSlug when the enrollment has no current lesson yet", async () => {
    enrollmentFindMany.mockResolvedValue([
      {
        courseId: "course-1",
        course: { id: "course-1", slug: "javascript-fundamentals", category: { name: "Software Development" } },
        currentLesson: null,
        lastAccessedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 4,
      completedLessons: 0,
      percentage: 0,
      isComplete: false,
      completedLessonSlugs: [],
    });

    const result = await getStudentDashboard("student-1");
    expect(result[0].currentLessonSlug).toBeNull();
  });

  it("attaches a real review-candidate count from getReviewCandidates, sourced from PostgreSQL", async () => {
    enrollmentFindMany.mockResolvedValue([
      {
        courseId: "course-1",
        course: { id: "course-1", slug: "javascript-fundamentals", category: { name: "Software Development" } },
        currentLesson: null,
        lastAccessedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    calculateCourseProgress.mockResolvedValue({
      totalLessons: 4,
      completedLessons: 0,
      percentage: 0,
      isComplete: false,
      completedLessonSlugs: [],
    });
    getReviewCandidates.mockResolvedValue([
      { lessonSlug: "a", lessonTitle: "A", moduleTitle: "M", reason: "low accuracy" },
    ]);

    const result = await getStudentDashboard("student-1");
    expect(result[0].reviewCandidateCount).toBe(1);
    expect(getReviewCandidates).toHaveBeenCalledWith("student-1", "course-1");
  });
});

describe("getRecentActivity", () => {
  it("scopes to the given student, orders by most recent, and formats course/lesson titles", async () => {
    activityFindMany.mockResolvedValue([
      {
        id: "act-1",
        type: "LESSON_COMPLETED",
        course: { slug: "javascript-fundamentals", title: "JavaScript Fundamentals" },
        lesson: { title: "Variables and Data Types" },
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
      {
        id: "act-2",
        type: "COACH_REQUEST",
        course: { slug: "javascript-fundamentals", title: "JavaScript Fundamentals" },
        lesson: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);

    const result = await getRecentActivity("student-1");

    expect(activityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: "student-1" }, orderBy: { createdAt: "desc" } }),
    );
    expect(result[0]).toEqual({
      id: "act-1",
      type: "LESSON_COMPLETED",
      courseSlug: "javascript-fundamentals",
      courseTitle: "JavaScript Fundamentals",
      lessonTitle: "Variables and Data Types",
      occurredAt: "2026-01-02T00:00:00.000Z",
    });
    expect(result[1].lessonTitle).toBeNull();
  });
});
