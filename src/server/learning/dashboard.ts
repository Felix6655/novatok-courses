import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { calculateCourseProgress, type CourseProgress } from "@/server/learning/progress";
import type { SerializedCourseWithCategory } from "@/types/course";

export interface DashboardEnrollment {
  course: SerializedCourseWithCategory;
  progress: CourseProgress;
  currentLessonSlug: string | null;
  lastAccessedAt: string;
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
      const progress = await calculateCourseProgress(studentId, enrollment.courseId);
      return {
        course: toJSONSafe(enrollment.course),
        progress,
        currentLessonSlug: enrollment.currentLesson?.slug ?? null,
        lastAccessedAt: toJSONSafe(enrollment.lastAccessedAt),
      };
    }),
  );
}
