import { cookies } from "next/headers";
import { assertIdentityModeIsSafe } from "@/lib/env";
import { DEV_STUDENT_COOKIE } from "@/server/identity/constants";
import type { StudentIdentity } from "@/server/identity/types";

/**
 * NOT PRODUCTION AUTHENTICATION.
 *
 * This is a development-only identity mechanism: any browser that
 * accepts cookies is automatically assigned a random studentId, with no
 * credential of any kind checked or verified. It exists purely so the
 * learning system (enrollment, progress, resume, Learning Coach) has a
 * real, stable, per-browser identifier to build and test against before
 * NovaTok Social's real session/auth exists.
 *
 * The cookie itself is set by src/middleware.ts (Server Components can't
 * set cookies during render — only Middleware and Route Handlers can), so
 * by the time any page or API route calls getStudentIdentity(), the
 * cookie is guaranteed to already be present. The cookie name lives in
 * src/server/identity/constants.ts, not here, so middleware (which runs
 * in the Edge runtime) can import just the constant without pulling in
 * next/headers.
 *
 * Replacing this with real auth later means changing ONLY this file: swap
 * the cookie read below for reading NovaTok Social's verified session and
 * throwing/redirecting when there isn't one. Every caller already depends
 * on the StudentIdentity shape, not on how it was obtained — see
 * docs/student-identity.md for the full migration plan.
 *
 * Sprint 7 safety rail: assertIdentityModeIsSafe() (src/lib/env.ts) makes
 * this throw immediately in a NODE_ENV=production deployment unless
 * STUDENT_IDENTITY_MODE=development was explicitly set — a production
 * deploy that forgot to wire up real identity fails loudly at startup
 * instead of silently handing out forgeable cookie identities.
 */
export { DEV_STUDENT_COOKIE } from "@/server/identity/constants";

export class MissingStudentIdentityError extends Error {
  constructor() {
    super(
      "No development student identity cookie found. This should be unreachable — " +
        "src/middleware.ts is expected to set it on every request before this runs.",
    );
    this.name = "MissingStudentIdentityError";
  }
}

export async function getStudentIdentity(): Promise<StudentIdentity> {
  // cookies() must be called before the safety-rail check below: it's a
  // Next.js "dynamic API" that, during next build's static-prerender
  // pass, signals "this route needs a real request" via an internal
  // mechanism rather than a normal return. Throwing our own error before
  // reaching it would surface as a hard build failure instead of Next
  // correctly marking the route dynamic. At real request time this
  // ordering makes no behavioral difference — both run before any cookie
  // value is read.
  const cookieStore = await cookies();
  assertIdentityModeIsSafe();

  const studentId = cookieStore.get(DEV_STUDENT_COOKIE)?.value;

  if (!studentId) {
    throw new MissingStudentIdentityError();
  }

  return { studentId };
}
