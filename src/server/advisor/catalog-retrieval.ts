import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import type { LearningIntent } from "@/lib/validation/learning-intent";
import type { SerializedCourseWithCategory } from "@/types/course";

/** How many PUBLISHED courses the DB query pulls before in-memory scoring. */
const CANDIDATE_POOL_SIZE = 30;
/** How many top-scored courses are handed to the AI reasoning step. */
export const MAX_CANDIDATES = 8;

/**
 * Pure translation from intent topics to a Prisma where clause. Separate
 * from the Prisma call so the query-shaping logic is unit-testable without
 * a database, matching the pattern in server/course-query-builder.ts.
 */
export function buildCandidateWhere(
  intent: Pick<LearningIntent, "topics" | "budgetPreference">,
): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {
    status: "PUBLISHED",
    OR: intent.topics.flatMap((topic) => [
      { title: { contains: topic, mode: "insensitive" as const } },
      { shortDescription: { contains: topic, mode: "insensitive" as const } },
      { fullDescription: { contains: topic, mode: "insensitive" as const } },
      { category: { name: { contains: topic, mode: "insensitive" as const } } },
    ]),
  };

  if (intent.budgetPreference === "FREE") {
    where.price = 0;
  }

  return where;
}

export interface ScorableCourse {
  title: string;
  shortDescription: string;
  fullDescription: string;
  level: string;
  featured: boolean;
  category: { name: string };
}

/**
 * Pure relevance score for one course against the extracted intent.
 * Higher is more relevant; 0 means no topic keyword matched anywhere and
 * the course should be excluded regardless of level/featured bonuses —
 * those only refine an already-relevant match, they don't create one.
 */
export function scoreCourseAgainstIntent(
  course: ScorableCourse,
  intent: Pick<LearningIntent, "topics" | "currentSkillLevel">,
): number {
  const haystacks: Array<{ text: string; weight: number }> = [
    { text: course.title, weight: 3 },
    { text: course.category.name, weight: 3 },
    { text: course.shortDescription, weight: 2 },
    { text: course.fullDescription, weight: 1 },
  ];

  let topicScore = 0;
  for (const topic of intent.topics) {
    const needle = topic.toLowerCase();
    if (!needle) continue;
    for (const { text, weight } of haystacks) {
      if (text.toLowerCase().includes(needle)) {
        topicScore += weight;
      }
    }
  }

  if (topicScore === 0) return 0;

  let score = topicScore;
  if (course.level === intent.currentSkillLevel) score += 2;
  if (course.featured) score += 1;
  return score;
}

function rankCandidates<T extends ScorableCourse>(
  courses: T[],
  intent: Pick<LearningIntent, "topics" | "currentSkillLevel">,
  limit: number,
): T[] {
  return courses
    .map((course) => ({ course, score: scoreCourseAgainstIntent(course, intent) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title))
    .slice(0, limit)
    .map(({ course }) => course);
}

/**
 * Retrieves and ranks real PUBLISHED courses for a learning intent. This
 * is the sole source of truth for "which courses exist" — the AI
 * reasoning step only ever chooses among what this function returns.
 */
export async function getCandidateCourses(
  intent: LearningIntent,
  limit = MAX_CANDIDATES,
): Promise<SerializedCourseWithCategory[]> {
  const where = buildCandidateWhere(intent);

  const pool = await prisma.course.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: CANDIDATE_POOL_SIZE,
  });

  const ranked = rankCandidates(pool, intent, limit);
  return toJSONSafe(ranked);
}
