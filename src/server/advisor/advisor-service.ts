import { getAIProvider } from "@/ai/get-ai-provider";
import type { AIProvider } from "@/ai/provider";
import type { LearningIntent } from "@/lib/validation/learning-intent";
import type { Locale } from "@/i18n/config";
import { getCandidateCourses } from "@/server/advisor/catalog-retrieval";
import { extractLearningIntent } from "@/server/advisor/extract-intent";
import {
  generateRecommendation,
  type CourseRecommendation,
} from "@/server/advisor/recommendation";

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
  locale?: Locale;
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
  const provider =
    deps.provider ??
    getAIProvider(process.env, {
      task: "advisor",
      locale: deps.locale ?? "en",
    });

  const extracted = deps.locale
    ? await extractLearningIntent(message, provider, deps.locale)
    : await extractLearningIntent(message, provider);
  const localeHints: Partial<Record<Locale, string[]>> = {
    es: /ciberseguridad/i.test(message) ? ["Cybersecurity"] : [],
    pt: /programa(?:ção|cao)/i.test(message)
      ? ["JavaScript", "Software Development"]
      : [],
    fr: /intelligence artificielle/i.test(message) ? ["AI"] : [],
    de: /projektmanagement/i.test(message) ? ["Project Management"] : [],
  };
  const hints = deps.locale ? (localeHints[deps.locale] ?? []) : [];
  const intent = hints.length
    ? {
        ...extracted,
        topics: [...new Set([...extracted.topics, ...hints])].slice(0, 8),
      }
    : extracted;
  const candidates = await getCandidateCourses(intent);
  const recommendation = deps.locale
    ? await generateRecommendation(intent, candidates, provider, deps.locale)
    : await generateRecommendation(intent, candidates, provider);

  return {
    interpretedGoal: intent.goal,
    intent,
    recommendations: recommendation.recommendations,
    pathSummary: recommendation.pathSummary,
    generatedBy: recommendation.generatedBy,
  };
}
