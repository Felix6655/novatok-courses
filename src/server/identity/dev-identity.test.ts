import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookiesGet = vi.fn();
const getNovaTokSocialIdentity = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (name: string) => cookiesGet(name) }) }));
vi.mock("@/server/identity/novatok-social-identity", () => ({ getNovaTokSocialIdentity: (...args: unknown[]) => getNovaTokSocialIdentity(...args) }));
const { getStudentIdentity, MissingStudentIdentityError, DEV_STUDENT_COOKIE } = await import("@/server/identity/dev-identity");
const { COURSES_SESSION_COOKIE } = await import("@/server/identity/constants");

beforeEach(() => { cookiesGet.mockReset(); getNovaTokSocialIdentity.mockReset(); });
afterEach(() => vi.unstubAllEnvs());

describe("getStudentIdentity", () => {
  it("uses the dev cookie by default outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "");
    cookiesGet.mockImplementation((name: string) => name === DEV_STUDENT_COOKIE ? { value: "dev-abc-123" } : undefined);
    await expect(getStudentIdentity()).resolves.toEqual({ studentId: "dev-abc-123" });
  });

  it("throws when the development cookie is absent", async () => {
    vi.stubEnv("NODE_ENV", "development");
    cookiesGet.mockReturnValue(undefined);
    await expect(getStudentIdentity()).rejects.toBeInstanceOf(MissingStudentIdentityError);
  });

  it("delegates social mode to the authoritative Social session adapter", async () => {
    vi.stubEnv("STUDENT_IDENTITY_MODE", "novatok-social");
    cookiesGet.mockImplementation((name: string) => name === COURSES_SESSION_COOKIE ? { value: "courses-token" } : undefined);
    getNovaTokSocialIdentity.mockResolvedValue({ studentId: "social-user-1" });
    await expect(getStudentIdentity()).resolves.toEqual({ studentId: "social-user-1" });
    expect(getNovaTokSocialIdentity).toHaveBeenCalledWith("courses-token");
  });

  it("rejects development mode in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "development");
    await expect(getStudentIdentity()).rejects.toThrow(/novatok-social/);
  });
});
