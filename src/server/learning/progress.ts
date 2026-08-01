import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { getLessonByCourseAndSlug } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";
import { findEnrollment, touchEnrollmentAccess } from "@/server/learning/enrollment";
import {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import type { SerializedLessonProgress } from "@/types/learning";

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  /** 0-100, rounded. 0 for a course with no lessons rather than dividing by zero. */
  percentage: number;
  isComplete: boolean;
  completedLessonSlugs: string[];
}

/**
 * Calculated fresh from PostgreSQL every time — never trust a
 * client-provided percentage. completed/total come straight from real
 * LessonProgress and Lesson rows.
 */
export async function calculateCourseProgress(
  studentId: string,
  courseId: string,
): Promise<CourseProgress> {
  const [totalLessons, completedRows] = await Promise.all([
    prisma.lesson.count({ where: { courseId } }),
    prisma.lessonProgress.findMany({
      where: { studentId, courseId, completedAt: { not: null } },
      select: { lesson: { select: { slug: true } } },
    }),
  ]);

  const completedLessons = completedRows.length;

  return {
    totalLessons,
    completedLessons,
    percentage: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    isComplete: totalLessons > 0 && completedLessons === totalLessons,
    completedLessonSlugs: completedRows.map((row) => row.lesson.slug),
  };
}

export interface MarkLessonCompleteResult {
  progress: SerializedLessonProgress;
  courseProgress: CourseProgress;
}

/**
 * Marks a lesson complete for the given (trusted) studentId. Idempotent:
 * completing an already-completed lesson leaves its original
 * completedAt untouched and just returns current state. Validates the
 * course exists, the student is enrolled in it, and the lesson actually
 * belongs to that course (rejects both an unknown lesson and a real
 * lesson slug borrowed from a different course) before writing anything.
 */
export async function markLessonComplete(
  studentId: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<MarkLessonCompleteResult> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new EnrollmentCourseNotFoundError(courseSlug);
  }

  const enrollment = await findEnrollment(studentId, course.id);
  if (!enrollment) {
    throw new NotEnrolledError(courseSlug);
  }

  const lesson = await getLessonByCourseAndSlug(course.id, lessonSlug);
  if (!lesson) {
    throw new LearningLessonNotFoundError(courseSlug, lessonSlug);
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: { studentId_lessonId: { studentId, lessonId: lesson.id } },
  });

  const progressRow = existing?.completedAt
    ? existing
    : existing
      ? await prisma.lessonProgress.update({
          where: { id: existing.id },
          data: { completedAt: new Date() },
        })
      : await prisma.lessonProgress.create({
          data: { studentId, courseId: course.id, lessonId: lesson.id, completedAt: new Date() },
        });

  await touchEnrollmentAccess(studentId, course.id, lesson.id);
  const courseProgress = await calculateCourseProgress(studentId, course.id);

  return { progress: toJSONSafe(progressRow), courseProgress };
}
