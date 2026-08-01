import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const studentId = cookieStore.get(DEV_STUDENT_COOKIE)?.value;

  if (!studentId) {
    throw new MissingStudentIdentityError();
  }

  return { studentId };
}
