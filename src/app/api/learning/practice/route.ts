import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badGateway, badRequest, internalError, notFound, serviceUnavailable } from "@/lib/api-response";
import { practiceRequestSchema } from "@/lib/validation/practice";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import { generatePracticeQuestion } from "@/server/learning/practice";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "practice-generate");
  if (!guard.ok) return guard.response;

  const parsed = practiceRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const identity = await getStudentIdentity();
    const args = [identity.studentId, parsed.data.courseSlug, parsed.data.lessonSlug] as const;
    const result = parsed.data.locale
      ? await generatePracticeQuestion(...args, { locale: parsed.data.locale })
      : await generatePracticeQuestion(...args);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EnrollmentCourseNotFoundError || error instanceof LearningLessonNotFoundError) {
      return notFound(error.message);
    }
    if (error instanceof NotEnrolledError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof AIProviderUnavailableError || error instanceof AIProviderConfigError) {
      return serviceUnavailable(error.message);
    }
    if (error instanceof InvalidModelOutputError) {
      return badGateway("The AI provider returned a response that could not be used.");
    }
    return internalError();
  } finally {
    guard.release();
  }
}
