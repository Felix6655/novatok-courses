import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { __resetAIRequestGuardStateForTests } from "@/lib/ai-request-guard";

const getTutorAnswer = vi.fn();
const getStudentIdentity = vi.fn();

vi.mock("@/server/tutor/tutor-service", () => ({
  getTutorAnswer: (...args: unknown[]) => getTutorAnswer(...args),
}));
vi.mock("@/server/identity/dev-identity", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/identity/dev-identity")>()),
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));

const { POST } = await import("@/app/api/ai/tutor/route");
const { TutorCourseNotFoundError, TutorLessonNotFoundError, TutorNoContentError } = await import(
  "@/server/tutor/errors"
);
const { MissingStudentIdentityError } = await import("@/server/identity/dev-identity");
const { InvalidSocialSessionError } = await import("@/server/identity/novatok-social-identity");

function request(body: unknown) {
  return new Request("http://localhost/api/ai/tutor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getTutorAnswer.mockReset();
  getStudentIdentity.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "dev-student-1" });
  __resetAIRequestGuardStateForTests();
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

  it("never trusts a client-supplied studentId in the body, always resolving it from getStudentIdentity()", async () => {
    getTutorAnswer.mockResolvedValue({ answer: "ok" });
    await POST(
      request({
        courseSlug: "javascript-fundamentals",
        question: "Explain variables",
        studentId: "someone-elses-id",
      }),
    );
    expect(getTutorAnswer).toHaveBeenCalledWith(expect.anything(), "dev-student-1");
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

  it("returns 500 with no stack trace for an unexpected error, but logs it server-side", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    getTutorAnswer.mockRejectedValue(new Error("something exploded with a secret path"));
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain("secret path");
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][0])).toContain("secret path");

    consoleError.mockRestore();
  });

  it("returns 401 instead of a 500 when the development identity cookie is missing", async () => {
    getStudentIdentity.mockRejectedValue(new MissingStudentIdentityError());
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(getTutorAnswer).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain("development proxy");
  });

  it("returns 401 instead of a 500 when the NovaTok Social session is invalid or expired", async () => {
    getStudentIdentity.mockRejectedValue(new InvalidSocialSessionError());
    const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));

    expect(response.status).toBe(401);
    expect(getTutorAnswer).not.toHaveBeenCalled();
  });

  it("returns 404 when the lesson doesn't exist or belongs to another course", async () => {
    getTutorAnswer.mockRejectedValue(
      new TutorLessonNotFoundError("javascript-fundamentals", "not-a-real-lesson"),
    );
    const response = await POST(
      request({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        lessonSlug: "not-a-real-lesson",
      }),
    );
    expect(response.status).toBe(404);
  });

  it("accepts a valid lessonSlug and forwards it to the service", async () => {
    getTutorAnswer.mockResolvedValue({ answer: "ok" });
    await POST(
      request({
        courseSlug: "javascript-fundamentals",
        question: "Explain this",
        lessonSlug: "variables-and-data-types",
      }),
    );
    expect(getTutorAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ lessonSlug: "variables-and-data-types" }),
      "dev-student-1",
    );
  });

  it("returns 400 for a malformed lessonSlug", async () => {
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", question: "hi", lessonSlug: "Not A Slug!" }),
    );
    expect(response.status).toBe(400);
  });

  it("accepts bounded history and forwards it to the service", async () => {
    getTutorAnswer.mockResolvedValue({ answer: "ok" });
    const history = [
      { role: "user", content: "Explain variables" },
      { role: "assistant", content: "A variable stores a value." },
    ];
    await POST(request({ courseSlug: "javascript-fundamentals", question: "Give an example", history }));
    expect(getTutorAnswer).toHaveBeenCalledWith(expect.objectContaining({ history }), "dev-student-1");
  });

  it("returns 400 when history exceeds the maximum number of turns", async () => {
    const history = Array.from({ length: 7 }, (_, i) => ({ role: "user", content: `turn ${i}` }));
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", question: "hi", history }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 413 when the request body is too large", async () => {
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", question: "a".repeat(30_000) }),
    );
    expect(response.status).toBe(413);
    expect(getTutorAnswer).not.toHaveBeenCalled();
  });

  it("returns 429 after exceeding the per-client rate limit", async () => {
    getTutorAnswer.mockResolvedValue({ answer: "ok" });
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const response = await POST(request({ courseSlug: "javascript-fundamentals", question: "hi" }));
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
