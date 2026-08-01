import { describe, expect, it } from "vitest";
import { completeLessonRequestSchema, enrollRequestSchema } from "@/lib/validation/learning";

describe("enrollRequestSchema", () => {
  it("accepts a valid courseSlug", () => {
    expect(enrollRequestSchema.safeParse({ courseSlug: "javascript-fundamentals" }).success).toBe(
      true,
    );
  });

  it("rejects a missing courseSlug", () => {
    expect(enrollRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a malformed courseSlug", () => {
    expect(enrollRequestSchema.safeParse({ courseSlug: "Not A Slug!" }).success).toBe(false);
  });
});

describe("completeLessonRequestSchema", () => {
  it("accepts valid courseSlug and lessonSlug", () => {
    expect(
      completeLessonRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        lessonSlug: "variables-and-data-types",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing lessonSlug", () => {
    expect(
      completeLessonRequestSchema.safeParse({ courseSlug: "javascript-fundamentals" }).success,
    ).toBe(false);
  });

  it("rejects a malformed lessonSlug", () => {
    expect(
      completeLessonRequestSchema.safeParse({
        courseSlug: "javascript-fundamentals",
        lessonSlug: "Not A Slug!",
      }).success,
    ).toBe(false);
  });
});
