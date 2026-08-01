import { beforeEach, describe, expect, it, vi } from "vitest";

const getCourseBySlug = vi.fn();
const getCourseModulesWithLessons = vi.fn();
const getLessonByCourseAndSlug = vi.fn();
const findEnrollment = vi.fn();
const touchEnrollmentAccess = vi.fn();
const calculateCourseProgress = vi.fn();
const resolveResumeLesson = vi.fn();

vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
}));
vi.mock("@/server/course-content", () => ({
  getCourseModulesWithLessons: (...args: unknown[]) => getCourseModulesWithLessons(...args),
  getLessonByCourseAndSlug: (...args: unknown[]) => getLessonByCourseAndSlug(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  touchEnrollmentAccess: (...args: unknown[]) => touchEnrollmentAccess(...args),
}));
vi.mock("@/server/learning/progress", () => ({
  calculateCourseProgress: (...args: unknown[]) => calculateCourseProgress(...args),
}));
vi.mock("@/server/learning/resume", () => ({
  resolveResumeLesson: (...args: unknown[]) => resolveResumeLesson(...args),
}));

const { getLearningState } = await import("@/server/learning/learning-state");
const { EnrollmentCourseNotFoundError, LearningLessonNotFoundError } = await import(
  "@/server/learning/errors"
);

const course = { id: "course-1", slug: "javascript-fundamentals", title: "JavaScript Fundamentals" };
const syllabus = [{ id: "m1", lessons: [{ id: "l1", slug: "variables-and-data-types" }] }];

beforeEach(() => {
  getCourseBySlug.mockReset();
  getCourseModulesWithLessons.mockReset();
  getLessonByCourseAndSlug.mockReset();
  findEnrollment.mockReset();
  touchEnrollmentAccess.mockReset();
  calculateCourseProgress.mockReset();
  resolveResumeLesson.mockReset();
});

describe("getLearningState", () => {
  it("throws EnrollmentCourseNotFoundError for an unknown/unpublished course", async () => {
    getCourseBySlug.mockResolvedValue(null);
    await expect(getLearningState("student-1", "not-a-real-course")).rejects.toBeInstanceOf(
      EnrollmentCourseNotFoundError,
    );
  });

  it("returns not-enrolled status when the student has no enrollment", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue(null);

    const result = await getLearningState("student-1", "javascript-fundamentals");
    expect(result).toEqual({ status: "not-enrolled", course });
    expect(getCourseModulesWithLessons).not.toHaveBeenCalled();
  });

  it("returns empty status when the course has no lesson content", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue([{ id: "m1", lessons: [] }]);

    const result = await getLearningState("student-1", "javascript-fundamentals");
    expect(result).toEqual({ status: "empty", course });
  });

  it("uses the deterministic resume lesson when no lessonSlug is requested", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    resolveResumeLesson.mockResolvedValue({ lesson: syllabus[0].lessons[0], isCourseComplete: false });
    calculateCourseProgress.mockResolvedValue({ totalLessons: 1, completedLessons: 0, percentage: 0, isComplete: false, completedLessonSlugs: [] });

    const result = await getLearningState("student-1", "javascript-fundamentals");
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.currentLesson.slug).toBe("variables-and-data-types");
    }
    expect(getLessonByCourseAndSlug).not.toHaveBeenCalled();
    expect(touchEnrollmentAccess).toHaveBeenCalledWith("student-1", "course-1", "l1");
  });

  it("uses the explicitly requested lessonSlug when valid for this course", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    getLessonByCourseAndSlug.mockResolvedValue({ id: "l1", slug: "variables-and-data-types" });
    calculateCourseProgress.mockResolvedValue({ totalLessons: 1, completedLessons: 0, percentage: 0, isComplete: false, completedLessonSlugs: [] });

    const result = await getLearningState(
      "student-1",
      "javascript-fundamentals",
      "variables-and-data-types",
    );
    expect(result.status).toBe("ready");
    expect(resolveResumeLesson).not.toHaveBeenCalled();
  });

  it("throws LearningLessonNotFoundError for an invalid/cross-course lessonSlug", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getCourseModulesWithLessons.mockResolvedValue(syllabus);
    getLessonByCourseAndSlug.mockResolvedValue(null);

    await expect(
      getLearningState("student-1", "javascript-fundamentals", "a-lesson-from-another-course"),
    ).rejects.toBeInstanceOf(LearningLessonNotFoundError);
  });
});
