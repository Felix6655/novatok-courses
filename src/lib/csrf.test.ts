import { describe, expect, it } from "vitest";
import { isTrustedOrigin, requiresTrustedOrigin } from "@/lib/csrf";

describe("Courses CSRF contract", () => {
  it("protects identity-bearing mutations but not reads or the public advisor", () => {
    expect(requiresTrustedOrigin("/api/learning/enroll", "POST")).toBe(true);
    expect(requiresTrustedOrigin("/api/ai/tutor", "POST")).toBe(true);
    expect(requiresTrustedOrigin("/api/ai/course-advisor", "POST")).toBe(false);
    expect(requiresTrustedOrigin("/api/learning/enroll", "GET")).toBe(false);
  });

  it("accepts same-origin/configured origins and rejects missing or foreign origins", () => {
    expect(isTrustedOrigin("https://courses.example/api/learning/enroll", "https://courses.example")).toBe(true);
    expect(isTrustedOrigin("https://courses.example/api/learning/enroll", "https://social.example", "https://social.example")).toBe(true);
    expect(isTrustedOrigin("https://courses.example/api/learning/enroll", null)).toBe(false);
    expect(isTrustedOrigin("https://courses.example/api/learning/enroll", "https://evil.example")).toBe(false);
  });
});