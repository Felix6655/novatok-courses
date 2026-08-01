import { beforeEach, describe, expect, it, vi } from "vitest";

const moduleFindMany = vi.fn();
const lessonFindMany = vi.fn();
const lessonFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseModule: { findMany: (...args: unknown[]) => moduleFindMany(...args) },
    lesson: {
      findMany: (...args: unknown[]) => lessonFindMany(...args),
      findUnique: (...args: unknown[]) => lessonFindUnique(...args),
    },
  },
}));

const { getCourseModulesWithLessons, getCourseLessonsFlat, getLessonByCourseAndSlug } = await import(
  "@/server/course-content"
);

beforeEach(() => {
  moduleFindMany.mockReset();
  lessonFindMany.mockReset();
  lessonFindUnique.mockReset();
});

describe("getCourseModulesWithLessons", () => {
  it("queries modules for the course, ordered, with ordered lessons included", async () => {
    moduleFindMany.mockResolvedValue([]);
    await getCourseModulesWithLessons("course-1");

    expect(moduleFindMany).toHaveBeenCalledWith({
      where: { courseId: "course-1" },
      include: { lessons: { orderBy: { displayOrder: "asc" } } },
      orderBy: { displayOrder: "asc" },
    });
  });
});

describe("getCourseLessonsFlat", () => {
  it("queries all lessons for the course ordered by module then lesson order", async () => {
    lessonFindMany.mockResolvedValue([]);
    await getCourseLessonsFlat("course-1");

    expect(lessonFindMany).toHaveBeenCalledWith({
      where: { courseId: "course-1" },
      orderBy: [{ module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    });
  });
});

describe("getLessonByCourseAndSlug", () => {
  it("looks up a lesson by the compound courseId+slug key", async () => {
    lessonFindUnique.mockResolvedValue(null);
    await getLessonByCourseAndSlug("course-1", "variables-and-data-types");

    expect(lessonFindUnique).toHaveBeenCalledWith({
      where: { courseId_slug: { courseId: "course-1", slug: "variables-and-data-types" } },
    });
  });

  it("returns null when no lesson matches", async () => {
    lessonFindUnique.mockResolvedValue(null);
    const result = await getLessonByCourseAndSlug("course-1", "missing");
    expect(result).toBeNull();
  });

  it("returns the serialized lesson when found", async () => {
    lessonFindUnique.mockResolvedValue({ id: "l1", slug: "variables-and-data-types" });
    const result = await getLessonByCourseAndSlug("course-1", "variables-and-data-types");
    expect(result).toEqual({ id: "l1", slug: "variables-and-data-types" });
  });
});
