import { NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/api-response";
import { guardLearningMutation } from "@/lib/learning-mutation-guard";
import { completeLessonRequestSchema } from "@/lib/validation/learning";
import { getStudentIdentity } from "@/server/identity/dev-identity";
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

  const identity = await getStudentIdentity();

  try {
    const result = await markLessonComplete(
      identity.studentId,
      parsed.data.courseSlug,
      parsed.data.lessonSlug,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EnrollmentCourseNotFoundError || error instanceof LearningLessonNotFoundError) {
      return notFound(error.message);
    }
    if (error instanceof NotEnrolledError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
