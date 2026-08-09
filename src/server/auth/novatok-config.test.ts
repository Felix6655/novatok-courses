import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnvValidationError } from "@/lib/env";
import { getNovaTokAuthConfig } from "@/server/auth/novatok-config";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("NOVATOK_SOCIAL_ORIGIN", "http://localhost:3000");
  vi.stubEnv("NOVATOK_SOCIAL_CLIENT_ID", "novatok-courses"); vi.stubEnv("NOVATOK_SOCIAL_CLIENT_SECRET", "c".repeat(48));
  vi.stubEnv("NOVATOK_COURSES_ORIGIN", "http://localhost:3001"); vi.stubEnv("NOVATOK_COURSES_SESSION_SECRET", "s".repeat(48));
});
afterEach(() => vi.unstubAllEnvs());

describe("getNovaTokAuthConfig", () => {
  it("supports two exact localhost origins outside production", () => {
    expect(getNovaTokAuthConfig()).toMatchObject({ socialOrigin: "http://localhost:3000", coursesOrigin: "http://localhost:3001", callbackUrl: "http://localhost:3001/api/auth/novatok/callback" });
  });
  it("rejects short secrets, origin paths, and insecure production origins", () => {
    vi.stubEnv("NOVATOK_SOCIAL_CLIENT_SECRET", "short"); expect(() => getNovaTokAuthConfig()).toThrow(EnvValidationError);
    vi.stubEnv("NOVATOK_SOCIAL_CLIENT_SECRET", "c".repeat(48)); vi.stubEnv("NOVATOK_COURSES_ORIGIN", "http://localhost:3001/path"); expect(() => getNovaTokAuthConfig()).toThrow(EnvValidationError);
    vi.stubEnv("NOVATOK_COURSES_ORIGIN", "http://localhost:3001"); vi.stubEnv("NODE_ENV", "production"); expect(() => getNovaTokAuthConfig()).toThrow(EnvValidationError);
  });
});
