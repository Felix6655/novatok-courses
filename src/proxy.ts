import { NextResponse, type NextRequest } from "next/server";
import { isTrustedOrigin, requiresTrustedOrigin } from "@/lib/csrf";
import { DEV_STUDENT_COOKIE } from "@/server/identity/constants";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  if (requiresTrustedOrigin(request.nextUrl.pathname, request.method) && !isTrustedOrigin(request.url, request.headers.get("origin"))) {
    return NextResponse.json({ error: "Untrusted request origin" }, { status: 403 });
  }

  const developmentIdentity = process.env.NODE_ENV !== "production" && (process.env.STUDENT_IDENTITY_MODE ?? "development") === "development";
  if (!developmentIdentity || request.cookies.has(DEV_STUDENT_COOKIE)) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(DEV_STUDENT_COOKIE, `dev-${crypto.randomUUID()}`, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };