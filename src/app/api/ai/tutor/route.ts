import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
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
import { TutorCourseNotFoundError, TutorNoContentError } from "@/server/tutor/errors";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = tutorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const result = await getTutorAnswer(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TutorCourseNotFoundError) {
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
  }
}
