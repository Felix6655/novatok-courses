import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { __resetAIRequestGuardStateForTests } from "@/lib/ai-request-guard";

const getStudentIdentity = vi.fn();
const evaluatePracticeAttempt = vi.fn();

vi.mock("@/server/identity/dev-identity", () => ({
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/learning/practice", () => ({
  evaluatePracticeAttempt: (...args: unknown[]) => evaluatePracticeAttempt(...args),
}));

const { POST } = await import("@/app/api/learning/practice/evaluate/route");
const { PracticeNotFoundError } = await import("@/server/learning/errors");

function request(body: unknown) {
  return new Request("http://localhost/api/learning/practice/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getStudentIdentity.mockReset();
  evaluatePracticeAttempt.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "dev-student-1" });
  __resetAIRequestGuardStateForTests();
});

describe("POST /api/learning/practice/evaluate", () => {
  it("returns 200 with the evaluation result for a valid request", async () => {
    evaluatePracticeAttempt.mockResolvedValue({
      courseSlug: "javascript-fundamentals",
      lessonSlug: "variables-and-data-types",
      questionType: "MULTIPLE_CHOICE",
      correct: true,
      correctAnswer: "const",
      explanation: "const can't be reassigned.",
      feedback: null,
    });

    const response = await POST(request({ practiceId: "practice-abc", studentAnswer: "2" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.correct).toBe(true);
    expect(evaluatePracticeAttempt).toHaveBeenCalledWith("dev-student-1", "practice-abc", "2");
  });

  it("returns 400 for a missing studentAnswer", async () => {
    const response = await POST(request({ practiceId: "practice-abc" }));
    expect(response.status).toBe(400);
    expect(evaluatePracticeAttempt).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown/expired practiceId", async () => {
    evaluatePracticeAttempt.mockRejectedValue(new PracticeNotFoundError());
    const response = await POST(request({ practiceId: "not-a-real-id", studentAnswer: "2" }));
    expect(response.status).toBe(404);
  });

  it("returns 503 when the AI provider is unavailable", async () => {
    evaluatePracticeAttempt.mockRejectedValue(
      new AIProviderUnavailableError("ollama", "could not reach Ollama"),
    );
    const response = await POST(request({ practiceId: "practice-abc", studentAnswer: "some text" }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when the AI provider is misconfigured", async () => {
    evaluatePracticeAttempt.mockRejectedValue(new AIProviderConfigError("OLLAMA_MODEL is required"));
    const response = await POST(request({ practiceId: "practice-abc", studentAnswer: "some text" }));
    expect(response.status).toBe(503);
  });

  it("returns 502 when the evaluation output was unusable", async () => {
    evaluatePracticeAttempt.mockRejectedValue(new InvalidModelOutputError("could not parse response"));
    const response = await POST(request({ practiceId: "practice-abc", studentAnswer: "some text" }));
    expect(response.status).toBe(502);
  });

  it("returns 429 after exceeding the per-client rate limit", async () => {
    evaluatePracticeAttempt.mockResolvedValue({ correct: true });
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const response = await POST(request({ practiceId: "practice-abc", studentAnswer: "2" }));
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
