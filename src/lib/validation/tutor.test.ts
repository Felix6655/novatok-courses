import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_TURNS,
  tutorModelResponseSchema,
  tutorRequestSchema,
} from "@/lib/validation/tutor";

describe("tutorRequestSchema", () => {
  it("accepts a minimal valid request and defaults responseMode to NORMAL", () => {
    const result = tutorRequestSchema.parse({
      courseSlug: "javascript-fundamentals",
      question: "Explain variables in simpler terms.",
    });
    expect(result.responseMode).toBe("NORMAL");
    expect(result.history).toEqual([]);
  });

  it("accepts an explicit responseMode and optional lessonSlug", () => {
    const result = tutorRequestSchema.parse({
      courseSlug: "javascript-fundamentals",
      question: "Give me an example.",
      lessonSlug: "variables-and-data-types",
      responseMode: "EXAMPLE",
    });
    expect(result.responseMode).toBe("EXAMPLE");
    expect(result.lessonSlug).toBe("variables-and-data-types");
  });

  it("rejects a missing courseSlug", () => {
    expect(tutorRequestSchema.safeParse({ question: "hi" }).success).toBe(false);
  });

  it("rejects an empty question", () => {
    expect(
      tutorRequestSchema.safeParse({ courseSlug: "javascript-fundamentals", question: "" }).success,
    ).toBe(false);
  });

  it("rejects a question over 500 characters", () => {
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "a".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid responseMode", () => {
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        responseMode: "HARD",
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed courseSlug", () => {
    expect(
      tutorRequestSchema.safeParse({ courseSlug: "Not A Slug!", question: "hi" }).success,
    ).toBe(false);
  });

  it("accepts bounded history turns", () => {
    const result = tutorRequestSchema.parse({
      courseSlug: "javascript-fundamentals",
      question: "Give me another example.",
      history: [
        { role: "user", content: "Explain variables" },
        { role: "assistant", content: "A variable stores a value." },
      ],
    });
    expect(result.history).toHaveLength(2);
  });

  it(`rejects history longer than ${MAX_HISTORY_TURNS} turns`, () => {
    const history = Array.from({ length: MAX_HISTORY_TURNS + 1 }, (_, i) => ({
      role: "user" as const,
      content: `turn ${i}`,
    }));
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        history,
      }).success,
    ).toBe(false);
  });

  it("accepts history at exactly the maximum turn count", () => {
    const history = Array.from({ length: MAX_HISTORY_TURNS }, (_, i) => ({
      role: "user" as const,
      content: `turn ${i}`,
    }));
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        history,
      }).success,
    ).toBe(true);
  });

  it("rejects a history turn with an invalid role", () => {
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        history: [{ role: "system", content: "not allowed" }],
      }).success,
    ).toBe(false);
  });

  it("rejects an oversized history message", () => {
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        history: [{ role: "user", content: "a".repeat(1001) }],
      }).success,
    ).toBe(false);
  });

  it("rejects an empty history message", () => {
    expect(
      tutorRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        question: "hi",
        history: [{ role: "user", content: "" }],
      }).success,
    ).toBe(false);
  });
});

describe("tutorModelResponseSchema", () => {
  it("accepts a minimal valid response and applies defaults", () => {
    const result = tutorModelResponseSchema.parse({ answer: "Variables store values." });
    expect(result.relevantLessonSlugs).toEqual([]);
    expect(result.outOfScope).toBe(false);
    expect(result.practiceQuestion).toBeNull();
  });

  it("accepts a full response with a practice question", () => {
    const result = tutorModelResponseSchema.parse({
      answer: "Here's a practice question.",
      relevantLessonSlugs: ["variables-and-data-types"],
      outOfScope: false,
      practiceQuestion: {
        question: "What keyword declares a constant?",
        choices: ["let", "const", "var"],
        answer: "const",
        explanation: "const declares a binding that can't be reassigned.",
      },
    });
    expect(result.practiceQuestion?.answer).toBe("const");
  });

  it("rejects an empty answer", () => {
    expect(tutorModelResponseSchema.safeParse({ answer: "" }).success).toBe(false);
  });

  it("rejects a practiceQuestion missing required fields", () => {
    expect(
      tutorModelResponseSchema.safeParse({
        answer: "ok",
        practiceQuestion: { question: "What is a variable?" },
      }).success,
    ).toBe(false);
  });
});
