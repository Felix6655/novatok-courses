import { describe, expect, it } from "vitest";
import {
  practiceEvaluateRequestSchema,
  practiceEvaluationModelResponseSchema,
  practiceModelResponseSchema,
  practiceRequestSchema,
} from "@/lib/validation/practice";

describe("practiceRequestSchema", () => {
  it("accepts a valid courseSlug and lessonSlug", () => {
    const result = practiceRequestSchema.safeParse({
      courseSlug: "javascript-fundamentals",
      lessonSlug: "variables-and-data-types",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed slug", () => {
    const result = practiceRequestSchema.safeParse({
      courseSlug: "Not A Slug!",
      lessonSlug: "variables-and-data-types",
    });
    expect(result.success).toBe(false);
  });
});

describe("practiceModelResponseSchema", () => {
  it("accepts a well-formed MULTIPLE_CHOICE question", () => {
    const result = practiceModelResponseSchema.safeParse({
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: ["var", "let", "const"],
      correctChoiceIndex: 2,
      modelAnswer: null,
      explanation: "const can't be reassigned.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a MULTIPLE_CHOICE question missing choices", () => {
    const result = practiceModelResponseSchema.safeParse({
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: null,
      correctChoiceIndex: null,
      modelAnswer: null,
      explanation: "const can't be reassigned.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a MULTIPLE_CHOICE question with an out-of-range correctChoiceIndex", () => {
    const result = practiceModelResponseSchema.safeParse({
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: ["var", "let"],
      correctChoiceIndex: 5,
      modelAnswer: null,
      explanation: "const can't be reassigned.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a well-formed SHORT_ANSWER question", () => {
    const result = practiceModelResponseSchema.safeParse({
      questionType: "SHORT_ANSWER",
      question: "What does `const` mean?",
      choices: null,
      correctChoiceIndex: null,
      modelAnswer: "A binding that can't be reassigned.",
      explanation: "const declares an immutable binding reference.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a SHORT_ANSWER question missing a modelAnswer", () => {
    const result = practiceModelResponseSchema.safeParse({
      questionType: "SHORT_ANSWER",
      question: "What does `const` mean?",
      choices: null,
      correctChoiceIndex: null,
      modelAnswer: null,
      explanation: "const declares an immutable binding reference.",
    });
    expect(result.success).toBe(false);
  });
});

describe("practiceEvaluateRequestSchema", () => {
  it("accepts a practiceId and a non-empty answer", () => {
    const result = practiceEvaluateRequestSchema.safeParse({ practiceId: "abc-123", studentAnswer: "2" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty studentAnswer", () => {
    const result = practiceEvaluateRequestSchema.safeParse({ practiceId: "abc-123", studentAnswer: "" });
    expect(result.success).toBe(false);
  });
});

describe("practiceEvaluationModelResponseSchema", () => {
  it("accepts a bounded correct/feedback shape", () => {
    const result = practiceEvaluationModelResponseSchema.safeParse({
      correct: true,
      feedback: "Nice, that's exactly right.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing correct", () => {
    const result = practiceEvaluationModelResponseSchema.safeParse({ feedback: "ok" });
    expect(result.success).toBe(false);
  });
});
