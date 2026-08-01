import { describe, expect, it } from "vitest";
import { buildCourseWhere, computePagination } from "@/server/course-query-builder";

describe("buildCourseWhere", () => {
  it("always restricts to PUBLISHED courses", () => {
    expect(buildCourseWhere({})).toEqual({ status: "PUBLISHED" });
  });

  it("filters by category slug", () => {
    expect(buildCourseWhere({ category: "cybersecurity" })).toMatchObject({
      category: { slug: "cybersecurity" },
    });
  });

  it("filters by level", () => {
    expect(buildCourseWhere({ level: "ADVANCED" })).toMatchObject({ level: "ADVANCED" });
  });

  it("filters by featured true", () => {
    expect(buildCourseWhere({ featured: true })).toMatchObject({ featured: true });
  });

  it("filters by featured false explicitly (not omitted)", () => {
    expect(buildCourseWhere({ featured: false })).toMatchObject({ featured: false });
  });

  it("omits featured entirely when undefined", () => {
    const where = buildCourseWhere({});
    expect(where).not.toHaveProperty("featured");
  });

  it("applies a minimum price filter", () => {
    expect(buildCourseWhere({ minPrice: 50 })).toMatchObject({ price: { gte: 50 } });
  });

  it("applies a maximum price filter", () => {
    expect(buildCourseWhere({ maxPrice: 500 })).toMatchObject({ price: { lte: 500 } });
  });

  it("applies both minimum and maximum price filters together", () => {
    expect(buildCourseWhere({ minPrice: 50, maxPrice: 500 })).toMatchObject({
      price: { gte: 50, lte: 500 },
    });
  });

  it("builds a case-insensitive OR search across title and both descriptions", () => {
    const where = buildCourseWhere({ search: "python" });
    expect(where.OR).toEqual([
      { title: { contains: "python", mode: "insensitive" } },
      { shortDescription: { contains: "python", mode: "insensitive" } },
      { fullDescription: { contains: "python", mode: "insensitive" } },
    ]);
  });

  it("combines search, category, level, featured, and price filters", () => {
    const where = buildCourseWhere({
      search: "sql",
      category: "data-analytics-and-ai",
      level: "BEGINNER",
      featured: true,
      minPrice: 0,
      maxPrice: 200,
    });
    expect(where).toMatchObject({
      status: "PUBLISHED",
      category: { slug: "data-analytics-and-ai" },
      level: "BEGINNER",
      featured: true,
      price: { gte: 0, lte: 200 },
    });
    expect(where.OR).toBeDefined();
  });
});

describe("computePagination", () => {
  it("computes totalPages by ceiling division", () => {
    expect(computePagination(45, 1, 12)).toEqual({
      page: 1,
      limit: 12,
      total: 45,
      totalPages: 4,
    });
  });

  it("returns 0 total pages when there are no results", () => {
    expect(computePagination(0, 1, 12)).toEqual({
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    });
  });

  it("returns exactly 1 page when total equals limit", () => {
    expect(computePagination(12, 1, 12).totalPages).toBe(1);
  });

  it("reflects the requested page and limit even beyond the last page", () => {
    expect(computePagination(5, 9, 12)).toEqual({
      page: 9,
      limit: 12,
      total: 5,
      totalPages: 1,
    });
  });
});
