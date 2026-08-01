import { getAIProvider } from "@/ai/get-ai-provider";
import type { AIProvider } from "@/ai/provider";
import type { LearningIntent } from "@/lib/validation/learning-intent";
import { getCandidateCourses } from "@/server/advisor/catalog-retrieval";
import { extractLearningIntent } from "@/server/advisor/extract-intent";
import { generateRecommendation, type CourseRecommendation } from "@/server/advisor/recommendation";

export interface CourseAdvisorResult {
  interpretedGoal: string;
  intent: LearningIntent;
  recommendations: CourseRecommendation[];
  pathSummary: string | null;
  generatedBy: "ai" | "fallback-ranking";
}

export interface CourseAdvisorDeps {
  /** Injectable for tests; defaults to the env-configured provider. */
  provider?: AIProvider;
}

/**
 * Orchestrates the full advisor pipeline:
 * message -> intent extraction -> catalog retrieval (source of truth) ->
 * AI reasoning over real candidates -> grounded, validated result.
 */
export async function getCourseAdvisorRecommendation(
  message: string,
  deps: CourseAdvisorDeps = {},
): Promise<CourseAdvisorResult> {
  const provider = deps.provider ?? getAIProvider();

  const intent = await extractLearningIntent(message, provider);
  const candidates = await getCandidateCourses(intent);
  const recommendation = await generateRecommendation(intent, candidates, provider);

  return {
    interpretedGoal: intent.goal,
    intent,
    recommendations: recommendation.recommendations,
    pathSummary: recommendation.pathSummary,
    generatedBy: recommendation.generatedBy,
  };
}
