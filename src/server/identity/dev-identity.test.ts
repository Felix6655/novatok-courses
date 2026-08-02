import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookiesGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookiesGet(name),
  }),
}));

const { getStudentIdentity, MissingStudentIdentityError, DEV_STUDENT_COOKIE } = await import(
  "@/server/identity/dev-identity"
);

beforeEach(() => {
  cookiesGet.mockReset();
});

describe("getStudentIdentity", () => {
  it("returns the studentId from the dev identity cookie when present", async () => {
    cookiesGet.mockImplementation((name: string) =>
      name === DEV_STUDENT_COOKIE ? { value: "dev-abc-123" } : undefined,
    );

    const identity = await getStudentIdentity();
    expect(identity).toEqual({ studentId: "dev-abc-123" });
  });

  it("throws MissingStudentIdentityError when the cookie is absent", async () => {
    cookiesGet.mockReturnValue(undefined);
    await expect(getStudentIdentity()).rejects.toBeInstanceOf(MissingStudentIdentityError);
  });

  describe("production identity safety rail", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("refuses to resolve an identity in production without an explicit opt-in", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("STUDENT_IDENTITY_MODE", "");
      cookiesGet.mockImplementation((name: string) =>
        name === DEV_STUDENT_COOKIE ? { value: "dev-abc-123" } : undefined,
      );

      await expect(getStudentIdentity()).rejects.toThrow(/production identity adapter/);
    });

    it("resolves normally in production when STUDENT_IDENTITY_MODE=development is explicit", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("STUDENT_IDENTITY_MODE", "development");
      cookiesGet.mockImplementation((name: string) =>
        name === DEV_STUDENT_COOKIE ? { value: "dev-abc-123" } : undefined,
      );

      await expect(getStudentIdentity()).resolves.toEqual({ studentId: "dev-abc-123" });
    });
  });
});
