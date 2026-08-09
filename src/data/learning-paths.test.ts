import { describe, expect, it } from "vitest";
import { learningPathSeeds } from "@/data/learning-paths";
import { courseSeeds } from "@/seed-data/courses";

describe("learning path data", () => {
  it("defines at least 8 paths", () => {
    expect(learningPathSeeds.length).toBeGreaterThanOrEqual(8);
  });

  it("has unique slugs", () => {
    const slugs = learningPathSeeds.map((path) => path.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("references only real course slugs", () => {
    const validSlugs = new Set(courseSeeds.map((course) => course.slug));
    for (const path of learningPathSeeds) {
      for (const courseSlug of path.courseSlugs) {
        expect(validSlugs.has(courseSlug)).toBe(true);
      }
    }
  });

  it("references only PUBLISHED courses", () => {
    const coursesBySlug = new Map(courseSeeds.map((course) => [course.slug, course]));
    for (const path of learningPathSeeds) {
      for (const courseSlug of path.courseSlugs) {
        expect(coursesBySlug.get(courseSlug)?.status).toBe("PUBLISHED");
      }
    }
  });

  it("gives every path at least 2 courses, ordered with no duplicates", () => {
    for (const path of learningPathSeeds) {
      expect(path.courseSlugs.length).toBeGreaterThanOrEqual(2);
      expect(new Set(path.courseSlugs).size).toBe(path.courseSlugs.length);
    }
  });

  it("gives every path a non-empty title, description, and target audience", () => {
    for (const path of learningPathSeeds) {
      expect(path.title.length).toBeGreaterThan(0);
      expect(path.description.length).toBeGreaterThan(0);
      expect(path.targetAudience.length).toBeGreaterThan(0);
      expect(path.estimatedWeeks).toBeGreaterThan(0);
    }
  });

  it("does not make guaranteed income or job claims in path descriptions", () => {
    const bannedPhrases = ["guaranteed income", "guaranteed job", "get rich"];
    for (const path of learningPathSeeds) {
      const text = `${path.description} ${path.targetAudience}`.toLowerCase();
      for (const phrase of bannedPhrases) {
        expect(text).not.toContain(phrase);
      }
    }
  });
});
