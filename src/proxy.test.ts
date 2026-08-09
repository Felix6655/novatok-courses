import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DEV_STUDENT_COOKIE } from "@/server/identity/constants";
import { proxy } from "@/proxy";

afterEach(() => vi.unstubAllEnvs());

describe("Next.js proxy", () => {
  it("provisions the dev identity only in non-production development mode", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "development");
    const response = proxy(new NextRequest("http://localhost/learn"));
    expect(response.cookies.get(DEV_STUDENT_COOKIE)?.value).toMatch(/^dev-/);
  });

  it("never provisions a dev identity in production social mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STUDENT_IDENTITY_MODE", "novatok-social");
    const response = proxy(new NextRequest("https://courses.example/learn"));
    expect(response.cookies.get(DEV_STUDENT_COOKIE)).toBeUndefined();
  });

  it("rejects protected cross-origin mutations", async () => {
    const request = new NextRequest("https://courses.example/api/learning/enroll", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });
    const response = proxy(request);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Untrusted request origin" });
  });

  it("protects Courses logout from cross-origin POST requests", () => {
    const response = proxy(new NextRequest("https://courses.example/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    }));
    expect(response.status).toBe(403);
  });
});
