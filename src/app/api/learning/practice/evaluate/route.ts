import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badGateway, badRequest, internalError, notFound, serviceUnavailable, unauthorized } from "@/lib/api-response";
import { practiceEvaluateRequestSchema } from "@/lib/validation/practice";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import { PracticeNotFoundError } from "@/server/learning/errors";
import { evaluatePracticeAttempt } from "@/server/learning/practice";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "practice-evaluate");
  if (!guard.ok) return guard.response;

  const parsed = practiceEvaluateRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const identity = await getStudentIdentity();
    const result = await evaluatePracticeAttempt(
      identity.studentId,
      parsed.data.practiceId,
      parsed.data.studentAnswer,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    if (error instanceof PracticeNotFoundError) {
      return notFound(error.message);
    }
    if (error instanceof AIProviderUnavailableError || error instanceof AIProviderConfigError) {
      return serviceUnavailable(error.message);
    }
    if (error instanceof InvalidModelOutputError) {
      return badGateway("The AI provider returned a response that could not be used.");
    }
    console.error(error);
    return internalError();
  } finally {
    guard.release();
  }
}
