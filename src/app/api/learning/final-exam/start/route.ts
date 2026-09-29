import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badGateway, badRequest, internalError, notFound, serviceUnavailable, unauthorized } from "@/lib/api-response";
import { slugParamSchema } from "@/lib/validation/course-query";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import { CourseNotCompleteError, EnrollmentCourseNotFoundError, NotEnrolledError } from "@/server/learning/errors";
import { startFinalExam } from "@/server/learning/final-exam";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "final-exam-start");
  if (!guard.ok) return guard.response;
  const parsed = slugParamSchema.safeParse((guard.body as { courseSlug?: unknown } | null)?.courseSlug);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }
  try {
    const identity = await getStudentIdentity();
    return NextResponse.json(await startFinalExam(identity.studentId, parsed.data));
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) return unauthorized();
    if (error instanceof EnrollmentCourseNotFoundError) return notFound(error.message);
    if (error instanceof NotEnrolledError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof CourseNotCompleteError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof AIProviderUnavailableError || error instanceof AIProviderConfigError) return serviceUnavailable(error.message);
    if (error instanceof InvalidModelOutputError) return badGateway("The AI provider returned a response that could not be used.");
    console.error(error);
    return internalError();
  } finally {
    guard.release();
  }
}
