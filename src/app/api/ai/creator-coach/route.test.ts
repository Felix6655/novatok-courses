import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { __resetAIRequestGuardStateForTests } from "@/lib/ai-request-guard";

const getCreatorCoachPlan = vi.fn();

vi.mock("@/server/creator-coach/creator-coach-service", () => ({
  getCreatorCoachPlan: (...args: unknown[]) => getCreatorCoachPlan(...args),
}));

const { POST } = await import("@/app/api/ai/creator-coach/route");

function request(body: unknown) {
  return new Request("http://localhost/api/ai/creator-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getCreatorCoachPlan.mockReset();
  __resetAIRequestGuardStateForTests();
});

describe("POST /api/ai/creator-coach", () => {
  it("returns 200 with the plan for a valid message", async () => {
    getCreatorCoachPlan.mockResolvedValue({
      profile: { businessSummary: "Sells clothing online", focusAreas: ["audience growth"] },
      weeks: [{ weekNumber: 1, focus: "Foundations", summary: "...", course: { slug: "social-media-foundations-for-creators" } }],
      overallSummary: "Start here.",
      generatedBy: "ai",
    });

    const response = await POST(
      request({ message: "I sell clothing online and want to make $2,000/month" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.weeks[0].course.slug).toBe("social-media-foundations-for-creators");
    expect(getCreatorCoachPlan).toHaveBeenCalledWith(
      "I sell clothing online and want to make $2,000/month",
    );
  });

  it("returns 400 when the request body isn't valid JSON", async () => {
    const response = await POST(request("not json"));
    expect(response.status).toBe(400);
    expect(getCreatorCoachPlan).not.toHaveBeenCalled();
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
    getCreatorCoachPlan.mockRejectedValue(new AIProviderUnavailableError("ollama", "could not reach Ollama"));

    const response = await POST(request({ message: "I sell clothing online" }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when the AI provider is misconfigured", async () => {
    getCreatorCoachPlan.mockRejectedValue(new AIProviderConfigError("OLLAMA_MODEL is required"));

    const response = await POST(request({ message: "I sell clothing online" }));
    expect(response.status).toBe(503);
  });

  it("returns 502 when the model output was unusable", async () => {
    getCreatorCoachPlan.mockRejectedValue(new InvalidModelOutputError("could not parse response"));

    const response = await POST(request({ message: "I sell clothing online" }));
    expect(response.status).toBe(502);
  });

  it("returns 500 with no stack trace for an unexpected error, but logs it server-side", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    getCreatorCoachPlan.mockRejectedValue(new Error("something exploded with a secret path"));

    const response = await POST(request({ message: "I sell clothing online" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret path");
    expect(body.error).toBe("Unexpected server error");
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][0])).toContain("secret path");

    consoleError.mockRestore();
  });

  it("returns 413 when the request body is too large", async () => {
    const response = await POST(request({ message: "a".repeat(30_000) }));
    expect(response.status).toBe(413);
    expect(getCreatorCoachPlan).not.toHaveBeenCalled();
  });

  it("returns 429 after exceeding the per-client rate limit", async () => {
    getCreatorCoachPlan.mockResolvedValue({
      profile: {},
      weeks: [],
      overallSummary: null,
      generatedBy: "fallback-sequence",
    });

    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const response = await POST(request({ message: "I sell clothing online" }));
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
