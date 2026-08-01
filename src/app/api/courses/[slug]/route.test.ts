import { beforeEach, describe, expect, it, vi } from "vitest";

const getCourseBySlug = vi.fn();
const getRelatedCourses = vi.fn();

vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
  getRelatedCourses: (...args: unknown[]) => getRelatedCourses(...args),
}));

const { GET } = await import("@/app/api/courses/[slug]/route");

beforeEach(() => {
  getCourseBySlug.mockReset();
  getRelatedCourses.mockReset();
});

function context(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/courses/[slug]", () => {
  it("returns the course, its category, and related courses for a published course", async () => {
    const course = {
      id: "course-1",
      slug: "python-for-data-science",
      category: { id: "cat-1", slug: "data-analytics-and-ai" },
    };
    getCourseBySlug.mockResolvedValue(course);
    getRelatedCourses.mockResolvedValue([{ id: "course-2" }]);

    const response = await GET(new Request("http://localhost"), context("python-for-data-science"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.course).toEqual(course);
    expect(body.category).toEqual(course.category);
    expect(body.relatedCourses).toEqual([{ id: "course-2" }]);
  });

  it("returns 404 when the course does not exist or isn't published", async () => {
    getCourseBySlug.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), context("does-not-exist"));

    expect(response.status).toBe(404);
    expect(getRelatedCourses).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed slug", async () => {
    const response = await GET(new Request("http://localhost"), context("Not A Valid Slug!"));
    expect(response.status).toBe(400);
    expect(getCourseBySlug).not.toHaveBeenCalled();
  });
});
