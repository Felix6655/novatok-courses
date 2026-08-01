import { describe, expect, it } from "vitest";
import type { AIProvider } from "@/ai/provider";
import type { LearningIntent } from "@/lib/validation/learning-intent";
import { generateRecommendation } from "@/server/advisor/recommendation";
import type { SerializedCourseWithCategory } from "@/types/course";

const intent: LearningIntent = {
  goal: "Learn Python for building AI tools",
  currentSkillLevel: "BEGINNER",
  topics: ["Python", "AI"],
  availableHoursPerWeek: null,
  budgetPreference: "ANY",
  constraints: [],
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
    category: { id: "cat-1", name: "Software Development", slug: "software-development" },
    price: "0.00",
    ...overrides,
  } as unknown as SerializedCourseWithCategory;
}

function fakeProvider(response: string): AIProvider {
  return { name: "fake", generateCompletion: async () => response };
}

describe("generateRecommendation", () => {
  it("returns an empty, non-error result when there are no candidates", async () => {
    const result = await generateRecommendation(intent, [], fakeProvider("{}"));
    expect(result).toEqual({ recommendations: [], pathSummary: null, generatedBy: "fallback-ranking" });
  });

  it("grounds the AI's selection: only real candidate slugs are included, in the given order", async () => {
    const candidates = [makeCourse("python-basics"), makeCourse("python-advanced")];
    const provider = fakeProvider(
      JSON.stringify({
        recommendations: [
          { slug: "python-basics", reason: "Great starting point." },
          { slug: "python-advanced", reason: "Good next step." },
        ],
        pathSummary: "Start with the basics course, then move to advanced.",
      }),
    );

    const result = await generateRecommendation(intent, candidates, provider);

    expect(result.generatedBy).toBe("ai");
    expect(result.recommendations.map((r) => r.course.slug)).toEqual([
      "python-basics",
      "python-advanced",
    ]);
    expect(result.recommendations[0].order).toBe(1);
    expect(result.recommendations[1].order).toBe(2);
    expect(result.pathSummary).toBe("Start with the basics course, then move to advanced.");
  });

  it("drops a hallucinated slug that isn't in the candidate set", async () => {
    const candidates = [makeCourse("python-basics")];
    const provider = fakeProvider(
      JSON.stringify({
        recommendations: [
          { slug: "python-basics", reason: "Real course." },
          { slug: "python-for-wizards-9000", reason: "Made up course." },
        ],
        pathSummary: null,
      }),
    );

    const result = await generateRecommendation(intent, candidates, provider);

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].course.slug).toBe("python-basics");
  });

  it("deduplicates a slug the model lists more than once", async () => {
    const candidates = [makeCourse("python-basics")];
    const provider = fakeProvider(
      JSON.stringify({
        recommendations: [
          { slug: "python-basics", reason: "First mention." },
          { slug: "python-basics", reason: "Repeated mention." },
        ],
      }),
    );

    const result = await generateRecommendation(intent, candidates, provider);
    expect(result.recommendations).toHaveLength(1);
  });

  it("falls back to ranked candidates when every recommended slug is hallucinated", async () => {
    const candidates = [makeCourse("python-basics"), makeCourse("python-advanced")];
    const provider = fakeProvider(
      JSON.stringify({
        recommendations: [{ slug: "totally-made-up", reason: "Fake." }],
      }),
    );

    const result = await generateRecommendation(intent, candidates, provider);

    expect(result.generatedBy).toBe("fallback-ranking");
    expect(result.recommendations.map((r) => r.course.slug)).toEqual([
      "python-basics",
      "python-advanced",
    ]);
  });

  it("falls back to ranked candidates when the model output isn't valid JSON", async () => {
    const candidates = [makeCourse("python-basics")];
    const provider = fakeProvider("I recommend the Python Basics course!");

    const result = await generateRecommendation(intent, candidates, provider);

    expect(result.generatedBy).toBe("fallback-ranking");
    expect(result.recommendations).toHaveLength(1);
  });

  it("falls back to ranked candidates when the JSON is well-formed but fails schema validation", async () => {
    const candidates = [makeCourse("python-basics")];
    const provider = fakeProvider(JSON.stringify({ recommendations: [] }));

    const result = await generateRecommendation(intent, candidates, provider);

    expect(result.generatedBy).toBe("fallback-ranking");
  });

  it("propagates provider failures instead of masking them as a fallback", async () => {
    const candidates = [makeCourse("python-basics")];
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async () => {
        throw new Error("connection refused");
      },
    };

    await expect(generateRecommendation(intent, candidates, provider)).rejects.toThrow(
      "connection refused",
    );
  });
});
