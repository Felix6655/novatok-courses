import { getAIProvider } from "@/ai/get-ai-provider";
import type { AIProvider } from "@/ai/provider";
import type { CreatorProfile } from "@/lib/validation/creator-coach";
import type { Locale } from "@/i18n/config";
import { getCandidateCourses } from "@/server/creator-coach/academy-retrieval";
import { extractCreatorProfile } from "@/server/creator-coach/extract-profile";
import { generateCreatorPlan, type CreatorCoachWeek } from "@/server/creator-coach/plan-generation";

export interface CreatorCoachResult {
  profile: CreatorProfile;
  weeks: CreatorCoachWeek[];
  overallSummary: string | null;
  generatedBy: "ai" | "fallback-sequence";
}

export interface CreatorCoachDeps {
  /** Injectable for tests; defaults to the env-configured provider. */
  provider?: AIProvider;
  locale?: Locale;
}

/**
 * Orchestrates the full Creator Coach pipeline: message -> structured
 * creator profile -> real Creator Academy catalog retrieval (source of
 * truth) -> AI reasoning over real candidates -> grounded, validated
 * week-by-week plan. Mirrors src/server/advisor/advisor-service.ts's
 * shape exactly — same provider abstraction, same grounding discipline.
 *
 * Deliberately stateless today, like the Course Advisor: no student
 * identity or enrollment is required or read. A future iteration could
 * incorporate real NovaTok Social creator signals (posts, views,
 * engagement, follower growth) once that integration exists — see
 * docs/creator-coach.md — but that is explicitly out of scope here.
 */
export async function getCreatorCoachPlan(
  message: string,
  deps: CreatorCoachDeps = {},
): Promise<CreatorCoachResult> {
  const provider =
    deps.provider ??
    getAIProvider(process.env, {
      task: "creator-coach",
      locale: deps.locale ?? "en",
    });

  const profile = deps.locale
    ? await extractCreatorProfile(message, provider, deps.locale)
    : await extractCreatorProfile(message, provider);

  const candidates = await getCandidateCourses(profile);
  const plan = deps.locale
    ? await generateCreatorPlan(profile, candidates, provider, deps.locale)
    : await generateCreatorPlan(profile, candidates, provider);

  return {
    profile,
    weeks: plan.weeks,
    overallSummary: plan.overallSummary,
    generatedBy: plan.generatedBy,
  };
}
