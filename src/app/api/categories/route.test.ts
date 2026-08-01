import { beforeEach, describe, expect, it, vi } from "vitest";

const listCategories = vi.fn();

vi.mock("@/server/categories", () => ({
  listCategories: (...args: unknown[]) => listCategories(...args),
}));

const { GET } = await import("@/app/api/categories/route");

beforeEach(() => {
  listCategories.mockReset();
});

describe("GET /api/categories", () => {
  it("returns 200 with the categories from the service layer", async () => {
    listCategories.mockResolvedValue([{ id: "1", slug: "ai-for-business" }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toEqual([{ id: "1", slug: "ai-for-business" }]);
  });
});
