import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";
import type { CreatorProfile } from "@/lib/validation/creator-coach";

const extractCreatorProfile = vi.fn();
const getCandidateCourses = vi.fn();
const generateCreatorPlan = vi.fn();
const getAIProvider = vi.fn();

vi.mock("@/server/creator-coach/extract-profile", () => ({
  extractCreatorProfile: (...args: unknown[]) => extractCreatorProfile(...args),
}));
vi.mock("@/server/creator-coach/academy-retrieval", () => ({
  getCandidateCourses: (...args: unknown[]) => getCandidateCourses(...args),
}));
vi.mock("@/server/creator-coach/plan-generation", () => ({
  generateCreatorPlan: (...args: unknown[]) => generateCreatorPlan(...args),
}));
vi.mock("@/ai/get-ai-provider", () => ({
  getAIProvider: (...args: unknown[]) => getAIProvider(...args),
}));

const { getCreatorCoachPlan } = await import("@/server/creator-coach/creator-coach-service");

const sampleProfile: CreatorProfile = {
  businessSummary: "Sells clothing online",
  platforms: ["Instagram"],
  experienceLevel: "BEGINNER",
  primaryGoal: "Reach $2,000/month",
  focusAreas: ["audience growth"],
  constraints: [],
};

const fakeProvider: AIProvider = { name: "fake", generateCompletion: vi.fn() };

beforeEach(() => {
  extractCreatorProfile.mockReset();
  getCandidateCourses.mockReset();
  generateCreatorPlan.mockReset();
  getAIProvider.mockReset();
  getAIProvider.mockReturnValue(fakeProvider);
});

describe("getCreatorCoachPlan", () => {
  it("chains profile extraction -> academy retrieval -> plan generation, in order", async () => {
    extractCreatorProfile.mockResolvedValue(sampleProfile);
    getCandidateCourses.mockResolvedValue([{ slug: "social-media-foundations-for-creators" }]);
    generateCreatorPlan.mockResolvedValue({
      weeks: [{ weekNumber: 1, focus: "Foundations", summary: "...", course: { slug: "social-media-foundations-for-creators" } }],
      overallSummary: "Start here.",
      generatedBy: "ai",
    });

    const result = await getCreatorCoachPlan("I sell clothing online and want to make $2,000/month");

    expect(extractCreatorProfile).toHaveBeenCalledWith(
      "I sell clothing online and want to make $2,000/month",
      fakeProvider,
    );
    expect(getAIProvider).toHaveBeenCalledWith(process.env, { task: "creator-coach", locale: "en" });
    expect(getCandidateCourses).toHaveBeenCalledWith(sampleProfile);
    expect(generateCreatorPlan).toHaveBeenCalledWith(
      sampleProfile,
      [{ slug: "social-media-foundations-for-creators" }],
      fakeProvider,
    );
    expect(result.profile).toEqual(sampleProfile);
    expect(result.overallSummary).toBe("Start here.");
    expect(result.generatedBy).toBe("ai");
  });

  it("uses an injected provider instead of the env-configured one when supplied", async () => {
    extractCreatorProfile.mockResolvedValue(sampleProfile);
    getCandidateCourses.mockResolvedValue([]);
    generateCreatorPlan.mockResolvedValue({ weeks: [], overallSummary: null, generatedBy: "fallback-sequence" });

    const injectedProvider: AIProvider = { name: "injected", generateCompletion: vi.fn() };
    await getCreatorCoachPlan("hi", { provider: injectedProvider });

    expect(getAIProvider).not.toHaveBeenCalled();
    expect(extractCreatorProfile).toHaveBeenCalledWith("hi", injectedProvider);
  });

  it("propagates errors from profile extraction without calling retrieval", async () => {
    extractCreatorProfile.mockRejectedValue(new Error("provider down"));

    await expect(getCreatorCoachPlan("hi")).rejects.toThrow("provider down");
    expect(getCandidateCourses).not.toHaveBeenCalled();
  });

  it("returns an empty-but-successful result when no courses match the profile", async () => {
    extractCreatorProfile.mockResolvedValue(sampleProfile);
    getCandidateCourses.mockResolvedValue([]);
    generateCreatorPlan.mockResolvedValue({ weeks: [], overallSummary: null, generatedBy: "fallback-sequence" });

    const result = await getCreatorCoachPlan("I want to learn something obscure");

    expect(result.weeks).toEqual([]);
  });
});
