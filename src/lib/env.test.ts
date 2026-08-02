import { afterEach, describe, expect, it, vi } from "vitest";
import { EnvValidationError, assertIdentityModeIsSafe, getDatabaseUrl } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getDatabaseUrl", () => {
  it("returns a valid DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/novatok_courses?schema=public");
    expect(getDatabaseUrl()).toBe("postgresql://user:pass@localhost:5432/novatok_courses?schema=public");
  });

  it("throws EnvValidationError when DATABASE_URL is missing", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(() => getDatabaseUrl()).toThrow(EnvValidationError);
  });

  it("throws EnvValidationError when DATABASE_URL is malformed", () => {
    vi.stubEnv("DATABASE_URL", "not-a-url");
    expect(() => getDatabaseUrl()).toThrow(EnvValidationError);
  });
  it("throws EnvValidationError when DATABASE_URL uses a non-PostgreSQL protocol", () => {
    vi.stubEnv("DATABASE_URL", "https://example.com/database");
    expect(() => getDatabaseUrl()).toThrow(EnvValidationError);
  });
});

describe("assertIdentityModeIsSafe", () => {
  it("does not throw outside production (development, test, undefined)", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "");
    expect(() => assertIdentityModeIsSafe()).not.toThrow();

    vi.stubEnv("NODE_ENV", "test");
    expect(() => assertIdentityModeIsSafe()).not.toThrow();
  });

  it("throws in production when STUDENT_IDENTITY_MODE is not explicitly set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "");
    expect(() => assertIdentityModeIsSafe()).toThrow(EnvValidationError);
  });

  it("throws in production when STUDENT_IDENTITY_MODE is set to something other than 'development'", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "nope");
    expect(() => assertIdentityModeIsSafe()).toThrow(EnvValidationError);
  });

  it("does not throw in production when STUDENT_IDENTITY_MODE is explicitly 'development'", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "development");
    expect(() => assertIdentityModeIsSafe()).not.toThrow();
  });
});
