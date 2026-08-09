import { getNovaTokAuthConfig } from "@/server/auth/novatok-config";
import { verifyCoursesSessionToken } from "@/server/auth/courses-auth";
import type { StudentIdentity } from "@/server/identity/types";

export class InvalidSocialSessionError extends Error {
  constructor() {
    super("A valid NovaTok Social session is required.");
    this.name = "InvalidSocialSessionError";
  }
}

export async function getNovaTokSocialIdentity(
  coursesSession: string | undefined,
): Promise<StudentIdentity> {
  const identity = verifyCoursesSessionToken(coursesSession, getNovaTokAuthConfig().sessionSecret);
  if (!identity) throw new InvalidSocialSessionError();
  return identity;
}
