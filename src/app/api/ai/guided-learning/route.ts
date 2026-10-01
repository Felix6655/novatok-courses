import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badGateway, badRequest, internalError, serviceUnavailable } from "@/lib/api-response";
import { guidedLearningRequestSchema } from "@/lib/validation/guided-learning";
import { buildGuidedLearningPlan } from "@/server/guided-learning/guided-learning-service";
import { InvalidModelOutputError } from "@/ai/errors";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "guided-learning");
  if (!guard.ok) return guard.response;

  const parsed = guidedLearningRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const result = await buildGuidedLearningPlan(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
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
