import { z } from "zod";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider } from "@/ai/provider";
import type { LearningIntent } from "@/lib/validation/learning-intent";
import type { SerializedCourseWithCategory } from "@/types/course";

const modelRecommendationSchema = z.object({
  recommendations: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        reason: z.string().trim().min(1).max(400),
      }),
    )
    .min(1),
  pathSummary: z.string().trim().min(1).max(600).nullable().default(null),
});

export interface CourseRecommendation {
  course: SerializedCourseWithCategory;
  reason: string;
  order: number;
}

export interface RecommendationResult {
  recommendations: CourseRecommendation[];
  pathSummary: string | null;
  generatedBy: "ai" | "fallback-ranking";
}

const SYSTEM_PROMPT = `You are the NovaTok Courses advisor. You are given a student's learning intent and a
numbered list of real candidate courses, each with its exact slug. Choose the best-fitting courses from
THIS LIST ONLY, order them as a sensible learning path (earliest first), and give one short reason each.
You must NEVER invent a course or slug that is not in the provided list.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{
  "recommendations": [ { "slug": string, "reason": string } ],
  "pathSummary": string | null
}

"slug" must be copied exactly from the candidate list. Include only courses that genuinely fit; omit
irrelevant ones. "reason" is one short sentence per course. "pathSummary" is one or two sentences
describing the suggested order, or null if there's only one course.`;

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
 * Deterministic fallback used whenever the model's course-selection output
 * is missing, unparseable, or entirely hallucinated. It never fabricates
 * data — it just presents the already-grounded, DB-ranked candidates
 * as-is, so a weak or misbehaving model degrades the experience rather
 * than breaking it.
 */
function buildFallbackResult(candidates: SerializedCourseWithCategory[]): RecommendationResult {
  return {
    recommendations: candidates.map((course, index) => ({
      course,
      reason: `Matches your interest in ${course.category.name} at the ${course.level.toLowerCase()} level.`,
      order: index + 1,
    })),
    pathSummary: null,
    generatedBy: "fallback-ranking",
  };
}

/**
 * Asks the AI provider to choose, order, and explain courses from the
 * given candidate set, then grounds the result: any slug the model
 * returns that isn't in `candidates` is silently dropped rather than
 * shown to the user. Network/provider failures are NOT caught here and
 * propagate to the caller — that's a real outage, distinct from "the
 * model responded with unusable content".
 */
export async function generateRecommendation(
  intent: LearningIntent,
  candidates: SerializedCourseWithCategory[],
  provider: AIProvider,
): Promise<RecommendationResult> {
  if (candidates.length === 0) {
    return { recommendations: [], pathSummary: null, generatedBy: "fallback-ranking" };
  }

  const completion = await provider.generateCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Learning goal: ${intent.goal}\n` +
          `Current level: ${intent.currentSkillLevel}\n` +
          `Topics: ${intent.topics.join(", ")}\n\n` +
          `Candidate courses:\n${buildCandidatesPrompt(candidates)}`,
      },
    ],
    temperature: 0.2,
  });

  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : modelRecommendationSchema.safeParse(parsed);

  if (!validated || !validated.success) {
    return buildFallbackResult(candidates);
  }

  const candidatesBySlug = new Map(candidates.map((course) => [course.slug, course]));
  const seenSlugs = new Set<string>();
  const grounded: CourseRecommendation[] = [];

  for (const item of validated.data.recommendations) {
    if (seenSlugs.has(item.slug)) continue;
    const course = candidatesBySlug.get(item.slug);
    if (!course) continue; // hallucination protection: not a real candidate, drop it
    seenSlugs.add(item.slug);
    grounded.push({ course, reason: item.reason, order: grounded.length + 1 });
  }

  if (grounded.length === 0) {
    return buildFallbackResult(candidates);
  }

  return {
    recommendations: grounded,
    pathSummary: validated.data.pathSummary,
    generatedBy: "ai",
  };
}
