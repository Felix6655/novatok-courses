import { NextResponse } from "next/server";
import { badRequest, internalError, notFound, unauthorized } from "@/lib/api-response";
import { guardLearningMutation } from "@/lib/learning-mutation-guard";
import { enrollRequestSchema } from "@/lib/validation/learning";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import { enrollInCourse } from "@/server/learning/enrollment";
import { EnrollmentCourseNotFoundError } from "@/server/learning/errors";

export async function POST(request: Request) {
  const guard = await guardLearningMutation(request, "enroll");
  if (!guard.ok) return guard.response;

  const parsed = enrollRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const identity = await getStudentIdentity();
    const enrollment = await enrollInCourse(identity.studentId, parsed.data.courseSlug);
    return NextResponse.json({ enrollment });
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    if (error instanceof EnrollmentCourseNotFoundError) {
      return notFound(error.message);
    }
    console.error(error);
    return internalError();
  }
}
