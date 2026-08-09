import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { AUTH_TRANSACTION_LIFETIME_SECONDS, COURSES_SESSION_LIFETIME_SECONDS, createAuthTransactionToken, createCoursesSessionToken, createPkcePair, createState, validateInternalReturnTo, validateLogoutReturnTo, verifyAuthTransactionToken, verifyCoursesSessionToken } from "@/server/auth/courses-auth";

const SECRET = "z".repeat(48);
const USER_ID = "10000000-0000-4000-8000-000000000001";

describe("Courses auth tokens", () => {
  it("generates a valid S256 PKCE verifier/challenge and random state", () => {
    const first = createPkcePair(); const second = createPkcePair();
    expect(first.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.challenge).toBe(createHash("sha256").update(first.verifier, "ascii").digest("base64url"));
    expect(first.verifier).not.toBe(second.verifier); expect(createState()).not.toBe(createState());
  });
  it("validates signed transactions and rejects tampering and expiry", () => {
    const token = createAuthTransactionToken({ state: "a".repeat(43), verifier: "v".repeat(43), returnTo: "/learn/course?lessonSlug=one" }, SECRET, 1_000);
    expect(verifyAuthTransactionToken(token, SECRET, 1_001)?.returnTo).toBe("/learn/course?lessonSlug=one");
    expect(verifyAuthTransactionToken(`${token}x`, SECRET, 1_001)).toBeNull();
    expect(verifyAuthTransactionToken(token, SECRET, 1_000 + AUTH_TRANSACTION_LIFETIME_SECONDS)).toBeNull();
    expect(token).not.toContain(SECRET);
  });
  it("validates local sessions and rejects tampering and expiry", () => {
    const token = createCoursesSessionToken(USER_ID, SECRET, 2_000);
    expect(verifyCoursesSessionToken(token, SECRET, 2_001)).toEqual({ studentId: USER_ID });
    expect(verifyCoursesSessionToken(`${token}x`, SECRET, 2_001)).toBeNull();
    expect(verifyCoursesSessionToken(token, SECRET, 2_000 + COURSES_SESSION_LIFETIME_SECONDS)).toBeNull();
  });
  it("blocks external and auth-loop return targets and restricts logout targets", () => {
    expect(validateInternalReturnTo("https://evil.example")).toBe("/learn");
    expect(validateInternalReturnTo("//evil.example")).toBe("/learn");
    expect(validateInternalReturnTo("/api/auth/novatok/login")).toBe("/learn");
    expect(validateInternalReturnTo("/learn/course?lessonSlug=one")).toBe("/learn/course?lessonSlug=one");
    expect(validateLogoutReturnTo("/learn")).toBe("/learn");
    expect(validateLogoutReturnTo("/learn/private")).toBe("/courses");
  });
});
