import { NextResponse, type NextRequest } from "next/server";
import { getNovaTokAuthConfig } from "@/server/auth/novatok-config";
import { AUTH_TRANSACTION_LIFETIME_SECONDS, authCookieOptions, createAuthTransactionToken, createPkcePair, createState, validateInternalReturnTo } from "@/server/auth/courses-auth";
import { COURSES_AUTH_TRANSACTION_COOKIE } from "@/server/identity/constants";

export function GET(request: NextRequest) {
  try {
    const config = getNovaTokAuthConfig();
    const returnTo = validateInternalReturnTo(request.nextUrl.searchParams.get("returnTo"));
    const state = createState();
    const { verifier, challenge } = createPkcePair();
    const transaction = createAuthTransactionToken({ state, verifier, returnTo }, config.sessionSecret);
    const authorizeUrl = new URL("/api/integrations/courses/authorize", config.socialOrigin);
    authorizeUrl.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }).toString();
    const response = NextResponse.redirect(authorizeUrl, 303);
    response.cookies.set(COURSES_AUTH_TRANSACTION_COOKIE, transaction, authCookieOptions(AUTH_TRANSACTION_LIFETIME_SECONDS));
    return response;
  } catch { return NextResponse.json({ error: "Authentication is temporarily unavailable." }, { status: 503 }); }
}
