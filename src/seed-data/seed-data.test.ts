import { describe, expect, it } from "vitest";
import { categorySeeds } from "@/seed-data/categories";
import { courseSeeds } from "@/seed-data/courses";

/**
 * These checks validate the invariants that make `prisma/seed.ts` safe to
 * re-run: unique slugs (the upsert key) and every course pointing at a
 * category that actually exists. A live database isn't available in this
 * environment, so this is the practical stand-in for exercising seed
 * idempotency end to end.
 */
describe("category seed data", () => {
  it("defines exactly 16 categories", () => {
    expect(categorySeeds).toHaveLength(16);
  });

  it("has unique slugs suitable as an upsert key", () => {
    const slugs = categorySeeds.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique, sequential displayOrder values starting at 1", () => {
    const orders = categorySeeds.map((c) => c.displayOrder).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: categorySeeds.length }, (_, i) => i + 1));
  });

  it("marks every seeded category active", () => {
    expect(categorySeeds.every((c) => c.active)).toBe(true);
  });

  it("gives every category a non-empty description and icon", () => {
    for (const category of categorySeeds) {
      expect(category.description.length).toBeGreaterThan(0);
      expect(category.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("course seed data", () => {
  it("defines at least 45 courses", () => {
    expect(courseSeeds.length).toBeGreaterThanOrEqual(45);
  });

  it("has unique slugs suitable as an upsert key", () => {
    const slugs = courseSeeds.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("references only category slugs that exist in categorySeeds", () => {
    const validSlugs = new Set(categorySeeds.map((c) => c.slug));
    for (const course of courseSeeds) {
      expect(validSlugs.has(course.categorySlug)).toBe(true);
    }
  });

  it("gives every category at least 3 courses", () => {
    const counts = new Map<string, number>();
    for (const course of courseSeeds) {
      counts.set(course.categorySlug, (counts.get(course.categorySlug) ?? 0) + 1);
    }
    for (const category of categorySeeds) {
      expect(counts.get(category.slug) ?? 0).toBeGreaterThanOrEqual(3);
    }
  });

  it("includes a mix of beginner, intermediate, and advanced courses", () => {
    const levels = new Set(courseSeeds.map((c) => c.level));
    expect(levels.has("BEGINNER")).toBe(true);
    expect(levels.has("INTERMEDIATE")).toBe(true);
    expect(levels.has("ADVANCED")).toBe(true);
  });

  it("includes both free and paid courses", () => {
    expect(courseSeeds.some((c) => c.price === 0)).toBe(true);
    expect(courseSeeds.some((c) => c.price > 0)).toBe(true);
  });

  it("keeps every price within the $0-$3000 range", () => {
    for (const course of courseSeeds) {
      expect(course.price).toBeGreaterThanOrEqual(0);
      expect(course.price).toBeLessThanOrEqual(3000);
    }
  });

  it("includes at least one draft and one archived course for filter testing", () => {
    expect(courseSeeds.some((c) => c.status === "DRAFT")).toBe(true);
    expect(courseSeeds.some((c) => c.status === "ARCHIVED")).toBe(true);
  });

  it("has more published courses than non-published", () => {
    const published = courseSeeds.filter((c) => c.status === "PUBLISHED").length;
    const nonPublished = courseSeeds.length - published;
    expect(published).toBeGreaterThan(nonPublished);
  });

  it("uses clearly non-resolvable placeholder URLs for media", () => {
    for (const course of courseSeeds) {
      expect(course.thumbnailUrl).toContain("placeholder");
      if (course.promoVideoUrl) {
        expect(course.promoVideoUrl).toContain("placeholder");
      }
    }
  });

  it("does not make guaranteed income or job claims in descriptions", () => {
    const bannedPhrases = ["guaranteed income", "guaranteed job", "get rich"];
    for (const course of courseSeeds) {
      const text = `${course.shortDescription} ${course.fullDescription}`.toLowerCase();
      for (const phrase of bannedPhrases) {
        expect(text).not.toContain(phrase);
      }
    }
  });
});
