import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCandidateWhere,
  scoreCourseAgainstIntent,
  type ScorableCourse,
} from "@/server/advisor/catalog-retrieval";

const baseIntent = {
  topics: ["Python", "AI"],
  currentSkillLevel: "BEGINNER" as const,
  budgetPreference: "ANY" as const,
};

function course(overrides: Partial<ScorableCourse> = {}): ScorableCourse {
  return {
    title: "Intro to Something",
    shortDescription: "",
    fullDescription: "",
    level: "BEGINNER",
    featured: false,
    category: { name: "Other" },
    ...overrides,
  };
}

describe("buildCandidateWhere", () => {
  it("restricts to PUBLISHED courses", () => {
    expect(buildCandidateWhere(baseIntent)).toMatchObject({ status: "PUBLISHED" });
  });

  it("builds an OR clause across title, descriptions, and category name for every topic", () => {
    const where = buildCandidateWhere({ topics: ["Python"], budgetPreference: "ANY" });
    expect(where.OR).toEqual([
      { title: { contains: "Python", mode: "insensitive" } },
      { shortDescription: { contains: "Python", mode: "insensitive" } },
      { fullDescription: { contains: "Python", mode: "insensitive" } },
      { category: { name: { contains: "Python", mode: "insensitive" } } },
    ]);
  });

  it("filters to free courses only when budgetPreference is FREE", () => {
    const where = buildCandidateWhere({ topics: ["Python"], budgetPreference: "FREE" });
    expect(where.price).toBe(0);
  });

  it("does not add a price filter when budgetPreference is ANY", () => {
    const where = buildCandidateWhere({ topics: ["Python"], budgetPreference: "ANY" });
    expect(where.price).toBeUndefined();
  });
});

describe("scoreCourseAgainstIntent", () => {
  it("scores 0 when no topic matches anywhere", () => {
    const c = course({ title: "Advanced Plumbing", category: { name: "Skilled Trades" } });
    expect(scoreCourseAgainstIntent(c, baseIntent)).toBe(0);
  });

  it("scores higher for a title match than a full-description-only match", () => {
    const titleMatch = course({ title: "Python for Data Science" });
    const descriptionOnlyMatch = course({
      title: "Something Else",
      fullDescription: "This course briefly touches on Python.",
    });
    expect(scoreCourseAgainstIntent(titleMatch, baseIntent)).toBeGreaterThan(
      scoreCourseAgainstIntent(descriptionOnlyMatch, baseIntent),
    );
  });

  it("adds a bonus when the course level matches the current skill level", () => {
    const matchingLevel = course({ title: "Python Basics", level: "BEGINNER" });
    const differentLevel = course({ title: "Python Basics", level: "ADVANCED" });
    expect(scoreCourseAgainstIntent(matchingLevel, baseIntent)).toBeGreaterThan(
      scoreCourseAgainstIntent(differentLevel, baseIntent),
    );
  });

  it("adds a small bonus for featured courses, on top of a real topic match", () => {
    const featured = course({ title: "Python Basics", featured: true });
    const notFeatured = course({ title: "Python Basics", featured: false });
    expect(scoreCourseAgainstIntent(featured, baseIntent)).toBeGreaterThan(
      scoreCourseAgainstIntent(notFeatured, baseIntent),
    );
  });

  it("does not grant a featured bonus on its own without a topic match", () => {
    const featuredNoMatch = course({ title: "Advanced Plumbing", featured: true });
    expect(scoreCourseAgainstIntent(featuredNoMatch, baseIntent)).toBe(0);
  });

  it("matches case-insensitively", () => {
    const c = course({ title: "python fundamentals" });
    expect(scoreCourseAgainstIntent(c, baseIntent)).toBeGreaterThan(0);
  });
});

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { course: { findMany: (...args: unknown[]) => findMany(...args) } },
}));

const { getCandidateCourses, MAX_CANDIDATES } = await import("@/server/advisor/catalog-retrieval");

beforeEach(() => {
  findMany.mockReset();
});

describe("getCandidateCourses", () => {
  it("queries PUBLISHED courses with category included and ranks/limits the result", async () => {
    findMany.mockResolvedValue([
      {
        id: "1",
        slug: "python-fundamentals",
        title: "Python Fundamentals",
        shortDescription: "",
        fullDescription: "",
        level: "BEGINNER",
        featured: false,
        category: { name: "Software Development" },
      },
      {
        id: "2",
        slug: "unrelated-course",
        title: "Advanced Plumbing",
        shortDescription: "",
        fullDescription: "",
        level: "BEGINNER",
        featured: false,
        category: { name: "Skilled Trades" },
      },
    ]);

    const result = await getCandidateCourses({
      goal: "Learn Python",
      topics: ["Python"],
      currentSkillLevel: "BEGINNER",
      availableHoursPerWeek: null,
      budgetPreference: "ANY",
      constraints: [],
    });

    expect(findMany.mock.calls[0][0]).toMatchObject({ include: { category: true } });
    expect(findMany.mock.calls[0][0].where.status).toBe("PUBLISHED");
    // Only the Python-matching course should survive the zero-score filter.
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("python-fundamentals");
  });

  it("never returns more than the requested limit", async () => {
    const pool = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      slug: `python-course-${i}`,
      title: `Python Course ${i}`,
      shortDescription: "",
      fullDescription: "",
      level: "BEGINNER",
      featured: false,
      category: { name: "Software Development" },
    }));
    findMany.mockResolvedValue(pool);

    const result = await getCandidateCourses(
      {
        goal: "Learn Python",
        topics: ["Python"],
        currentSkillLevel: "BEGINNER",
        availableHoursPerWeek: null,
        budgetPreference: "ANY",
        constraints: [],
      },
      3,
    );

    expect(result.length).toBeLessThanOrEqual(3);
    expect(MAX_CANDIDATES).toBeGreaterThan(0);
  });
});
