import { describe, expect, it } from "vitest";
import {
  creatorCoachModelResponseSchema,
  creatorCoachRequestSchema,
  creatorProfileSchema,
} from "@/lib/validation/creator-coach";

describe("creatorProfileSchema", () => {
  it("accepts a fully-specified profile", () => {
    const result = creatorProfileSchema.safeParse({
      businessSummary: "Sells clothing online",
      platforms: ["Instagram", "TikTok"],
      experienceLevel: "BEGINNER",
      primaryGoal: "Reach $2,000/month in sales",
      focusAreas: ["audience growth", "social commerce"],
      constraints: ["700 Instagram followers"],
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults when optional fields are omitted", () => {
    const result = creatorProfileSchema.parse({
      businessSummary: "Sells clothing online",
      primaryGoal: "Grow sales",
      focusAreas: ["audience growth"],
    });
    expect(result.platforms).toEqual([]);
    expect(result.experienceLevel).toBe("BEGINNER");
    expect(result.constraints).toEqual([]);
  });

  it("rejects an empty businessSummary", () => {
    const result = creatorProfileSchema.safeParse({
      businessSummary: "",
      primaryGoal: "Grow sales",
      focusAreas: ["audience growth"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty focusAreas array", () => {
    const result = creatorProfileSchema.safeParse({
      businessSummary: "Sells clothing online",
      primaryGoal: "Grow sales",
      focusAreas: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 8 focus areas", () => {
    const result = creatorProfileSchema.safeParse({
      businessSummary: "Sells clothing online",
      primaryGoal: "Grow sales",
      focusAreas: Array.from({ length: 9 }, (_, i) => `area-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid experienceLevel", () => {
    const result = creatorProfileSchema.safeParse({
      businessSummary: "Sells clothing online",
      primaryGoal: "Grow sales",
      focusAreas: ["audience growth"],
      experienceLevel: "EXPERT",
    });
    expect(result.success).toBe(false);
  });
});

describe("creatorCoachRequestSchema", () => {
  it("accepts a non-empty message", () => {
    expect(
      creatorCoachRequestSchema.safeParse({ message: "I sell clothing online" }).success,
    ).toBe(true);
  });

  it("rejects an empty message", () => {
    expect(creatorCoachRequestSchema.safeParse({ message: "" }).success).toBe(false);
  });

  it("rejects a missing message field", () => {
    expect(creatorCoachRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a message over 1000 characters", () => {
    expect(creatorCoachRequestSchema.safeParse({ message: "a".repeat(1001) }).success).toBe(false);
  });
});

describe("creatorCoachModelResponseSchema", () => {
  it("accepts a well-formed weekly plan", () => {
    const result = creatorCoachModelResponseSchema.safeParse({
      weeks: [{ focus: "Foundations", summary: "Nail down your niche.", courseSlug: "social-media-foundations-for-creators" }],
      overallSummary: "Start with the basics.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty weeks array", () => {
    const result = creatorCoachModelResponseSchema.safeParse({ weeks: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 8 weeks", () => {
    const result = creatorCoachModelResponseSchema.safeParse({
      weeks: Array.from({ length: 9 }, (_, i) => ({
        focus: `Week ${i}`,
        summary: "Do something.",
        courseSlug: "some-course",
      })),
    });
    expect(result.success).toBe(false);
  });

  it("defaults overallSummary to null when omitted", () => {
    const result = creatorCoachModelResponseSchema.parse({
      weeks: [{ focus: "Foundations", summary: "Nail down your niche.", courseSlug: "some-course" }],
    });
    expect(result.overallSummary).toBeNull();
  });
});
