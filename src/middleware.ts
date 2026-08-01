import { NextResponse, type NextRequest } from "next/server";
import { DEV_STUDENT_COOKIE } from "@/server/identity/constants";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Ensures every request carries a development student identity cookie —
 * NOT authentication, just cookie provisioning. Runs before any page or
 * Route Handler, which is the only reason it exists: Server Components
 * can't set cookies during render, so this is the one place that can
 * guarantee the cookie exists by the time getStudentIdentity() reads it.
 * See docs/student-identity.md.
 *
 * Runs in the Edge runtime, which does not support Node built-ins like
 * `node:crypto` — uses the global Web Crypto API (`crypto.randomUUID()`)
 * instead, and imports only the cookie-name constant (not
 * dev-identity.ts, which pulls in next/headers) to keep this file's
 * dependency surface Edge-safe.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(DEV_STUDENT_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(DEV_STUDENT_COOKIE, `dev-${crypto.randomUUID()}`, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
