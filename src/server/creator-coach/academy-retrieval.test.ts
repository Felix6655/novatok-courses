import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCandidateWhere,
  scoreCourseAgainstProfile,
  type ScorableCourse,
} from "@/server/creator-coach/academy-retrieval";

const baseProfile = {
  focusAreas: ["audience growth", "social commerce"],
  platforms: ["Instagram"],
  experienceLevel: "BEGINNER" as const,
};

function course(overrides: Partial<ScorableCourse> = {}): ScorableCourse {
  return {
    title: "Some Course",
    shortDescription: "",
    fullDescription: "",
    level: "BEGINNER",
    featured: false,
    category: { name: "Other", slug: "other" },
    ...overrides,
  };
}

describe("buildCandidateWhere", () => {
  it("restricts to PUBLISHED courses", () => {
    expect(buildCandidateWhere(baseProfile)).toMatchObject({ status: "PUBLISHED" });
  });

  it("builds an OR clause across title, descriptions, and category name for every focus area and platform", () => {
    const where = buildCandidateWhere({ focusAreas: ["audience growth"], platforms: ["TikTok"] });
    expect(where.OR).toEqual([
      { title: { contains: "audience growth", mode: "insensitive" } },
      { shortDescription: { contains: "audience growth", mode: "insensitive" } },
      { fullDescription: { contains: "audience growth", mode: "insensitive" } },
      { category: { name: { contains: "audience growth", mode: "insensitive" } } },
      { title: { contains: "TikTok", mode: "insensitive" } },
      { shortDescription: { contains: "TikTok", mode: "insensitive" } },
      { fullDescription: { contains: "TikTok", mode: "insensitive" } },
      { category: { name: { contains: "TikTok", mode: "insensitive" } } },
    ]);
  });
});

describe("scoreCourseAgainstProfile", () => {
  it("scores 0 when no focus area or platform matches anywhere", () => {
    const c = course({ title: "Advanced Plumbing", category: { name: "Skilled Trades", slug: "skilled-trades" } });
    expect(scoreCourseAgainstProfile(c, baseProfile)).toBe(0);
  });

  it("scores higher for a title match than a full-description-only match", () => {
    const titleMatch = course({ title: "Audience Growth Basics" });
    const descriptionOnlyMatch = course({
      title: "Something Else",
      fullDescription: "This briefly touches on audience growth.",
    });
    expect(scoreCourseAgainstProfile(titleMatch, baseProfile)).toBeGreaterThan(
      scoreCourseAgainstProfile(descriptionOnlyMatch, baseProfile),
    );
  });

  it("adds a bonus for courses in the creator-economy category, on top of a real match", () => {
    const inCategory = course({
      title: "Audience Growth Course",
      category: { name: "Creator Economy & Social Media", slug: "creator-economy" },
    });
    const outOfCategory = course({
      title: "Audience Growth Course",
      category: { name: "Digital Marketing", slug: "digital-marketing" },
    });
    expect(scoreCourseAgainstProfile(inCategory, baseProfile)).toBeGreaterThan(
      scoreCourseAgainstProfile(outOfCategory, baseProfile),
    );
  });

  it("adds a bonus when the course level matches the creator's experience level", () => {
    const matchingLevel = course({ title: "Audience Growth", level: "BEGINNER" });
    const differentLevel = course({ title: "Audience Growth", level: "ADVANCED" });
    expect(scoreCourseAgainstProfile(matchingLevel, baseProfile)).toBeGreaterThan(
      scoreCourseAgainstProfile(differentLevel, baseProfile),
    );
  });

  it("does not grant a featured bonus on its own without a match", () => {
    const featuredNoMatch = course({ title: "Advanced Plumbing", featured: true });
    expect(scoreCourseAgainstProfile(featuredNoMatch, baseProfile)).toBe(0);
  });

  it("matches case-insensitively", () => {
    const c = course({ title: "audience growth basics" });
    expect(scoreCourseAgainstProfile(c, baseProfile)).toBeGreaterThan(0);
  });
});

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { course: { findMany: (...args: unknown[]) => findMany(...args) } },
}));

const { getCandidateCourses, MAX_CANDIDATES } = await import("@/server/creator-coach/academy-retrieval");

beforeEach(() => {
  findMany.mockReset();
});

describe("getCandidateCourses", () => {
  it("queries PUBLISHED courses with category included and ranks/limits the result", async () => {
    findMany.mockResolvedValue([
      {
        id: "1",
        slug: "audience-growth-basics",
        title: "Audience Growth Basics",
        shortDescription: "",
        fullDescription: "",
        level: "BEGINNER",
        featured: false,
        category: { name: "Creator Economy & Social Media", slug: "creator-economy" },
      },
      {
        id: "2",
        slug: "unrelated-course",
        title: "Advanced Plumbing",
        shortDescription: "",
        fullDescription: "",
        level: "BEGINNER",
        featured: false,
        category: { name: "Skilled Trades", slug: "skilled-trades" },
      },
    ]);

    const result = await getCandidateCourses({
      businessSummary: "Sells clothing online",
      platforms: ["Instagram"],
      experienceLevel: "BEGINNER",
      primaryGoal: "Grow sales",
      focusAreas: ["audience growth"],
      constraints: [],
    });

    expect(findMany.mock.calls[0][0]).toMatchObject({ include: { category: true } });
    expect(findMany.mock.calls[0][0].where.status).toBe("PUBLISHED");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("audience-growth-basics");
  });

  it("never returns more than the requested limit", async () => {
    const pool = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      slug: `audience-growth-course-${i}`,
      title: `Audience Growth Course ${i}`,
      shortDescription: "",
      fullDescription: "",
      level: "BEGINNER",
      featured: false,
      category: { name: "Creator Economy & Social Media", slug: "creator-economy" },
    }));
    findMany.mockResolvedValue(pool);

    const result = await getCandidateCourses(
      {
        businessSummary: "Sells clothing online",
        platforms: [],
        experienceLevel: "BEGINNER",
        primaryGoal: "Grow sales",
        focusAreas: ["audience growth"],
        constraints: [],
      },
      3,
    );

    expect(result.length).toBeLessThanOrEqual(3);
    expect(MAX_CANDIDATES).toBeGreaterThan(0);
  });
});
