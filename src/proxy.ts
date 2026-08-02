import { NextResponse, type NextRequest } from "next/server";
import { isTrustedOrigin, requiresTrustedOrigin } from "@/lib/csrf";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { DEV_STUDENT_COOKIE } from "@/server/identity/constants";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function withPreferences(response: NextResponse, request: NextRequest, locale?: string) {
  if (locale && isLocale(locale)) response.cookies.set(LOCALE_COOKIE, locale, { sameSite: "lax", maxAge: ONE_YEAR_SECONDS, path: "/" });
  const dev = process.env.NODE_ENV !== "production" && (process.env.STUDENT_IDENTITY_MODE ?? "development") === "development";
  if (dev && !request.cookies.has(DEV_STUDENT_COOKIE)) response.cookies.set(DEV_STUDENT_COOKIE, `dev-${crypto.randomUUID()}`, { httpOnly: true, secure: false, sameSite: "lax", maxAge: ONE_YEAR_SECONDS, path: "/" });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (requiresTrustedOrigin(pathname, request.method) && !isTrustedOrigin(request.url, request.headers.get("origin"))) return NextResponse.json({ error: "Untrusted request origin" }, { status: 403 });
  const api = pathname.startsWith("/api/");
  const parts = pathname.split("/").filter(Boolean);
  const prefix = parts[0];
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferred = cookieLocale && isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  if (!api && !prefix) return withPreferences(NextResponse.redirect(new URL(`/${preferred}/courses`, request.url)), request);
  if (!api && prefix && !isLocale(prefix)) {
    const logicalPath = /^[a-z]{2}$/i.test(prefix) ? `/${parts.slice(1).join("/")}` : pathname;
    return withPreferences(NextResponse.redirect(new URL(`/${preferred}${logicalPath}`, request.url)), request);
  }
  const locale = !api && prefix && isLocale(prefix) ? prefix : preferred;
  const headers = new Headers(request.headers);
  headers.set("x-novatok-locale", locale);
  if (!api && prefix && isLocale(prefix)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${parts.slice(1).join("/")}` || "/";
    return withPreferences(NextResponse.rewrite(url, { request: { headers } }), request, prefix);
  }
  return withPreferences(NextResponse.next({ request: { headers } }), request);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
