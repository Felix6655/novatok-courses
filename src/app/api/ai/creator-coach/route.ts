import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badGateway, badRequest, internalError, serviceUnavailable } from "@/lib/api-response";
import { creatorCoachRequestSchema } from "@/lib/validation/creator-coach";
import { getCreatorCoachPlan } from "@/server/creator-coach/creator-coach-service";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "creator-coach");
  if (!guard.ok) return guard.response;

  const parsed = creatorCoachRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const result = parsed.data.locale
      ? await getCreatorCoachPlan(parsed.data.message, { locale: parsed.data.locale })
      : await getCreatorCoachPlan(parsed.data.message);
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
