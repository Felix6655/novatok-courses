import { NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/api-response";
import { guardLearningMutation } from "@/lib/learning-mutation-guard";
import { enrollRequestSchema } from "@/lib/validation/learning";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import { enrollInCourse } from "@/server/learning/enrollment";
import { EnrollmentCourseNotFoundError } from "@/server/learning/errors";

export async function POST(request: Request) {
  const guard = await guardLearningMutation(request, "enroll");
  if (!guard.ok) return guard.response;

  const parsed = enrollRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    return badRequest(parsed.error, "Invalid request body");
  }

  const identity = await getStudentIdentity();

  try {
    const enrollment = await enrollInCourse(identity.studentId, parsed.data.courseSlug);
    return NextResponse.json({ enrollment });
  } catch (error) {
    if (error instanceof EnrollmentCourseNotFoundError) {
      return notFound(error.message);
    }
    throw error;
  }
}
