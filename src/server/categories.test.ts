import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const findFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findMany: (...args: unknown[]) => findMany(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
    },
  },
}));

const { listCategories, getCategoryBySlug } = await import("@/server/categories");

beforeEach(() => {
  findMany.mockReset();
  findFirst.mockReset();
});

describe("listCategories", () => {
  it("queries only active categories ordered by displayOrder ascending", async () => {
    findMany.mockResolvedValue([
      { id: "1", name: "AI for Business", slug: "ai-for-business", displayOrder: 1 },
    ]);

    await listCategories();

    expect(findMany).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });
  });

  it("returns the serialized category list", async () => {
    findMany.mockResolvedValue([
      { id: "1", name: "AI for Business", slug: "ai-for-business", displayOrder: 1 },
      { id: "2", name: "Cybersecurity", slug: "cybersecurity", displayOrder: 3 },
    ]);

    const result = await listCategories();

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("ai-for-business");
  });
});

describe("getCategoryBySlug", () => {
  it("scopes the lookup to active categories with the given slug", async () => {
    findFirst.mockResolvedValue(null);

    await getCategoryBySlug("cybersecurity");

    expect(findFirst).toHaveBeenCalledWith({
      where: { slug: "cybersecurity", active: true },
    });
  });

  it("returns null when no matching category exists", async () => {
    findFirst.mockResolvedValue(null);
    const result = await getCategoryBySlug("does-not-exist");
    expect(result).toBeNull();
  });

  it("returns the serialized category when found", async () => {
    findFirst.mockResolvedValue({ id: "1", name: "Cybersecurity", slug: "cybersecurity" });
    const result = await getCategoryBySlug("cybersecurity");
    expect(result).toEqual({ id: "1", name: "Cybersecurity", slug: "cybersecurity" });
  });
});
