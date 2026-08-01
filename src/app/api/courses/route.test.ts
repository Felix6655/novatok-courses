import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listCourses = vi.fn();

vi.mock("@/server/courses", () => ({
  listCourses: (...args: unknown[]) => listCourses(...args),
}));

const { GET } = await import("@/app/api/courses/route");

beforeEach(() => {
  listCourses.mockReset();
});

function request(query: string) {
  return new NextRequest(`http://localhost/api/courses${query}`);
}

describe("GET /api/courses", () => {
  it("returns 200 with the service result for valid params", async () => {
    listCourses.mockResolvedValue({
      courses: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });

    const response = await GET(request("?search=python&level=BEGINNER"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.pagination).toEqual({ page: 1, limit: 12, total: 0, totalPages: 0 });
    expect(listCourses).toHaveBeenCalledWith(
      expect.objectContaining({ search: "python", level: "BEGINNER", page: 1, limit: 12 }),
    );
  });

  it("returns 400 for an invalid level value", async () => {
    const response = await GET(request("?level=NOT_A_LEVEL"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid query parameters");
    expect(listCourses).not.toHaveBeenCalled();
  });

  it("returns 400 when limit exceeds the maximum page size", async () => {
    const response = await GET(request("?limit=200"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when minPrice is greater than maxPrice", async () => {
    const response = await GET(request("?minPrice=500&maxPrice=100"));
    expect(response.status).toBe(400);
  });

  it("returns 400 for a non-numeric page value", async () => {
    const response = await GET(request("?page=abc"));
    expect(response.status).toBe(400);
  });
});
