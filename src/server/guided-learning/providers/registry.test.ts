import { describe, expect, it } from "vitest";
import {
  findVerifiedLearningResources,
  VERIFIED_LEARNING_RESOURCES,
} from "@/server/guided-learning/providers/registry";

describe("verified learning provider registry", () => {
  it("contains Google, Microsoft, and AWS providers", () => {
    expect(new Set(VERIFIED_LEARNING_RESOURCES.map((item) => item.provider))).toEqual(
      new Set(["google", "microsoft", "aws"]),
    );
  });

  it("returns resources from multiple official providers for a broad AI goal", () => {
    const resources = findVerifiedLearningResources({
      goal: "Learn artificial intelligence and machine learning",
      currentLevel: "BEGINNER",
      locale: "en",
      limit: 20,
    });
    const providers = new Set(resources.map((item) => item.provider));
    expect(providers.has("google")).toBe(true);
    expect(providers.has("microsoft")).toBe(true);
    expect(providers.has("aws")).toBe(true);
  });

  it("requires thematic relevance from the learner goal", () => {
    const resources = findVerifiedLearningResources({
      goal: "Learn electrical basics",
      resourceQueries: ["free AI beginner course", "machine learning course"],
      currentLevel: "BEGINNER",
      locale: "en",
    });
    expect(resources).toEqual([]);
  });
});
