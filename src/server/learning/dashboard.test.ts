import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const calculateCourseProgress = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { studentEnrollment: { findMany: (...args: unknown[]) => findMany(...args) } },
}));
vi.mock("@/server/learning/progress", () => ({
  calculateCourseProgress: (...args: unknown[]) => calculateCourseProgress(...args),
}));

const { getStudentDashboard } = await import("@/server/learning/dashboard");

beforeEach(() => {
  findMany.mockReset();
  calculateCourseProgress.mockReset();
});

describe("getStudentDashboard", () => {
  it("scopes to the given student and orders by lastAccessedAt desc", async () => {
    findMany.mockResolvedValue([]);
    await getStudentDashboard("student-1");
    expect(findMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      include: { course: { include: { category: true } }, currentLesson: true },
      orderBy: { lastAccessedAt: "desc" },
    });
  });

  it("attaches real calculated progress to each enrollment", async () => {
    findMany.mockResolvedValue([
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
    findMany.mockResolvedValue([
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
});
