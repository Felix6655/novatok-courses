import { redirect } from "next/navigation";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import type { StudentIdentity } from "@/server/identity/types";

export async function requireBrowserStudentIdentity(returnTo: string): Promise<StudentIdentity> {
  try { return await getStudentIdentity(); }
  catch (error) {
    if (process.env.STUDENT_IDENTITY_MODE === "novatok-social" && error instanceof InvalidSocialSessionError) {
      redirect(`/api/auth/novatok/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw error;
  }
}
