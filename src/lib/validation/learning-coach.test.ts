import { describe, expect, it } from "vitest";
import { learningCoachModelResponseSchema, learningCoachRequestSchema } from "@/lib/validation/learning-coach";
import { MAX_HISTORY_TURNS } from "@/lib/validation/tutor";

describe("learningCoachRequestSchema", () => {
  it("accepts a minimal valid request and defaults recentTutorHistory to []", () => {
    const result = learningCoachRequestSchema.parse({ courseSlug: "javascript-fundamentals" });
    expect(result.recentTutorHistory).toEqual([]);
  });

  it("rejects a malformed courseSlug", () => {
    expect(learningCoachRequestSchema.safeParse({ courseSlug: "Not A Slug!" }).success).toBe(false);
  });

  it("accepts bounded recentTutorHistory", () => {
    const result = learningCoachRequestSchema.parse({
      courseSlug: "javascript-fundamentals",
      recentTutorHistory: [{ role: "user", content: "Explain variables" }],
    });
    expect(result.recentTutorHistory).toHaveLength(1);
  });

  it(`rejects recentTutorHistory longer than ${MAX_HISTORY_TURNS} turns`, () => {
    const history = Array.from({ length: MAX_HISTORY_TURNS + 1 }, (_, i) => ({
      role: "user" as const,
      content: `turn ${i}`,
    }));
    expect(
      learningCoachRequestSchema.safeParse({ courseSlug: "javascript-fundamentals", recentTutorHistory: history })
        .success,
    ).toBe(false);
  });
});

describe("learningCoachModelResponseSchema", () => {
  it("accepts a minimal valid response and defaults studyTips to [] and practiceSuggestion to null", () => {
    const result = learningCoachModelResponseSchema.parse({ explanation: "Keep going!" });
    expect(result.studyTips).toEqual([]);
    expect(result.practiceSuggestion).toBeNull();
  });

  it("accepts a bounded practiceSuggestion string", () => {
    const result = learningCoachModelResponseSchema.parse({
      explanation: "ok",
      practiceSuggestion: "Try practicing the last lesson again.",
    });
    expect(result.practiceSuggestion).toBe("Try practicing the last lesson again.");
  });

  it("rejects an empty explanation", () => {
    expect(learningCoachModelResponseSchema.safeParse({ explanation: "" }).success).toBe(false);
  });

  it("rejects more than 5 study tips", () => {
    const studyTips = Array.from({ length: 6 }, (_, i) => `tip ${i}`);
    expect(
      learningCoachModelResponseSchema.safeParse({ explanation: "ok", studyTips }).success,
    ).toBe(false);
  });

  it("does not accept a lesson/course identifier field at all (schema has none to hallucinate)", () => {
    const result = learningCoachModelResponseSchema.parse({
      explanation: "ok",
      recommendedLessonSlug: "made-up-lesson",
    });
    expect(result).not.toHaveProperty("recommendedLessonSlug");
  });
});
