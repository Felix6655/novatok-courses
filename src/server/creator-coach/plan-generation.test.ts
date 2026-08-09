import { describe, expect, it } from "vitest";
import type { AIProvider } from "@/ai/provider";
import type { CreatorProfile } from "@/lib/validation/creator-coach";
import { generateCreatorPlan } from "@/server/creator-coach/plan-generation";
import type { SerializedCourseWithCategory } from "@/types/course";

const profile: CreatorProfile = {
  businessSummary: "Sells clothing online",
  platforms: ["Instagram", "TikTok"],
  experienceLevel: "BEGINNER",
  primaryGoal: "Reach $2,000/month in sales",
  focusAreas: ["audience growth", "social commerce"],
  constraints: ["700 Instagram followers", "300 TikTok followers"],
};

function makeCourse(slug: string, overrides: Partial<SerializedCourseWithCategory> = {}) {
  return {
    id: slug,
    slug,
    title: slug,
    shortDescription: "",
    fullDescription: "",
    level: "BEGINNER",
    featured: false,
    category: { id: "cat-1", name: "Creator Economy & Social Media", slug: "creator-economy" },
    price: "0.00",
    ...overrides,
  } as unknown as SerializedCourseWithCategory;
}

function fakeProvider(response: string): AIProvider {
  return { name: "fake", generateCompletion: async () => response };
}

describe("generateCreatorPlan", () => {
  it("returns an empty, non-error result when there are no candidates", async () => {
    const result = await generateCreatorPlan(profile, [], fakeProvider("{}"));
    expect(result).toEqual({ weeks: [], overallSummary: null, generatedBy: "fallback-sequence" });
  });

  it("grounds the AI's plan: only real candidate slugs are included, numbered in order", async () => {
    const candidates = [makeCourse("social-media-foundations-for-creators"), makeCourse("growing-your-audience-from-zero")];
    const provider = fakeProvider(
      JSON.stringify({
        weeks: [
          { focus: "Foundations", summary: "Nail down your niche.", courseSlug: "social-media-foundations-for-creators" },
          { focus: "Growth", summary: "Start growing your audience.", courseSlug: "growing-your-audience-from-zero" },
        ],
        overallSummary: "A 2-week starting plan.",
      }),
    );

    const result = await generateCreatorPlan(profile, candidates, provider);

    expect(result.generatedBy).toBe("ai");
    expect(result.weeks.map((w) => w.course.slug)).toEqual([
      "social-media-foundations-for-creators",
      "growing-your-audience-from-zero",
    ]);
    expect(result.weeks[0].weekNumber).toBe(1);
    expect(result.weeks[1].weekNumber).toBe(2);
    expect(result.overallSummary).toBe("A 2-week starting plan.");
  });

  it("drops a hallucinated slug that isn't in the candidate set", async () => {
    const candidates = [makeCourse("social-media-foundations-for-creators")];
    const provider = fakeProvider(
      JSON.stringify({
        weeks: [
          { focus: "Foundations", summary: "Real course.", courseSlug: "social-media-foundations-for-creators" },
          { focus: "Made up", summary: "Fake course.", courseSlug: "viral-growth-hacking-secrets-9000" },
        ],
        overallSummary: null,
      }),
    );

    const result = await generateCreatorPlan(profile, candidates, provider);

    expect(result.weeks).toHaveLength(1);
    expect(result.weeks[0].course.slug).toBe("social-media-foundations-for-creators");
  });

  it("falls back to a sequenced plan when every recommended slug is hallucinated", async () => {
    const candidates = [makeCourse("social-media-foundations-for-creators"), makeCourse("growing-your-audience-from-zero")];
    const provider = fakeProvider(
      JSON.stringify({ weeks: [{ focus: "Fake", summary: "Fake.", courseSlug: "totally-made-up" }] }),
    );

    const result = await generateCreatorPlan(profile, candidates, provider);

    expect(result.generatedBy).toBe("fallback-sequence");
    expect(result.weeks.map((w) => w.course.slug)).toEqual([
      "social-media-foundations-for-creators",
      "growing-your-audience-from-zero",
    ]);
  });

  it("falls back to a sequenced plan when the model output isn't valid JSON", async () => {
    const candidates = [makeCourse("social-media-foundations-for-creators")];
    const provider = fakeProvider("Start with foundations, then grow!");

    const result = await generateCreatorPlan(profile, candidates, provider);

    expect(result.generatedBy).toBe("fallback-sequence");
    expect(result.weeks).toHaveLength(1);
  });

  it("falls back to a sequenced plan when the JSON is well-formed but fails schema validation", async () => {
    const candidates = [makeCourse("social-media-foundations-for-creators")];
    const provider = fakeProvider(JSON.stringify({ weeks: [] }));

    const result = await generateCreatorPlan(profile, candidates, provider);

    expect(result.generatedBy).toBe("fallback-sequence");
  });

  it("propagates provider failures instead of masking them as a fallback", async () => {
    const candidates = [makeCourse("social-media-foundations-for-creators")];
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async () => {
        throw new Error("connection refused");
      },
    };

    await expect(generateCreatorPlan(profile, candidates, provider)).rejects.toThrow("connection refused");
  });
});
