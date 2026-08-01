import { describe, expect, it } from "vitest";
import { courseContentSeeds } from "@/seed-data/course-content";
import { courseSeeds } from "@/seed-data/courses";

describe("course content seed data", () => {
  it("seeds at least a few courses across different courses", () => {
    expect(courseContentSeeds.length).toBeGreaterThanOrEqual(3);
  });

  it("references only real, existing course slugs", () => {
    const validSlugs = new Set(courseSeeds.map((c) => c.slug));
    for (const content of courseContentSeeds) {
      expect(validSlugs.has(content.courseSlug)).toBe(true);
    }
  });

  it("references only PUBLISHED courses", () => {
    const coursesBySlug = new Map(courseSeeds.map((c) => [c.slug, c]));
    for (const content of courseContentSeeds) {
      expect(coursesBySlug.get(content.courseSlug)?.status).toBe("PUBLISHED");
    }
  });

  it("does not seed content twice for the same course", () => {
    const slugs = courseContentSeeds.map((c) => c.courseSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every course at least one module with at least one lesson", () => {
    for (const content of courseContentSeeds) {
      expect(content.modules.length).toBeGreaterThan(0);
      for (const courseModule of content.modules) {
        expect(courseModule.lessons.length).toBeGreaterThan(0);
      }
    }
  });

  it("has unique displayOrder values across modules within a course", () => {
    for (const content of courseContentSeeds) {
      const orders = content.modules.map((m) => m.displayOrder);
      expect(new Set(orders).size).toBe(orders.length);
    }
  });

  it("has unique lesson slugs within a course (across modules)", () => {
    for (const content of courseContentSeeds) {
      const slugs = content.modules.flatMap((m) => m.lessons.map((l) => l.slug));
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("has unique lesson displayOrder values within each module", () => {
    for (const content of courseContentSeeds) {
      for (const courseModule of content.modules) {
        const orders = courseModule.lessons.map((l) => l.displayOrder);
        expect(new Set(orders).size).toBe(orders.length);
      }
    }
  });

  it("gives every lesson meaningful, non-trivial content", () => {
    for (const content of courseContentSeeds) {
      for (const courseModule of content.modules) {
        for (const lesson of courseModule.lessons) {
          expect(lesson.content.length).toBeGreaterThan(200);
          expect(lesson.summary.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("does not make guaranteed income or job claims in lesson content", () => {
    const bannedPhrases = ["guaranteed income", "guaranteed job", "get rich"];
    for (const content of courseContentSeeds) {
      for (const courseModule of content.modules) {
        for (const lesson of courseModule.lessons) {
          const text = `${lesson.summary} ${lesson.content}`.toLowerCase();
          for (const phrase of bannedPhrases) {
            expect(text).not.toContain(phrase);
          }
        }
      }
    }
  });
});
