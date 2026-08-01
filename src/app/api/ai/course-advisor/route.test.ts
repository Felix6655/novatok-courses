import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";

const getCourseAdvisorRecommendation = vi.fn();

vi.mock("@/server/advisor/advisor-service", () => ({
  getCourseAdvisorRecommendation: (...args: unknown[]) => getCourseAdvisorRecommendation(...args),
}));

const { POST } = await import("@/app/api/ai/course-advisor/route");

function request(body: unknown) {
  return new Request("http://localhost/api/ai/course-advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getCourseAdvisorRecommendation.mockReset();
});

describe("POST /api/ai/course-advisor", () => {
  it("returns 200 with the advisor result for a valid message", async () => {
    getCourseAdvisorRecommendation.mockResolvedValue({
      interpretedGoal: "Learn Python",
      intent: { goal: "Learn Python" },
      recommendations: [],
      pathSummary: null,
      generatedBy: "ai",
    });

    const response = await POST(request({ message: "I want to learn Python" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.interpretedGoal).toBe("Learn Python");
    expect(getCourseAdvisorRecommendation).toHaveBeenCalledWith("I want to learn Python");
  });

  it("returns 400 when the request body isn't valid JSON", async () => {
    const response = await POST(request("not json"));
    expect(response.status).toBe(400);
    expect(getCourseAdvisorRecommendation).not.toHaveBeenCalled();
  });

  it("returns 400 when message is missing", async () => {
    const response = await POST(request({}));
    expect(response.status).toBe(400);
  });

  it("returns 400 when message is empty", async () => {
    const response = await POST(request({ message: "" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when message exceeds the max length", async () => {
    const response = await POST(request({ message: "a".repeat(1001) }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when the AI provider is unavailable", async () => {
    getCourseAdvisorRecommendation.mockRejectedValue(
      new AIProviderUnavailableError("ollama", "could not reach Ollama"),
    );

    const response = await POST(request({ message: "hi" }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when the AI provider is misconfigured", async () => {
    getCourseAdvisorRecommendation.mockRejectedValue(
      new AIProviderConfigError("OLLAMA_MODEL is required"),
    );

    const response = await POST(request({ message: "hi" }));
    expect(response.status).toBe(503);
  });

  it("returns 502 when the model output was unusable", async () => {
    getCourseAdvisorRecommendation.mockRejectedValue(
      new InvalidModelOutputError("could not parse response"),
    );

    const response = await POST(request({ message: "hi" }));
    expect(response.status).toBe(502);
  });

  it("returns 500 with no stack trace for an unexpected error", async () => {
    getCourseAdvisorRecommendation.mockRejectedValue(new Error("something exploded with a secret path"));

    const response = await POST(request({ message: "hi" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret path");
    expect(body.error).toBe("Unexpected server error");
  });
});
