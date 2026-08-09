import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getStudentIdentity = vi.fn(); const redirect = vi.fn();
vi.mock("@/server/identity/dev-identity", () => ({ getStudentIdentity: () => getStudentIdentity() }));
vi.mock("next/navigation", () => ({ redirect: (target: string) => redirect(target) }));
const { InvalidSocialSessionError } = await import("@/server/identity/novatok-social-identity");
const { requireBrowserStudentIdentity } = await import("@/server/identity/browser-identity");

beforeEach(() => { getStudentIdentity.mockReset(); redirect.mockReset(); vi.stubEnv("STUDENT_IDENTITY_MODE", "novatok-social"); });
afterEach(() => vi.unstubAllEnvs());

describe("requireBrowserStudentIdentity", () => {
  it("allows valid sessions and starts handoff for missing browser identity", async () => {
    getStudentIdentity.mockResolvedValueOnce({ studentId: "user" });
    await expect(requireBrowserStudentIdentity("/learn")).resolves.toEqual({ studentId: "user" });
    getStudentIdentity.mockRejectedValueOnce(new InvalidSocialSessionError());
    redirect.mockImplementationOnce(() => { throw new Error("NEXT_REDIRECT"); });
    await expect(requireBrowserStudentIdentity("/learn/course?lessonSlug=one")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/api/auth/novatok/login?returnTo=%2Flearn%2Fcourse%3FlessonSlug%3Done");
  });
});
