import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const findMany = vi.fn();
const count = vi.fn();
const findFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findMany: (...args: unknown[]) => findMany(...args),
      count: (...args: unknown[]) => count(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
    },
  },
}));

const { listCourses, getCourseBySlug, getRelatedCourses } = await import("@/server/courses");

const sampleCourse = {
  id: "course-1",
  categoryId: "cat-1",
  slug: "python-for-data-science",
  price: new Prisma.Decimal("349.00"),
  originalPrice: new Prisma.Decimal("429.00"),
  status: "PUBLISHED",
  category: { id: "cat-1", slug: "data-analytics-and-ai" },
};

beforeEach(() => {
  findMany.mockReset();
  count.mockReset();
  findFirst.mockReset();
});

describe("listCourses", () => {
  it("always restricts results to PUBLISHED courses", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await listCourses({ page: 1, limit: 12 });

    const whereArg = findMany.mock.calls[0][0].where;
    expect(whereArg.status).toBe("PUBLISHED");
    expect(count).toHaveBeenCalledWith({ where: whereArg });
  });

  it("applies skip/take based on page and limit", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await listCourses({ page: 3, limit: 10 });

    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 20, take: 10 });
  });

  it("returns serialized courses and pagination metadata", async () => {
    findMany.mockResolvedValue([sampleCourse]);
    count.mockResolvedValue(45);

    const result = await listCourses({ page: 1, limit: 12 });

    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].price).toBe("349.00");
    expect(result.pagination).toEqual({ page: 1, limit: 12, total: 45, totalPages: 4 });
  });

  it("passes category and level filters through to the where clause", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await listCourses({ page: 1, limit: 12, category: "cybersecurity", level: "ADVANCED" });

    const whereArg = findMany.mock.calls[0][0].where;
    expect(whereArg.category).toEqual({ slug: "cybersecurity" });
    expect(whereArg.level).toBe("ADVANCED");
  });
});

describe("getCourseBySlug", () => {
  it("requires PUBLISHED status in the query", async () => {
    findFirst.mockResolvedValue(null);

    await getCourseBySlug("python-for-data-science");

    expect(findFirst).toHaveBeenCalledWith({
      where: { slug: "python-for-data-science", status: "PUBLISHED" },
      include: { category: true },
    });
  });

  it("returns null for a missing course", async () => {
    findFirst.mockResolvedValue(null);
    const result = await getCourseBySlug("does-not-exist");
    expect(result).toBeNull();
  });

  it("returns null for an unpublished course (query never matches it)", async () => {
    // The where clause itself excludes non-PUBLISHED rows, so the mock
    // returning null here simulates the DB correctly filtering it out.
    findFirst.mockResolvedValue(null);
    const result = await getCourseBySlug("some-draft-course");
    expect(result).toBeNull();
  });

  it("returns the serialized course with prices as strings", async () => {
    findFirst.mockResolvedValue(sampleCourse);
    const result = await getCourseBySlug("python-for-data-science");
    expect(result?.price).toBe("349.00");
    expect(result?.originalPrice).toBe("429.00");
  });
});

describe("getRelatedCourses", () => {
  it("excludes the current course and filters by its category and PUBLISHED status", async () => {
    findMany.mockResolvedValue([]);

    await getRelatedCourses({ id: "course-1", categoryId: "cat-1" });

    expect(findMany).toHaveBeenCalledWith({
      where: { status: "PUBLISHED", categoryId: "cat-1", id: { not: "course-1" } },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
    });
  });
});
