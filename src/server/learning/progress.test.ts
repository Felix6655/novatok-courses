import { beforeEach, describe, expect, it, vi } from "vitest";

const lessonCount = vi.fn();
const lessonProgressFindMany = vi.fn();
const lessonProgressFindUnique = vi.fn();
const lessonProgressCreate = vi.fn();
const lessonProgressUpdate = vi.fn();
const getCourseBySlug = vi.fn();
const getLessonByCourseAndSlug = vi.fn();
const findEnrollment = vi.fn();
const touchEnrollmentAccess = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { count: (...args: unknown[]) => lessonCount(...args) },
    lessonProgress: {
      findMany: (...args: unknown[]) => lessonProgressFindMany(...args),
      findUnique: (...args: unknown[]) => lessonProgressFindUnique(...args),
      create: (...args: unknown[]) => lessonProgressCreate(...args),
      update: (...args: unknown[]) => lessonProgressUpdate(...args),
    },
  },
}));
vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
}));
vi.mock("@/server/course-content", () => ({
  getLessonByCourseAndSlug: (...args: unknown[]) => getLessonByCourseAndSlug(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  touchEnrollmentAccess: (...args: unknown[]) => touchEnrollmentAccess(...args),
}));

const { calculateCourseProgress, markLessonComplete } = await import("@/server/learning/progress");
const { EnrollmentCourseNotFoundError, LearningLessonNotFoundError, NotEnrolledError } = await import(
  "@/server/learning/errors"
);

const course = { id: "course-1", slug: "javascript-fundamentals" };
const lesson = { id: "lesson-1", slug: "variables-and-data-types", courseId: "course-1" };

beforeEach(() => {
  lessonCount.mockReset();
  lessonProgressFindMany.mockReset();
  lessonProgressFindUnique.mockReset();
  lessonProgressCreate.mockReset();
  lessonProgressUpdate.mockReset();
  getCourseBySlug.mockReset();
  getLessonByCourseAndSlug.mockReset();
  findEnrollment.mockReset();
  touchEnrollmentAccess.mockReset();
});

describe("calculateCourseProgress", () => {
  it("returns 0% for a course with no lessons, without dividing by zero", async () => {
    lessonCount.mockResolvedValue(0);
    lessonProgressFindMany.mockResolvedValue([]);

    const result = await calculateCourseProgress("student-1", "course-1");
    expect(result).toEqual({
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
      isComplete: false,
      completedLessonSlugs: [],
    });
  });

  it("calculates a partial percentage from real counts", async () => {
    lessonCount.mockResolvedValue(4);
    lessonProgressFindMany.mockResolvedValue([
      { lesson: { slug: "a" } },
      { lesson: { slug: "b" } },
    ]);

    const result = await calculateCourseProgress("student-1", "course-1");
    expect(result.percentage).toBe(50);
    expect(result.completedLessons).toBe(2);
    expect(result.isComplete).toBe(false);
    expect(result.completedLessonSlugs).toEqual(["a", "b"]);
  });

  it("reports isComplete when every lesson is completed", async () => {
    lessonCount.mockResolvedValue(2);
    lessonProgressFindMany.mockResolvedValue([{ lesson: { slug: "a" } }, { lesson: { slug: "b" } }]);

    const result = await calculateCourseProgress("student-1", "course-1");
    expect(result.percentage).toBe(100);
    expect(result.isComplete).toBe(true);
  });
});

describe("markLessonComplete", () => {
  it("throws EnrollmentCourseNotFoundError for an unknown/unpublished course", async () => {
    getCourseBySlug.mockResolvedValue(null);
    await expect(
      markLessonComplete("student-1", "not-a-real-course", "some-lesson"),
    ).rejects.toBeInstanceOf(EnrollmentCourseNotFoundError);
  });

  it("throws NotEnrolledError when the student isn't enrolled", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue(null);
    await expect(
      markLessonComplete("student-1", "javascript-fundamentals", "variables-and-data-types"),
    ).rejects.toBeInstanceOf(NotEnrolledError);
    expect(getLessonByCourseAndSlug).not.toHaveBeenCalled();
  });

  it("throws LearningLessonNotFoundError for a lesson that doesn't belong to the course", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(null);
    await expect(
      markLessonComplete("student-1", "javascript-fundamentals", "a-lesson-from-another-course"),
    ).rejects.toBeInstanceOf(LearningLessonNotFoundError);
  });

  it("creates a new progress row with completedAt set when none exists", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(lesson);
    lessonProgressFindUnique.mockResolvedValue(null);
    lessonProgressCreate.mockResolvedValue({ id: "prog-1", completedAt: new Date() });
    lessonCount.mockResolvedValue(1);
    lessonProgressFindMany.mockResolvedValue([{ lesson: { slug: "variables-and-data-types" } }]);

    const result = await markLessonComplete(
      "student-1",
      "javascript-fundamentals",
      "variables-and-data-types",
    );

    expect(lessonProgressCreate).toHaveBeenCalledWith({
      data: { studentId: "student-1", courseId: "course-1", lessonId: "lesson-1", completedAt: expect.any(Date) },
    });
    expect(touchEnrollmentAccess).toHaveBeenCalledWith("student-1", "course-1", "lesson-1");
    expect(result.courseProgress.isComplete).toBe(true);
  });

  it("is idempotent: completing an already-completed lesson doesn't change completedAt", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(lesson);
    const originalCompletedAt = new Date("2026-01-01T00:00:00.000Z");
    lessonProgressFindUnique.mockResolvedValue({ id: "prog-1", completedAt: originalCompletedAt });
    lessonCount.mockResolvedValue(1);
    lessonProgressFindMany.mockResolvedValue([{ lesson: { slug: "variables-and-data-types" } }]);

    const result = await markLessonComplete(
      "student-1",
      "javascript-fundamentals",
      "variables-and-data-types",
    );

    expect(lessonProgressCreate).not.toHaveBeenCalled();
    expect(lessonProgressUpdate).not.toHaveBeenCalled();
    expect(result.progress.completedAt).toBe(originalCompletedAt.toISOString());
  });

  it("marks a started-but-not-completed row complete", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(lesson);
    lessonProgressFindUnique.mockResolvedValue({ id: "prog-1", completedAt: null });
    lessonProgressUpdate.mockResolvedValue({ id: "prog-1", completedAt: new Date() });
    lessonCount.mockResolvedValue(1);
    lessonProgressFindMany.mockResolvedValue([{ lesson: { slug: "variables-and-data-types" } }]);

    await markLessonComplete("student-1", "javascript-fundamentals", "variables-and-data-types");

    expect(lessonProgressUpdate).toHaveBeenCalledWith({
      where: { id: "prog-1" },
      data: { completedAt: expect.any(Date) },
    });
  });
});
