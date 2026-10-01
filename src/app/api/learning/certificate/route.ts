import { NextResponse } from "next/server";
import { z } from "zod";
import { internalError, unauthorized } from "@/lib/api-response";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import {
  CertificateUnavailableError,
  CourseNotCompleteError,
  EnrollmentCourseNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import { issueCourseCertificate } from "@/server/learning/certificate";

const requestSchema = z.object({
  courseSlug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  try {
    const identity = await getStudentIdentity();
    const certificate = await issueCourseCertificate(identity.studentId, parsed.data.courseSlug);
    return NextResponse.json({ certificate });
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) return unauthorized();
    if (error instanceof EnrollmentCourseNotFoundError) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    if (error instanceof NotEnrolledError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof CertificateUnavailableError || error instanceof CourseNotCompleteError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return internalError();
  }
}
