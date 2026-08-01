import { describe, expect, it } from "vitest";
import { InvalidModelOutputError } from "@/ai/errors";
import type { AIProvider } from "@/ai/provider";
import { extractLearningIntent } from "@/server/advisor/extract-intent";

function fakeProvider(response: string | (() => Promise<string>)): AIProvider {
  return {
    name: "fake",
    generateCompletion: async () => (typeof response === "string" ? response : response()),
  };
}

describe("extractLearningIntent", () => {
  it("parses and validates a well-formed model response", async () => {
    const provider = fakeProvider(
      JSON.stringify({
        goal: "Learn Python for building AI tools",
        currentSkillLevel: "BEGINNER",
        topics: ["Python", "AI"],
        availableHoursPerWeek: null,
        budgetPreference: "ANY",
        constraints: [],
      }),
    );

    const intent = await extractLearningIntent("I want to learn Python", provider);

    expect(intent.goal).toBe("Learn Python for building AI tools");
    expect(intent.topics).toEqual(["Python", "AI"]);
  });

  it("repairs a response wrapped in prose before validating", async () => {
    const provider = fakeProvider(
      `Sure! Here's the JSON:\n${JSON.stringify({
        goal: "Learn cybersecurity basics",
        topics: ["Cybersecurity"],
      })}\nLet me know if you need anything else.`,
    );

    const intent = await extractLearningIntent("I want to learn cybersecurity", provider);
    expect(intent.goal).toBe("Learn cybersecurity basics");
  });

  it("throws InvalidModelOutputError when the response isn't JSON at all", async () => {
    const provider = fakeProvider("I think you should learn Python!");
    await expect(extractLearningIntent("hi", provider)).rejects.toBeInstanceOf(
      InvalidModelOutputError,
    );
  });

  it("throws InvalidModelOutputError when JSON is well-formed but fails schema validation", async () => {
    const provider = fakeProvider(JSON.stringify({ goal: "", topics: [] }));
    await expect(extractLearningIntent("hi", provider)).rejects.toBeInstanceOf(
      InvalidModelOutputError,
    );
  });

  it("propagates provider errors instead of swallowing them", async () => {
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async () => {
        throw new Error("boom");
      },
    };
    await expect(extractLearningIntent("hi", provider)).rejects.toThrow("boom");
  });
});
