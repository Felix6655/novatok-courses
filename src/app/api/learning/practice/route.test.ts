import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { __resetAIRequestGuardStateForTests } from "@/lib/ai-request-guard";

const getStudentIdentity = vi.fn();
const generatePracticeQuestion = vi.fn();

vi.mock("@/server/identity/dev-identity", () => ({
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/learning/practice", () => ({
  generatePracticeQuestion: (...args: unknown[]) => generatePracticeQuestion(...args),
}));

const { POST } = await import("@/app/api/learning/practice/route");
const {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
} = await import("@/server/learning/errors");

function request(body: unknown) {
  return new Request("http://localhost/api/learning/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getStudentIdentity.mockReset();
  generatePracticeQuestion.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "dev-student-1" });
  __resetAIRequestGuardStateForTests();
});

describe("POST /api/learning/practice", () => {
  it("returns 200 with a generated practice question, never the answer key", async () => {
    generatePracticeQuestion.mockResolvedValue({
      practiceId: "practice-abc",
      courseSlug: "javascript-fundamentals",
      lessonSlug: "variables-and-data-types",
      lessonTitle: "Variables and Data Types",
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: ["var", "let", "const"],
    });

    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.practiceId).toBe("practice-abc");
    expect(body).not.toHaveProperty("correctChoiceIndex");
    expect(generatePracticeQuestion).toHaveBeenCalledWith(
      "dev-student-1",
      "javascript-fundamentals",
      "variables-and-data-types",
    );
  });

  it("returns 400 for a missing lessonSlug", async () => {
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    expect(response.status).toBe(400);
    expect(generatePracticeQuestion).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown course", async () => {
    generatePracticeQuestion.mockRejectedValue(new EnrollmentCourseNotFoundError("not-a-real-course"));
    const response = await POST(request({ courseSlug: "not-a-real-course", lessonSlug: "some-lesson" }));
    expect(response.status).toBe(404);
  });

  it("returns 404 for a lesson that doesn't belong to the course", async () => {
    generatePracticeQuestion.mockRejectedValue(
      new LearningLessonNotFoundError("javascript-fundamentals", "not-a-real-lesson"),
    );
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "not-a-real-lesson" }),
    );
    expect(response.status).toBe(404);
  });

  it("returns 403 when the student isn't enrolled", async () => {
    generatePracticeQuestion.mockRejectedValue(new NotEnrolledError("javascript-fundamentals"));
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    expect(response.status).toBe(403);
  });

  it("returns 503 when the AI provider is unavailable", async () => {
    generatePracticeQuestion.mockRejectedValue(
      new AIProviderUnavailableError("ollama", "could not reach Ollama"),
    );
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    expect(response.status).toBe(503);
  });

  it("returns 503 when the AI provider is misconfigured", async () => {
    generatePracticeQuestion.mockRejectedValue(new AIProviderConfigError("OLLAMA_MODEL is required"));
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    expect(response.status).toBe(503);
  });

  it("returns 502 when the generated question was unusable", async () => {
    generatePracticeQuestion.mockRejectedValue(new InvalidModelOutputError("could not parse response"));
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    expect(response.status).toBe(502);
  });

  it("returns 413 when the request body is too large", async () => {
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "a".repeat(30_000) }),
    );
    expect(response.status).toBe(413);
    expect(generatePracticeQuestion).not.toHaveBeenCalled();
  });

  it("returns 429 after exceeding the per-client rate limit", async () => {
    generatePracticeQuestion.mockResolvedValue({ practiceId: "practice-abc" });
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const response = await POST(
        request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
      );
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
