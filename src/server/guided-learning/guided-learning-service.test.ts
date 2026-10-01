import { describe, expect, it } from "vitest";
import type { AIProvider } from "@/ai/provider";
import { buildGuidedLearningPlan } from "@/server/guided-learning/guided-learning-service";

function providerReturning(response: string): AIProvider {
  return {
    name: "fake",
    model: "fake-model",
    generateCompletion: async () => response,
  };
}

describe("buildGuidedLearningPlan", () => {
  it("returns a validated structured plan from the provider", async () => {
    const provider = providerReturning(JSON.stringify({
      goalSummary: "Learn practical machine learning from scratch.",
      estimatedWeeks: 8,
      steps: [
        {
          title: "Math and Python foundations",
          outcome: "Build the prerequisites.",
          topics: ["Python", "Linear algebra"],
          practice: ["Implement basic vector operations."],
        },
        {
          title: "Core machine learning",
          outcome: "Train and evaluate basic models.",
          topics: ["Regression", "Classification"],
          practice: ["Train a small classifier."],
        },
      ],
      studyTips: ["Practice every week."],
      resourceQueries: ["machine learning beginner course"],
    }));

    const result = await buildGuidedLearningPlan(
      { goal: "Learn machine learning", currentLevel: "BEGINNER", weeklyHours: 5 },
      { provider },
    );

    expect(result.source).toBe("ai");
    expect(result.estimatedWeeks).toBe(8);
    expect(result.steps).toHaveLength(2);
    expect(result.verifiedResources.some((item) => item.provider === "google")).toBe(true);
  });

  it("uses a deterministic safe fallback when model JSON is unusable", async () => {
    const result = await buildGuidedLearningPlan(
      { goal: "Learn electrical basics", currentLevel: "BEGINNER", weeklyHours: 4 },
      { provider: providerReturning("not json") },
    );

    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("invalid-output");
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
    expect(result.resourceQueries[0]).toContain("Learn electrical basics");
    expect(result.verifiedResources).toEqual([]);
  });

  it("falls back quickly when the provider is too slow", async () => {
    const slowProvider: AIProvider = {
      name: "slow",
      model: "slow-model",
      generateCompletion: async () =>
        await new Promise<string>(() => {
          // Intentionally never resolves; the service timeout must win.
        }),
    };

    const started = Date.now();
    const result = await buildGuidedLearningPlan(
      { goal: "Learn AI", currentLevel: "BEGINNER", weeklyHours: 5 },
      { provider: slowProvider, timeoutMs: 5 },
    );

    expect(Date.now() - started).toBeLessThan(250);
    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("timeout");
    expect(result.verifiedResources.length).toBeGreaterThan(0);
  });

  it("falls back when the provider is unavailable", async () => {
    const unavailableProvider: AIProvider = {
      name: "offline",
      model: "offline-model",
      generateCompletion: async () => {
        throw new Error("offline");
      },
    };

    const result = await buildGuidedLearningPlan(
      { goal: "Learn machine learning", currentLevel: "BEGINNER", weeklyHours: 5 },
      { provider: unavailableProvider },
    );

    expect(result.source).toBe("fallback");
    expect(result.fallbackReason).toBe("provider-unavailable");
    expect(result.verifiedResources.length).toBeGreaterThan(0);
  });

  it("does not treat external resources as verified model output", async () => {
    const provider = providerReturning(JSON.stringify({
      goalSummary: "Learn AI",
      estimatedWeeks: 4,
      steps: [
        { title: "Basics", outcome: "Understand basics", topics: ["AI"], practice: [] },
        { title: "Practice", outcome: "Apply basics", topics: ["Projects"], practice: [] }
      ],
      studyTips: [],
      resourceQueries: ["free AI course"]
    }));

    const result = await buildGuidedLearningPlan(
      { goal: "Learn AI", currentLevel: "BEGINNER", weeklyHours: 5 },
      { provider },
    );

    expect(result.verifiedResources.some((item) => item.provider === "google")).toBe(true);
  });
});
