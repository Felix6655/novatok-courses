import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";

const getTutorAnswer = vi.fn();

vi.mock("@/server/tutor/tutor-service", () => ({
  getTutorAnswer: (...args: unknown[]) => getTutorAnswer(...args),
}));

const { POST } = await import("@/app/api/ai/tutor/route");
const { TutorCourseNotFoundError, TutorNoContentError } = await import("@/server/tutor/errors");

function request(body: unknown) {
  return new Request("http://localhost/api/ai/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getTutorAnswer.mockReset();
});

describe("POST /api/ai/tutor", () => {
  it("returns 200 with the tutor result for a valid request", async () => {
    getTutorAnswer.mockResolvedValue({ answer: "A variable stores a value.", grounded: true });

    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", question: "Explain variables" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.answer).toBe("A variable stores a value.");
  });

  it("returns 400 when the request body isn't valid JSON", async () => {
    const response = await POST(request("not json"));
    expect(response.status).toBe(400);
    expect(getTutorAnswer).not.toHaveBeenCalled();
  });

  it("returns 400 when courseSlug is missing", async () => {
    const response = await POST(request({ question: "hi" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when question is empty", async () => {
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "" }));
    expect(response.status).toBe(400);
  });

  it("returns 404 when the course doesn't exist", async () => {
    getTutorAnswer.mockRejectedValue(new TutorCourseNotFoundError("unknown-course"));
    const response = await POST(request({ courseSlug: "unknown-course", question: "hi" }));
    expect(response.status).toBe(404);
  });

  it("returns 422 when the course has no Tutor content yet", async () => {
    getTutorAnswer.mockRejectedValue(new TutorNoContentError("some-course"));
    const response = await POST(request({ courseSlug: "some-course", question: "hi" }));
    expect(response.status).toBe(422);
  });

  it("returns 503 when the AI provider is unavailable", async () => {
    getTutorAnswer.mockRejectedValue(new AIProviderUnavailableError("ollama", "could not reach Ollama"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
    expect(response.status).toBe(503);
  });

  it("returns 503 when the AI provider is misconfigured", async () => {
    getTutorAnswer.mockRejectedValue(new AIProviderConfigError("OLLAMA_MODEL is required"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
    expect(response.status).toBe(503);
  });

  it("returns 502 when the model output was unusable", async () => {
    getTutorAnswer.mockRejectedValue(new InvalidModelOutputError("could not parse response"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
    expect(response.status).toBe(502);
  });

  it("returns 500 with no stack trace for an unexpected error", async () => {
    getTutorAnswer.mockRejectedValue(new Error("something exploded with a secret path"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret path");
  });
});
