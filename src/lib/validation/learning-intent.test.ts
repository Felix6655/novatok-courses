import { describe, expect, it } from "vitest";
import { courseAdvisorRequestSchema, learningIntentSchema } from "@/lib/validation/learning-intent";

describe("learningIntentSchema", () => {
  it("accepts a fully-specified intent", () => {
    const result = learningIntentSchema.safeParse({
      goal: "Learn Python for building AI tools",
      currentSkillLevel: "BEGINNER",
      topics: ["Python", "AI"],
      availableHoursPerWeek: 5,
      budgetPreference: "FREE",
      constraints: ["no coding experience"],
    });
    expect(result.success).toBe(true);
  });

  it("applies defaults when optional fields are omitted", () => {
    const result = learningIntentSchema.parse({ goal: "Learn Python", topics: ["Python"] });
    expect(result.currentSkillLevel).toBe("BEGINNER");
    expect(result.availableHoursPerWeek).toBeNull();
    expect(result.budgetPreference).toBe("ANY");
    expect(result.constraints).toEqual([]);
  });

  it("rejects an empty goal", () => {
    expect(learningIntentSchema.safeParse({ goal: "", topics: ["Python"] }).success).toBe(false);
  });

  it("rejects an empty topics array", () => {
    expect(learningIntentSchema.safeParse({ goal: "Learn Python", topics: [] }).success).toBe(false);
  });

  it("rejects more than 8 topics", () => {
    const result = learningIntentSchema.safeParse({
      goal: "Learn everything",
      topics: Array.from({ length: 9 }, (_, i) => `topic-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid currentSkillLevel", () => {
    const result = learningIntentSchema.safeParse({
      goal: "Learn Python",
      topics: ["Python"],
      currentSkillLevel: "EXPERT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid budgetPreference", () => {
    const result = learningIntentSchema.safeParse({
      goal: "Learn Python",
      topics: ["Python"],
      budgetPreference: "CHEAP",
    });
    expect(result.success).toBe(false);
  });
});

describe("courseAdvisorRequestSchema", () => {
  it("accepts a non-empty message", () => {
    expect(courseAdvisorRequestSchema.safeParse({ message: "I want to learn Python" }).success).toBe(
      true,
    );
  });

  it("rejects an empty message", () => {
    expect(courseAdvisorRequestSchema.safeParse({ message: "" }).success).toBe(false);
  });

  it("rejects a missing message field", () => {
    expect(courseAdvisorRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a message over 1000 characters", () => {
    expect(courseAdvisorRequestSchema.safeParse({ message: "a".repeat(1001) }).success).toBe(false);
  });
});
