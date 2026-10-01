import { describe, expect, it } from "vitest";
import {
  findMicrosoftVerifiedResources,
  MICROSOFT_VERIFIED_RESOURCES,
} from "@/server/guided-learning/providers/microsoft";

describe("Microsoft Learn verified resources", () => {
  it("contains only official Microsoft Learn URLs and free resources", () => {
    for (const resource of MICROSOFT_VERIFIED_RESOURCES) {
      expect(new URL(resource.url).hostname).toBe("learn.microsoft.com");
      expect(resource.provider).toBe("microsoft");
      expect(resource.freeAccess).toBe(true);
      expect(resource.verification.source).toBe("official-provider");
    }
  });

  it("matches an AI goal to Microsoft Learn AI resources", () => {
    const resources = findMicrosoftVerifiedResources({
      goal: "I want to learn AI and machine learning",
      currentLevel: "BEGINNER",
      locale: "en",
    });
    expect(resources.some((item) => item.id === "microsoft-ai-concepts")).toBe(true);
    expect(resources.some((item) => item.id === "microsoft-machine-learning-concepts")).toBe(true);
  });

  it("does not match an unrelated electrical goal", () => {
    expect(
      findMicrosoftVerifiedResources({
        goal: "Learn residential electrical wiring",
        currentLevel: "BEGINNER",
        locale: "en",
      }),
    ).toEqual([]);
  });
});
