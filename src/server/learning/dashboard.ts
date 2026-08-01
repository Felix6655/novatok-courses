import type { LearningActivityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { calculateCourseProgress, type CourseProgress } from "@/server/learning/progress";
import { getReviewCandidates } from "@/server/learning/review-recommendations";
import type { SerializedCourseWithCategory } from "@/types/course";

export interface DashboardEnrollment {
  course: SerializedCourseWithCategory;
  progress: CourseProgress;
  currentLessonSlug: string | null;
  lastAccessedAt: string;
  /** Count only — the AI Learning Coach on /learn/[courseSlug] explains why. */
  reviewCandidateCount: number;
}

/**
 * All of a student's enrollments with real, freshly-calculated progress
 * for each — used by /learn. Ordered by most recently accessed first so
 * "Continue Learning" surfaces the course they were most recently in.
 */
export async function getStudentDashboard(studentId: string): Promise<DashboardEnrollment[]> {
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId },
    include: { course: { include: { category: true } }, currentLesson: true },
    orderBy: { lastAccessedAt: "desc" },
  });

  return Promise.all(
    enrollments.map(async (enrollment) => {
      const [progress, reviewCandidates] = await Promise.all([
        calculateCourseProgress(studentId, enrollment.courseId),
        getReviewCandidates(studentId, enrollment.courseId),
      ]);
      return {
        course: toJSONSafe(enrollment.course),
        progress,
        currentLessonSlug: enrollment.currentLesson?.slug ?? null,
        lastAccessedAt: toJSONSafe(enrollment.lastAccessedAt),
        reviewCandidateCount: reviewCandidates.length,
      };
    }),
  );
}

export interface RecentActivityItem {
  id: string;
  type: LearningActivityType;
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string | null;
  occurredAt: string;
}

const RECENT_ACTIVITY_LIMIT = 8;

/**
 * A short, human-readable activity feed across all of a student's courses
 * — not a full audit log, just the same bounded LearningActivity rows the
 * rest of Sprint 6's learning intelligence is built on, formatted for
 * display. Used by /learn.
 */
export async function getRecentActivity(studentId: string): Promise<RecentActivityItem[]> {
  const activities = await prisma.learningActivity.findMany({
    where: { studentId },
    include: { course: true, lesson: true },
    orderBy: { createdAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
  });

  return activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    courseSlug: activity.course.slug,
    courseTitle: activity.course.title,
    lessonTitle: activity.lesson?.title ?? null,
    occurredAt: toJSONSafe(activity.createdAt),
  }));
}
