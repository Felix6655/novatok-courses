import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import { guardAIRequest } from "@/lib/ai-request-guard";
import { badGateway, badRequest, internalError, serviceUnavailable } from "@/lib/api-response";
import { courseAdvisorRequestSchema } from "@/lib/validation/learning-intent";
import { getCourseAdvisorRecommendation } from "@/server/advisor/advisor-service";

export async function POST(request: Request) {
  const guard = await guardAIRequest(request, "course-advisor");
  if (!guard.ok) return guard.response;

  const parsed = courseAdvisorRequestSchema.safeParse(guard.body);
  if (!parsed.success) {
    guard.release();
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const result = parsed.data.locale
      ? await getCourseAdvisorRecommendation(parsed.data.message, { locale: parsed.data.locale })
      : await getCourseAdvisorRecommendation(parsed.data.message);
    return NextResponse.json(result);
  } catch (error) {
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
