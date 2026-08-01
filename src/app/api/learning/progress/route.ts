import { NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/api-response";
import { completeLessonRequestSchema } from "@/lib/validation/learning";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import { markLessonComplete } from "@/server/learning/progress";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = completeLessonRequestSchema.safeParse(body);
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
