import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError } from "@/ai/errors";
import { __resetAIRequestGuardStateForTests } from "@/lib/ai-request-guard";

const getStudentIdentity = vi.fn();
const getLearningCoachAdvice = vi.fn();

vi.mock("@/server/identity/dev-identity", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/identity/dev-identity")>()),
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/learning/learning-coach", () => ({
  getLearningCoachAdvice: (...args: unknown[]) => getLearningCoachAdvice(...args),
}));

const { POST } = await import("@/app/api/ai/learning-coach/route");
const { EnrollmentCourseNotFoundError, NotEnrolledError } = await import("@/server/learning/errors");
const { MissingStudentIdentityError } = await import("@/server/identity/dev-identity");

function request(body: unknown) {
  return new Request("http://localhost/api/ai/learning-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getStudentIdentity.mockReset();
  getLearningCoachAdvice.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "dev-student-1" });
  __resetAIRequestGuardStateForTests();
});

describe("POST /api/ai/learning-coach", () => {
  it("returns 200 with the coach result for a valid request", async () => {
    getLearningCoachAdvice.mockResolvedValue({
      courseSlug: "javascript-fundamentals",
      explanation: "Keep going!",
      nextLesson: null,
      studyTips: [],
      suggestedCourses: [],
      isCourseComplete: false,
      answerSource: "ai",
    });

    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.explanation).toBe("Keep going!");
    expect(getLearningCoachAdvice).toHaveBeenCalledWith(
      "dev-student-1",
      "javascript-fundamentals",
      expect.objectContaining({ recentTutorHistory: [] }),
    );
  });

  it("never trusts a client-supplied studentId in the body", async () => {
    getLearningCoachAdvice.mockResolvedValue({ explanation: "ok" });
    await POST(request({ courseSlug: "javascript-fundamentals", studentId: "someone-elses-id" }));
    expect(getLearningCoachAdvice).toHaveBeenCalledWith(
      "dev-student-1",
      "javascript-fundamentals",
      expect.anything(),
    );
  });

  it("returns 400 for a malformed courseSlug", async () => {
    const response = await POST(request({ courseSlug: "Not A Slug!" }));
    expect(response.status).toBe(400);
    expect(getLearningCoachAdvice).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown course", async () => {
    getLearningCoachAdvice.mockRejectedValue(new EnrollmentCourseNotFoundError("not-a-real-course"));
    const response = await POST(request({ courseSlug: "not-a-real-course" }));
    expect(response.status).toBe(404);
  });

  it("returns 403 when the student isn't enrolled", async () => {
    getLearningCoachAdvice.mockRejectedValue(new NotEnrolledError("javascript-fundamentals"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    expect(response.status).toBe(403);
  });

  it("returns 503 when the AI provider is unavailable", async () => {
    getLearningCoachAdvice.mockRejectedValue(
      new AIProviderUnavailableError("ollama", "could not reach Ollama"),
    );
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when the AI provider is misconfigured", async () => {
    getLearningCoachAdvice.mockRejectedValue(new AIProviderConfigError("OLLAMA_MODEL is required"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    expect(response.status).toBe(503);
  });

  it("returns 500 with no stack trace for an unexpected error, but logs it server-side", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    getLearningCoachAdvice.mockRejectedValue(new Error("something exploded with a secret path"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret path");
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][0])).toContain("secret path");

    consoleError.mockRestore();
  });

  it("returns 401 instead of a 500 when no student identity can be resolved", async () => {
    getStudentIdentity.mockRejectedValue(new MissingStudentIdentityError());
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(getLearningCoachAdvice).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain("development proxy");
  });

  it("returns 413 when the request body is too large", async () => {
    const response = await POST(request({ courseSlug: "a".repeat(30_000) }));
    expect(response.status).toBe(413);
    expect(getLearningCoachAdvice).not.toHaveBeenCalled();
  });
});
