import { beforeEach, describe, expect, it, vi } from "vitest";

const getCourseLessonsFlat = vi.fn();
const findEnrollment = vi.fn();
const lessonProgressFindMany = vi.fn();

vi.mock("@/server/course-content", () => ({
  getCourseLessonsFlat: (...args: unknown[]) => getCourseLessonsFlat(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { lessonProgress: { findMany: (...args: unknown[]) => lessonProgressFindMany(...args) } },
}));

const { resolveResumeLesson } = await import("@/server/learning/resume");

const lessons = [
  { id: "l1", slug: "a" },
  { id: "l2", slug: "b" },
  { id: "l3", slug: "c" },
];

beforeEach(() => {
  getCourseLessonsFlat.mockReset();
  findEnrollment.mockReset();
  lessonProgressFindMany.mockReset();
});

describe("resolveResumeLesson", () => {
  it("returns no lesson when the course has none", async () => {
    getCourseLessonsFlat.mockResolvedValue([]);
    const result = await resolveResumeLesson("student-1", "course-1");
    expect(result).toEqual({ lesson: null, isCourseComplete: false });
  });

  it("resumes at currentLessonId when it's still incomplete", async () => {
    getCourseLessonsFlat.mockResolvedValue(lessons);
    findEnrollment.mockResolvedValue({ currentLessonId: "l2" });
    lessonProgressFindMany.mockResolvedValue([{ lessonId: "l1" }]);

    const result = await resolveResumeLesson("student-1", "course-1");
    expect(result).toEqual({ lesson: lessons[1], isCourseComplete: false });
  });

  it("falls back to the first incomplete lesson when currentLessonId is already completed", async () => {
    getCourseLessonsFlat.mockResolvedValue(lessons);
    findEnrollment.mockResolvedValue({ currentLessonId: "l1" });
    lessonProgressFindMany.mockResolvedValue([{ lessonId: "l1" }]);

    const result = await resolveResumeLesson("student-1", "course-1");
    expect(result).toEqual({ lesson: lessons[1], isCourseComplete: false });
  });

  it("falls back to the first incomplete lesson when there's no enrollment record yet", async () => {
    getCourseLessonsFlat.mockResolvedValue(lessons);
    findEnrollment.mockResolvedValue(null);
    lessonProgressFindMany.mockResolvedValue([]);

    const result = await resolveResumeLesson("student-1", "course-1");
    expect(result).toEqual({ lesson: lessons[0], isCourseComplete: false });
  });

  it("reports isCourseComplete when every lesson is completed", async () => {
    getCourseLessonsFlat.mockResolvedValue(lessons);
    findEnrollment.mockResolvedValue({ currentLessonId: "l3" });
    lessonProgressFindMany.mockResolvedValue([{ lessonId: "l1" }, { lessonId: "l2" }, { lessonId: "l3" }]);

    const result = await resolveResumeLesson("student-1", "course-1");
    expect(result.isCourseComplete).toBe(true);
  });
});
