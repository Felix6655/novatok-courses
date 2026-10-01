import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderUnavailableError } from "@/ai/errors";
import { __resetAIRequestGuardStateForTests } from "@/lib/ai-request-guard";

const buildGuidedLearningPlan = vi.fn();

vi.mock("@/server/guided-learning/guided-learning-service", () => ({
  buildGuidedLearningPlan: (...args: unknown[]) => buildGuidedLearningPlan(...args),
}));

const { POST } = await import("@/app/api/ai/guided-learning/route");

function request(body: unknown) {
  return new Request("http://localhost/api/ai/guided-learning", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  buildGuidedLearningPlan.mockReset();
  __resetAIRequestGuardStateForTests();
});

describe("POST /api/ai/guided-learning", () => {
  it("returns 200 for a valid learning goal", async () => {
    buildGuidedLearningPlan.mockResolvedValue({
      goalSummary: "Learn AI",
      estimatedWeeks: 6,
      steps: [],
      studyTips: [],
      resourceQueries: [],
      verifiedResources: [],
      source: "ai",
    });

    const response = await POST(request({
      goal: "Learn artificial intelligence",
      currentLevel: "BEGINNER",
      weeklyHours: 5,
    }));

    expect(response.status).toBe(200);
    expect(buildGuidedLearningPlan).toHaveBeenCalledOnce();
  });

  it("returns 400 for an invalid body", async () => {
    const response = await POST(request({ goal: "" }));
    expect(response.status).toBe(400);
    expect(buildGuidedLearningPlan).not.toHaveBeenCalled();
  });

  it("returns 503 when the provider is unavailable", async () => {
    buildGuidedLearningPlan.mockRejectedValue(
      new AIProviderUnavailableError("ollama", "offline"),
    );
    const response = await POST(request({ goal: "Learn Python" }));
    expect(response.status).toBe(503);
  });
});
