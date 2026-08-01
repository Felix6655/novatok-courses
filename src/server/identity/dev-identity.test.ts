import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
