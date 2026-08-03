import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badRequest, internalError, notFound, serviceUnavailable, unauthorized } from "@/lib/api-response";
import { learningCoachRequestSchema } from "@/lib/validation/learning-coach";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import { EnrollmentCourseNotFoundError, NotEnrolledError } from "@/server/learning/errors";
import { getLearningCoachAdvice } from "@/server/learning/learning-coach";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "learning-coach");
  if (!guard.ok) return guard.response;

  const parsed = learningCoachRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const identity = await getStudentIdentity();
    const result = await getLearningCoachAdvice(identity.studentId, parsed.data.courseSlug, {
      recentTutorHistory: parsed.data.recentTutorHistory,
      ...(parsed.data.locale ? { locale: parsed.data.locale } : {}),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    if (error instanceof EnrollmentCourseNotFoundError) {
      return notFound(error.message);
    }
    if (error instanceof NotEnrolledError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof AIProviderUnavailableError || error instanceof AIProviderConfigError) {
      return serviceUnavailable(error.message);
    }
    console.error(error);
    return internalError();
  } finally {
    guard.release();
  }
}
