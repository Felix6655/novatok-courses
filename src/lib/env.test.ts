import { afterEach, describe, expect, it, vi } from "vitest";
import { EnvValidationError, assertIdentityModeIsSafe, getDatabaseUrl } from "@/lib/env";

afterEach(() => vi.unstubAllEnvs());

describe("getDatabaseUrl", () => {
  it("returns a valid PostgreSQL URL", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/novatok_courses?schema=public");
    expect(getDatabaseUrl()).toContain("novatok_courses");
  });
  it("rejects missing, malformed, and non-PostgreSQL URLs", () => {
    for (const value of ["", "not-a-url", "https://example.com/database"]) {
      vi.stubEnv("DATABASE_URL", value);
      expect(() => getDatabaseUrl()).toThrow(EnvValidationError);
    }
  });
});

describe("assertIdentityModeIsSafe", () => {
  it("allows development mode outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "development");
    expect(() => assertIdentityModeIsSafe()).not.toThrow();
  });
  it("allows only novatok-social mode in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const value of ["", "development", "nope"]) {
      vi.stubEnv("STUDENT_IDENTITY_MODE", value);
      expect(() => assertIdentityModeIsSafe()).toThrow(EnvValidationError);
    }
    vi.stubEnv("STUDENT_IDENTITY_MODE", "novatok-social");
    expect(() => assertIdentityModeIsSafe()).not.toThrow();
  });
});