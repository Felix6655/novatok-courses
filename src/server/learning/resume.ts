import { prisma } from "@/lib/prisma";
import { getCourseLessonsFlat } from "@/server/course-content";
import { findEnrollment } from "@/server/learning/enrollment";
import type { SerializedLesson } from "@/types/course";

export interface ResumeState {
  /** The lesson to show. Null only if the course genuinely has zero lessons. */
  lesson: SerializedLesson | null;
  isCourseComplete: boolean;
}

/**
 * Deterministic resume logic — no AI involved, by design. The database
 * (completed LessonProgress rows + the enrollment's currentLessonId) is
 * the only source of truth for which lesson a student should land on:
 *
 * 1. If the last lesson they were viewing (currentLessonId) is still
 *    incomplete, resume exactly there.
 * 2. Otherwise, resume at the first incomplete lesson in course order.
 * 3. If every lesson is complete, report isCourseComplete instead of
 *    picking an arbitrary lesson.
 */
export async function resolveResumeLesson(
  studentId: string,
  courseId: string,
): Promise<ResumeState> {
  const lessons = await getCourseLessonsFlat(courseId);
  if (lessons.length === 0) {
    return { lesson: null, isCourseComplete: false };
  }

  const [enrollment, completedRows] = await Promise.all([
    findEnrollment(studentId, courseId),
    prisma.lessonProgress.findMany({
      where: { studentId, courseId, completedAt: { not: null } },
      select: { lessonId: true },
    }),
  ]);

  const completedLessonIds = new Set(completedRows.map((row) => row.lessonId));

  if (enrollment?.currentLessonId && !completedLessonIds.has(enrollment.currentLessonId)) {
    const current = lessons.find((lesson) => lesson.id === enrollment.currentLessonId);
    if (current) {
      return { lesson: current, isCourseComplete: false };
    }
  }

  const firstIncomplete = lessons.find((lesson) => !completedLessonIds.has(lesson.id));
  if (firstIncomplete) {
    return { lesson: firstIncomplete, isCourseComplete: false };
  }

  return { lesson: lessons[0], isCourseComplete: true };
}
