import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAuthTransactionToken, verifyAuthTransactionToken, verifyCoursesSessionToken } from "@/server/auth/courses-auth";
import { COURSES_AUTH_TRANSACTION_COOKIE, COURSES_SESSION_COOKIE } from "@/server/identity/constants";
import { GET as startLogin } from "@/app/api/auth/novatok/login/route";
import { GET as finishCallback } from "@/app/api/auth/novatok/callback/route";
import { POST as logout } from "@/app/api/auth/logout/route";

const SECRET = "s".repeat(48); const CLIENT_SECRET = "c".repeat(48);
const USER_ID = "10000000-0000-4000-8000-000000000001";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("STUDENT_IDENTITY_MODE", "novatok-social");
  vi.stubEnv("NOVATOK_SOCIAL_ORIGIN", "https://social.example"); vi.stubEnv("NOVATOK_SOCIAL_CLIENT_ID", "novatok-courses");
  vi.stubEnv("NOVATOK_SOCIAL_CLIENT_SECRET", CLIENT_SECRET); vi.stubEnv("NOVATOK_COURSES_ORIGIN", "https://courses.example");
  vi.stubEnv("NOVATOK_COURSES_SESSION_SECRET", SECRET);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("NovaTok Courses auth routes", () => {
  it("starts a PKCE handoff with a signed host-only transaction and no browser-facing secrets", () => {
    const response = startLogin(new NextRequest("https://courses.example/api/auth/novatok/login?returnTo=%2Flearn%2Fcourse-one"));
    expect(response.status).toBe(303);
    const location = new URL(response.headers.get("location")!);
    expect(location.origin + location.pathname).toBe("https://social.example/api/integrations/courses/authorize");
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(location.searchParams.has("userId")).toBe(false);
    expect(location.toString()).not.toContain(CLIENT_SECRET); expect(location.toString()).not.toContain(SECRET);
    const cookie = response.cookies.get(COURSES_AUTH_TRANSACTION_COOKIE)?.value;
    const transaction = verifyAuthTransactionToken(cookie, SECRET);
    expect(transaction?.returnTo).toBe("/learn/course-one");
    const setCookie = response.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly"); expect(setCookie).toContain("SameSite=lax"); expect(setCookie).not.toContain("Domain=");
    expect(cookie).not.toContain(CLIENT_SECRET); expect(cookie).not.toContain(SECRET);
  });

  it("verifies state, exchanges the exact binding, ignores browser userId, and creates the local session", async () => {
    const state = "a".repeat(43); const verifier = "v".repeat(43);
    const transaction = createAuthTransactionToken({ state, verifier, returnTo: "/learn/course-one" }, SECRET);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: { id: USER_ID } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new NextRequest(`https://courses.example/api/auth/novatok/callback?code=opaque-code&state=${state}&userId=attacker`, { headers: { cookie: `${COURSES_AUTH_TRANSACTION_COOKIE}=${transaction}` } });
    const response = await finishCallback(request);
    expect(response.status).toBe(303); expect(response.headers.get("location")).toBe("https://courses.example/learn/course-one");
    const init = fetchMock.mock.calls[0]![1] as RequestInit; const body = JSON.parse(String(init.body));
    expect(body).toEqual({ client_id: "novatok-courses", client_secret: CLIENT_SECRET, redirect_uri: "https://courses.example/api/auth/novatok/callback", code: "opaque-code", code_verifier: verifier });
    expect(JSON.stringify(body)).not.toContain("attacker");
    expect(verifyCoursesSessionToken(response.cookies.get(COURSES_SESSION_COOKIE)?.value, SECRET)).toEqual({ studentId: USER_ID });
    expect(response.cookies.get(COURSES_AUTH_TRANSACTION_COOKIE)?.value).toBe("");
  });

  it("rejects missing code, mismatched state, tampering, and expiry while clearing the transaction", async () => {
    const state = "a".repeat(43); const verifier = "v".repeat(43);
    const valid = createAuthTransactionToken({ state, verifier, returnTo: "/learn" }, SECRET, 1_000);
    const cases = [
      new NextRequest(`https://courses.example/api/auth/novatok/callback?state=${state}`, { headers: { cookie: `${COURSES_AUTH_TRANSACTION_COOKIE}=${valid}` } }),
      new NextRequest("https://courses.example/api/auth/novatok/callback?code=x&state=wrong", { headers: { cookie: `${COURSES_AUTH_TRANSACTION_COOKIE}=${valid}` } }),
      new NextRequest(`https://courses.example/api/auth/novatok/callback?code=x&state=${state}`, { headers: { cookie: `${COURSES_AUTH_TRANSACTION_COOKIE}=${valid}x` } }),
    ];
    for (const request of cases) { const response = await finishCallback(request); expect(response.status).toBe(400); expect(response.cookies.get(COURSES_AUTH_TRANSACTION_COOKIE)?.value).toBe(""); }
    vi.spyOn(Date, "now").mockReturnValue(1_301_000);
    const expired = await finishCallback(new NextRequest(`https://courses.example/api/auth/novatok/callback?code=x&state=${state}`, { headers: { cookie: `${COURSES_AUTH_TRANSACTION_COOKIE}=${valid}` } }));
    expect(expired.status).toBe(400);
  });

  it("rejects Social failures and malformed identities without creating a session", async () => {
    const state = "a".repeat(43); const transaction = createAuthTransactionToken({ state, verifier: "v".repeat(43), returnTo: "/learn" }, SECRET);
    for (const responseValue of [new Response(null, { status: 503 }), new Response(JSON.stringify({ user: { id: "not-a-uuid" } }), { status: 200 })]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(responseValue));
      const response = await finishCallback(new NextRequest(`https://courses.example/api/auth/novatok/callback?code=x&state=${state}`, { headers: { cookie: `${COURSES_AUTH_TRANSACTION_COOKIE}=${transaction}` } }));
      expect(response.status).toBe(502); expect(response.cookies.get(COURSES_SESSION_COOKIE)).toBeUndefined();
    }
  });

  it("logout clears only the Courses session and blocks open redirects", () => {
    const request = new NextRequest("https://courses.example/api/auth/logout?returnTo=https://evil.example", { method: "POST", headers: { cookie: `${COURSES_SESSION_COOKIE}=local; novatok_session=social` } });
    const response = logout(request);
    expect(response.status).toBe(303); expect(response.headers.get("location")).toBe("https://courses.example/courses");
    expect(response.cookies.get(COURSES_SESSION_COOKIE)?.value).toBe("");
    expect(response.headers.get("set-cookie")).not.toContain("novatok_session");
  });
});
