import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";
import type { LearningIntent } from "@/lib/validation/learning-intent";

const extractLearningIntent = vi.fn();
const getCandidateCourses = vi.fn();
const generateRecommendation = vi.fn();
const getAIProvider = vi.fn();

vi.mock("@/server/advisor/extract-intent", () => ({
  extractLearningIntent: (...args: unknown[]) => extractLearningIntent(...args),
}));
vi.mock("@/server/advisor/catalog-retrieval", () => ({
  getCandidateCourses: (...args: unknown[]) => getCandidateCourses(...args),
}));
vi.mock("@/server/advisor/recommendation", () => ({
  generateRecommendation: (...args: unknown[]) => generateRecommendation(...args),
}));
vi.mock("@/ai/get-ai-provider", () => ({
  getAIProvider: (...args: unknown[]) => getAIProvider(...args),
}));

const { getCourseAdvisorRecommendation } = await import("@/server/advisor/advisor-service");

const sampleIntent: LearningIntent = {
  goal: "Learn Python",
  currentSkillLevel: "BEGINNER",
  topics: ["Python"],
  availableHoursPerWeek: null,
  budgetPreference: "ANY",
  constraints: [],
};

const fakeProvider: AIProvider = { name: "fake", generateCompletion: vi.fn() };

beforeEach(() => {
  extractLearningIntent.mockReset();
  getCandidateCourses.mockReset();
  generateRecommendation.mockReset();
  getAIProvider.mockReset();
  getAIProvider.mockReturnValue(fakeProvider);
});

describe("getCourseAdvisorRecommendation", () => {
  it("chains intent extraction -> catalog retrieval -> recommendation, in order", async () => {
    extractLearningIntent.mockResolvedValue(sampleIntent);
    getCandidateCourses.mockResolvedValue([{ slug: "python-basics" }]);
    generateRecommendation.mockResolvedValue({
      recommendations: [{ course: { slug: "python-basics" }, reason: "fits", order: 1 }],
      pathSummary: "Start here.",
      generatedBy: "ai",
    });

    const result = await getCourseAdvisorRecommendation("I want to learn Python");

    expect(extractLearningIntent).toHaveBeenCalledWith("I want to learn Python", fakeProvider);
    expect(getCandidateCourses).toHaveBeenCalledWith(sampleIntent);
    expect(generateRecommendation).toHaveBeenCalledWith(
      sampleIntent,
      [{ slug: "python-basics" }],
      fakeProvider,
    );
    expect(result).toEqual({
      interpretedGoal: "Learn Python",
      intent: sampleIntent,
      recommendations: [{ course: { slug: "python-basics" }, reason: "fits", order: 1 }],
      pathSummary: "Start here.",
      generatedBy: "ai",
    });
  });

  it("uses an injected provider instead of the env-configured one when supplied", async () => {
    extractLearningIntent.mockResolvedValue(sampleIntent);
    getCandidateCourses.mockResolvedValue([]);
    generateRecommendation.mockResolvedValue({
      recommendations: [],
      pathSummary: null,
      generatedBy: "fallback-ranking",
    });

    const injectedProvider: AIProvider = { name: "injected", generateCompletion: vi.fn() };
    await getCourseAdvisorRecommendation("hi", { provider: injectedProvider });

    expect(getAIProvider).not.toHaveBeenCalled();
    expect(extractLearningIntent).toHaveBeenCalledWith("hi", injectedProvider);
  });

  it("propagates errors from intent extraction without calling the catalog", async () => {
    extractLearningIntent.mockRejectedValue(new Error("provider down"));

    await expect(getCourseAdvisorRecommendation("hi")).rejects.toThrow("provider down");
    expect(getCandidateCourses).not.toHaveBeenCalled();
  });

  it("returns an empty-but-successful result when no courses match the intent", async () => {
    extractLearningIntent.mockResolvedValue(sampleIntent);
    getCandidateCourses.mockResolvedValue([]);
    generateRecommendation.mockResolvedValue({
      recommendations: [],
      pathSummary: null,
      generatedBy: "fallback-ranking",
    });

    const result = await getCourseAdvisorRecommendation("I want to learn something obscure");

    expect(result.recommendations).toEqual([]);
  });
});
