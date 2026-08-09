import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { learningPathSeeds, type LearningPathSeed } from "@/data/learning-paths";
import type { SerializedCourseWithCategory } from "@/types/course";

export interface LearningPathSummary {
  slug: string;
  title: string;
  description: string;
  targetAudience: string;
  estimatedWeeks: number;
  courseCount: number;
}

export interface LearningPathWithCourses extends LearningPathSummary {
  /** Real PUBLISHED courses in path order. A courseSlug with no matching PUBLISHED course is silently skipped. */
  courses: SerializedCourseWithCategory[];
}

/**
 * Reorders a Prisma findMany result (which doesn't preserve `in` order) to
 * match the path's own course order, dropping any slug that isn't a real
 * PUBLISHED course — the same "never show what the DB didn't return"
 * discipline the Advisor and Tutor use, applied to static path config.
 */
function orderCoursesBySlug(
  courses: SerializedCourseWithCategory[],
  orderedSlugs: string[],
): SerializedCourseWithCategory[] {
  const bySlug = new Map(courses.map((course) => [course.slug, course]));
  return orderedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((course): course is SerializedCourseWithCategory => course !== undefined);
}

export async function listLearningPaths(): Promise<LearningPathSummary[]> {
  return learningPathSeeds.map((path) => ({
    slug: path.slug,
    title: path.title,
    description: path.description,
    targetAudience: path.targetAudience,
    estimatedWeeks: path.estimatedWeeks,
    courseCount: path.courseSlugs.length,
  }));
}

export async function getLearningPathBySlug(slug: string): Promise<LearningPathWithCourses | null> {
  const path = learningPathSeeds.find((seed) => seed.slug === slug);
  if (!path) return null;

  const courses = await prisma.course.findMany({
    where: { slug: { in: path.courseSlugs }, status: "PUBLISHED" },
    include: { category: true },
  });

  return {
    slug: path.slug,
    title: path.title,
    description: path.description,
    targetAudience: path.targetAudience,
    estimatedWeeks: path.estimatedWeeks,
    courseCount: path.courseSlugs.length,
    courses: orderCoursesBySlug(toJSONSafe(courses), path.courseSlugs),
  };
}

/** Which learning paths (if any) include a given course — used to cross-link from a course detail page. */
export function learningPathsContainingCourse(courseSlug: string): Pick<LearningPathSeed, "slug" | "title">[] {
  return learningPathSeeds
    .filter((path) => path.courseSlugs.includes(courseSlug))
    .map((path) => ({ slug: path.slug, title: path.title }));
}
