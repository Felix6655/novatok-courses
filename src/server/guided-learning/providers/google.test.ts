import { describe, expect, it } from "vitest";
import {
  findGoogleVerifiedResources,
  GOOGLE_VERIFIED_RESOURCES,
} from "@/server/guided-learning/providers/google";

describe("Google verified learning resources", () => {
  it("contains only official Google URLs", () => {
    for (const resource of GOOGLE_VERIFIED_RESOURCES) {
      const url = new URL(resource.url);
      expect(["developers.google.com", "gemini.google.com"]).toContain(url.hostname);
      expect(resource.verification.source).toBe("official-provider");
      expect(resource.freeAccess).toBe(true);
    }
  });

  it("matches machine-learning goals to the official ML course resources", () => {
    const results = findGoogleVerifiedResources({
      goal: "I want to learn machine learning from scratch",
      currentLevel: "BEGINNER",
      locale: "en",
    });

    expect(results.some((item) => item.id === "google-ml-crash-course")).toBe(true);
    expect(results.some((item) => item.id === "google-ml-catalog")).toBe(true);
  });

  it("matches Guided Learning and LearnLM goals to Gemini Guided Learning", () => {
    const results = findGoogleVerifiedResources({
      goal: "I want guided learning with LearnLM and Gemini",
      currentLevel: "BEGINNER",
      locale: "es",
    });

    expect(results[0]?.id).toBe("google-gemini-guided-learning");
  });
});
