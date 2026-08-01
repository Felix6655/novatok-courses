import { NextResponse } from "next/server";
import { AIProviderConfigError, AIProviderUnavailableError, InvalidModelOutputError } from "@/ai/errors";
import {
  badGateway,
  badRequest,
  internalError,
  serviceUnavailable,
} from "@/lib/api-response";
import { courseAdvisorRequestSchema } from "@/lib/validation/learning-intent";
import { getCourseAdvisorRecommendation } from "@/server/advisor/advisor-service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = courseAdvisorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error, "Invalid request body");
  }

  try {
    const result = await getCourseAdvisorRecommendation(parsed.data.message);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AIProviderUnavailableError || error instanceof AIProviderConfigError) {
      return serviceUnavailable(error.message);
    }
    if (error instanceof InvalidModelOutputError) {
      return badGateway("The AI provider returned a response that could not be used.");
    }
    return internalError();
  }
}
