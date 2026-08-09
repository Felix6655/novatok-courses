import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions, validateLogoutReturnTo } from "@/server/auth/courses-auth";
import { getNovaTokAuthConfig } from "@/server/auth/novatok-config";
import { COURSES_SESSION_COOKIE } from "@/server/identity/constants";

export function POST(request: NextRequest) {
  try {
    const config = getNovaTokAuthConfig();
    const returnTo = validateLogoutReturnTo(request.nextUrl.searchParams.get("returnTo"));
    const response = NextResponse.redirect(new URL(returnTo, config.coursesOrigin), 303);
    response.cookies.set(COURSES_SESSION_COOKIE, "", authCookieOptions(0));
    return response;
  } catch { return NextResponse.json({ error: "Logout is temporarily unavailable." }, { status: 503 }); }
}
