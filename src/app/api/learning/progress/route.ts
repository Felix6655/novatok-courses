import { NextResponse } from "next/server";
import { badRequest, internalError, notFound, unauthorized } from "@/lib/api-response";
import { guardLearningMutation } from "@/lib/learning-mutation-guard";
import { completeLessonRequestSchema } from "@/lib/validation/learning";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import { markLessonComplete } from "@/server/learning/progress";

export async function POST(request: Request) {
  const guard = await guardLearningMutation(request, "progress");
  if (!guard.ok) return guard.response;

  const parsed = completeLessonRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const identity = await getStudentIdentity();
    const result = await markLessonComplete(
      identity.studentId,
      parsed.data.courseSlug,
      parsed.data.lessonSlug,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    if (error instanceof EnrollmentCourseNotFoundError || error instanceof LearningLessonNotFoundError) {
      return notFound(error.message);
    }
    if (error instanceof NotEnrolledError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error(error);
    return internalError();
  }
}
