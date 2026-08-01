import { NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/api-response";
import { enrollRequestSchema } from "@/lib/validation/learning";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import { enrollInCourse } from "@/server/learning/enrollment";
import { EnrollmentCourseNotFoundError } from "@/server/learning/errors";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = enrollRequestSchema.safeParse(body);
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
