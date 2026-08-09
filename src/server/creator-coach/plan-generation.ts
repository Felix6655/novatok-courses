import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider } from "@/ai/provider";
import { creatorCoachModelResponseSchema, type CreatorProfile } from "@/lib/validation/creator-coach";
import { LANGUAGE_INSTRUCTIONS, type Locale } from "@/i18n/config";
import type { SerializedCourseWithCategory } from "@/types/course";

export interface CreatorCoachWeek {
  weekNumber: number;
  focus: string;
  summary: string;
  course: SerializedCourseWithCategory;
}

export interface CreatorPlanResult {
  weeks: CreatorCoachWeek[];
  overallSummary: string | null;
  generatedBy: "ai" | "fallback-sequence";
}

const SYSTEM_PROMPT = `You are the NovaTok Creator Coach. You are given a creator's profile and a numbered list of
real candidate courses, each with its exact slug. Build a week-by-week learning plan (typically 4-6 weeks,
never more than 8) using ONLY courses from this list — a course may repeat across weeks only if genuinely
useful for a different focus that week. You must NEVER invent a course or slug that is not in the provided
list, and you must NEVER promise a specific income, follower count, or view count outcome — only skills,
concrete actions, and realistic next steps.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{
  "weeks": [ { "focus": string, "summary": string, "courseSlug": string } ],
  "overallSummary": string | null
}

"focus" is a short week title (e.g. "Niche and positioning"). "summary" is 1-3 sentences describing what to
do that week and why, grounded in the creator's stated profile. "courseSlug" must be copied exactly from
the candidate list. "overallSummary" is one or two sentences tying the plan together, or null.`;

function formatProfile(profile: CreatorProfile): string {
  const lines = [
    `Business: ${profile.businessSummary}`,
    `Primary goal: ${profile.primaryGoal}`,
    `Experience level: ${profile.experienceLevel}`,
    `Platforms: ${profile.platforms.length > 0 ? profile.platforms.join(", ") : "(not specified)"}`,
    `Focus areas: ${profile.focusAreas.join(", ")}`,
  ];
  if (profile.constraints.length > 0) {
    lines.push(`Other context: ${profile.constraints.join("; ")}`);
  }
  return lines.join("\n");
}

function formatPrice(price: string): string {
  return price === "0.00" ? "Free" : `$${price}`;
}

function buildCandidatesPrompt(candidates: SerializedCourseWithCategory[]): string {
  return candidates
    .map(
      (course, index) =>
        `${index + 1}. slug: "${course.slug}" | title: "${course.title}" | level: ${course.level} | ` +
        `price: ${formatPrice(course.price)} | category: ${course.category.name} | summary: ${course.shortDescription}`,
    )
    .join("\n");
}

/**
 * Deterministic fallback used whenever the model's plan output is
 * missing, unparseable, or entirely hallucinated. It never fabricates a
 * plan — it just sequences the already-grounded, retrieval-ranked
 * candidates one per week, so a weak or misbehaving model degrades the
 * experience rather than breaking it.
 */
function buildFallbackPlan(candidates: SerializedCourseWithCategory[]): CreatorPlanResult {
  return {
    weeks: candidates.map((course, index) => ({
      weekNumber: index + 1,
      focus: course.title,
      summary: `Work through "${course.title}" (${course.category.name}, ${course.level.toLowerCase()} level).`,
      course,
    })),
    overallSummary: null,
    generatedBy: "fallback-sequence",
  };
}

/**
 * Asks the AI provider to build a week-by-week plan choosing, ordering,
 * and explaining courses from the given candidate set, then grounds the
 * result: any slug the model returns that isn't in `candidates` is
 * silently dropped rather than shown to the user. Network/provider
 * failures are NOT caught here and propagate to the caller — that's a
 * real outage, distinct from "the model responded with unusable content".
 */
export async function generateCreatorPlan(
  profile: CreatorProfile,
  candidates: SerializedCourseWithCategory[],
  provider: AIProvider,
  locale: Locale = "en",
): Promise<CreatorPlanResult> {
  if (candidates.length === 0) {
    return { weeks: [], overallSummary: null, generatedBy: "fallback-sequence" };
  }

  const completion = await provider.generateCompletion({
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTIONS[locale]}` },
      {
        role: "user",
        content: `${formatProfile(profile)}\n\nCandidate courses:\n${buildCandidatesPrompt(candidates)}`,
      },
    ],
    temperature: 0.3,
  });

  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : creatorCoachModelResponseSchema.safeParse(parsed);

  if (!validated || !validated.success) {
    return buildFallbackPlan(candidates);
  }

  const candidatesBySlug = new Map(candidates.map((course) => [course.slug, course]));
  const grounded: CreatorCoachWeek[] = [];

  for (const item of validated.data.weeks) {
    const course = candidatesBySlug.get(item.courseSlug);
    if (!course) continue; // hallucination protection: not a real candidate, drop it
    grounded.push({ weekNumber: grounded.length + 1, focus: item.focus, summary: item.summary, course });
  }

  if (grounded.length === 0) {
    return buildFallbackPlan(candidates);
  }

  return {
    weeks: grounded,
    overallSummary: validated.data.overallSummary,
    generatedBy: "ai",
  };
}
