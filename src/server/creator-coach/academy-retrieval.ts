import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import type { CreatorProfile } from "@/lib/validation/creator-coach";
import type { SerializedCourseWithCategory } from "@/types/course";

/** How many PUBLISHED courses the DB query pulls before in-memory scoring. */
const CANDIDATE_POOL_SIZE = 40;
/** How many top-scored courses are handed to the AI plan-generation step. */
export const MAX_CANDIDATES = 10;

const CREATOR_ECONOMY_CATEGORY_SLUG = "creator-economy";

/**
 * Pure translation from a creator profile's keywords to a Prisma where
 * clause — mirrors src/server/advisor/catalog-retrieval.ts. Deliberately
 * not restricted to the creator-economy category alone: a small-business
 * profile, for instance, may also genuinely match a Digital Marketing
 * course, so retrieval stays catalog-wide and scoring (below) is what
 * biases toward Creator Economy content.
 */
export function buildCandidateWhere(
  profile: Pick<CreatorProfile, "focusAreas" | "platforms">,
): Prisma.CourseWhereInput {
  const keywords = [...profile.focusAreas, ...profile.platforms];
  return {
    status: "PUBLISHED",
    OR: keywords.flatMap((keyword) => [
      { title: { contains: keyword, mode: "insensitive" as const } },
      { shortDescription: { contains: keyword, mode: "insensitive" as const } },
      { fullDescription: { contains: keyword, mode: "insensitive" as const } },
      { category: { name: { contains: keyword, mode: "insensitive" as const } } },
    ]),
  };
}

export interface ScorableCourse {
  title: string;
  shortDescription: string;
  fullDescription: string;
  level: string;
  featured: boolean;
  category: { name: string; slug: string };
}

/**
 * Pure relevance score for one course against a creator profile. Higher
 * is more relevant; 0 means no focus-area or platform keyword matched
 * anywhere and the course should be excluded — category/level/featured
 * only refine an already-relevant match, they don't create one.
 */
export function scoreCourseAgainstProfile(
  course: ScorableCourse,
  profile: Pick<CreatorProfile, "focusAreas" | "platforms" | "experienceLevel">,
): number {
  const haystacks: Array<{ text: string; weight: number }> = [
    { text: course.title, weight: 3 },
    { text: course.category.name, weight: 3 },
    { text: course.shortDescription, weight: 2 },
    { text: course.fullDescription, weight: 1 },
  ];

  let keywordScore = 0;
  for (const keyword of [...profile.focusAreas, ...profile.platforms]) {
    const needle = keyword.toLowerCase();
    if (!needle) continue;
    for (const { text, weight } of haystacks) {
      if (text.toLowerCase().includes(needle)) {
        keywordScore += weight;
      }
    }
  }

  if (keywordScore === 0) return 0;

  let score = keywordScore;
  if (course.category.slug === CREATOR_ECONOMY_CATEGORY_SLUG) score += 3;
  if (course.level === profile.experienceLevel) score += 2;
  if (course.featured) score += 1;
  return score;
}

function rankCandidates<T extends ScorableCourse>(
  courses: T[],
  profile: Pick<CreatorProfile, "focusAreas" | "platforms" | "experienceLevel">,
  limit: number,
): T[] {
  return courses
    .map((course) => ({ course, score: scoreCourseAgainstProfile(course, profile) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title))
    .slice(0, limit)
    .map(({ course }) => course);
}

/**
 * Retrieves and ranks real PUBLISHED courses for a creator profile. This
 * is the sole source of truth for "which courses exist" — the AI
 * plan-generation step only ever chooses among what this function
 * returns.
 */
export async function getCandidateCourses(
  profile: CreatorProfile,
  limit = MAX_CANDIDATES,
): Promise<SerializedCourseWithCategory[]> {
  const where = buildCandidateWhere(profile);

  const pool = await prisma.course.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: CANDIDATE_POOL_SIZE,
  });

  const ranked = rankCandidates(pool, profile, limit);
  return toJSONSafe(ranked);
}
