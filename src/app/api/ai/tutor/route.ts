import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import {
  badGateway,
  badRequest,
  internalError,
  notFound,
  serviceUnavailable,
  unprocessable,
} from "@/lib/api-response";
import { tutorRequestSchema } from "@/lib/validation/tutor";
import { getTutorAnswer } from "@/server/tutor/tutor-service";
import {
  TutorCourseNotFoundError,
  TutorLessonNotFoundError,
  TutorNoContentError,
} from "@/server/tutor/errors";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "tutor");
  if (!guard.ok) return guard.response;

  const parsed = tutorRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const result = await getTutorAnswer(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TutorCourseNotFoundError || error instanceof TutorLessonNotFoundError) {
      return notFound(error.message);
    }
    if (error instanceof TutorNoContentError) {
      return unprocessable(error.message);
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
