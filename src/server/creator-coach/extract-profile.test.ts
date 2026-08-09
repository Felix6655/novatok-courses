import { describe, expect, it } from "vitest";
import { InvalidModelOutputError } from "@/ai/errors";
import type { AIProvider } from "@/ai/provider";
import { extractCreatorProfile } from "@/server/creator-coach/extract-profile";

function fakeProvider(response: string | (() => Promise<string>)): AIProvider {
  return {
    name: "fake",
    generateCompletion: async () => (typeof response === "string" ? response : response()),
  };
}

describe("extractCreatorProfile", () => {
  it("parses and validates a well-formed model response", async () => {
    const provider = fakeProvider(
      JSON.stringify({
        businessSummary: "Sells clothing online",
        platforms: ["Instagram", "TikTok"],
        experienceLevel: "BEGINNER",
        primaryGoal: "Reach $2,000/month in sales",
        focusAreas: ["audience growth", "social commerce"],
        constraints: ["700 Instagram followers", "300 TikTok followers", "400 average views"],
      }),
    );

    const profile = await extractCreatorProfile(
      "I sell clothing online. I have 700 Instagram followers and 300 TikTok followers. My videos average 400 views. I want to make $2,000/month.",
      provider,
    );

    expect(profile.businessSummary).toBe("Sells clothing online");
    expect(profile.platforms).toEqual(["Instagram", "TikTok"]);
    expect(profile.focusAreas).toEqual(["audience growth", "social commerce"]);
  });

  it("repairs a response wrapped in prose before validating", async () => {
    const provider = fakeProvider(
      `Here's the profile:\n${JSON.stringify({
        businessSummary: "UGC creator",
        primaryGoal: "Land brand deals",
        focusAreas: ["content creation"],
      })}\nHope this helps!`,
    );

    const profile = await extractCreatorProfile("I want to do UGC", provider);
    expect(profile.businessSummary).toBe("UGC creator");
  });

  it("throws InvalidModelOutputError when the response isn't JSON at all", async () => {
    const provider = fakeProvider("You should focus on Instagram!");
    await expect(extractCreatorProfile("hi", provider)).rejects.toBeInstanceOf(InvalidModelOutputError);
  });

  it("throws InvalidModelOutputError when JSON is well-formed but fails schema validation", async () => {
    const provider = fakeProvider(JSON.stringify({ businessSummary: "", focusAreas: [] }));
    await expect(extractCreatorProfile("hi", provider)).rejects.toBeInstanceOf(InvalidModelOutputError);
  });

  it("propagates provider errors instead of swallowing them", async () => {
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async () => {
        throw new Error("boom");
      },
    };
    await expect(extractCreatorProfile("hi", provider)).rejects.toThrow("boom");
  });
});
