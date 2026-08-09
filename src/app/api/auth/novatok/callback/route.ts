import { NextResponse, type NextRequest } from "next/server";
import { getNovaTokAuthConfig } from "@/server/auth/novatok-config";
import { COURSES_SESSION_LIFETIME_SECONDS, authCookieOptions, createCoursesSessionToken, safeEqual, verifyAuthTransactionToken } from "@/server/auth/courses-auth";
import { exchangeSocialAuthorizationCode } from "@/server/auth/social-exchange";
import { COURSES_AUTH_TRANSACTION_COOKIE, COURSES_SESSION_COOKIE } from "@/server/identity/constants";

function clearTransaction(response: NextResponse) {
  response.cookies.set(COURSES_AUTH_TRANSACTION_COOKIE, "", authCookieOptions(0));
  return response;
}

function callbackError(message: string, status: number) {
  return clearTransaction(NextResponse.json({ error: message }, { status }));
}

export async function GET(request: NextRequest) {
  let config;
  try { config = getNovaTokAuthConfig(); } catch { return callbackError("Authentication is temporarily unavailable.", 503); }
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) return callbackError("Invalid authentication callback.", 400);
  const transaction = verifyAuthTransactionToken(request.cookies.get(COURSES_AUTH_TRANSACTION_COOKIE)?.value, config.sessionSecret);
  if (!transaction || !safeEqual(state, transaction.state)) return callbackError("Invalid or expired authentication transaction.", 400);
  let studentId: string;
  try { studentId = await exchangeSocialAuthorizationCode(config, code, transaction.verifier); }
  catch { return callbackError("NovaTok Social authentication could not be completed.", 502); }
  let session: string;
  try { session = createCoursesSessionToken(studentId, config.sessionSecret); }
  catch { return callbackError("NovaTok Social returned an invalid identity.", 502); }
  const response = clearTransaction(NextResponse.redirect(new URL(transaction.returnTo, config.coursesOrigin), 303));
  response.cookies.set(COURSES_SESSION_COOKIE, session, authCookieOptions(COURSES_SESSION_LIFETIME_SECONDS));
  return response;
}
