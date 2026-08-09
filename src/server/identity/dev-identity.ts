import { cookies } from "next/headers";
import { assertIdentityModeIsSafe } from "@/lib/env";
import { COURSES_SESSION_COOKIE, DEV_STUDENT_COOKIE } from "@/server/identity/constants";
import { getNovaTokSocialIdentity } from "@/server/identity/novatok-social-identity";
import type { StudentIdentity } from "@/server/identity/types";

export { DEV_STUDENT_COOKIE } from "@/server/identity/constants";

export class MissingStudentIdentityError extends Error {
  constructor() {
    super("No development student identity cookie found. The development proxy must provision it before identity resolution.");
    this.name = "MissingStudentIdentityError";
  }
}

export async function getStudentIdentity(): Promise<StudentIdentity> {
  const cookieStore = await cookies();
  assertIdentityModeIsSafe();
  const mode = process.env.STUDENT_IDENTITY_MODE ?? "development";

  if (mode === "novatok-social") {
    return getNovaTokSocialIdentity(cookieStore.get(COURSES_SESSION_COOKIE)?.value);
  }

  const studentId = cookieStore.get(DEV_STUDENT_COOKIE)?.value;
  if (!studentId) throw new MissingStudentIdentityError();
  return { studentId };
}
