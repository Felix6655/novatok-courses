import { getCourseModulesWithLessons, getLessonByCourseAndSlug } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";
import { findEnrollment, touchEnrollmentAccess } from "@/server/learning/enrollment";
import { EnrollmentCourseNotFoundError, LearningLessonNotFoundError } from "@/server/learning/errors";
import { calculateCourseProgress, ensureLessonStarted, type CourseProgress } from "@/server/learning/progress";
import { resolveResumeLesson } from "@/server/learning/resume";
import type { SerializedCourseWithCategory, SerializedLesson, SerializedModuleWithLessons } from "@/types/course";

export type LearningState =
  | { status: "not-enrolled"; course: SerializedCourseWithCategory }
  | { status: "empty"; course: SerializedCourseWithCategory }
  | {
      status: "ready";
      course: SerializedCourseWithCategory;
      syllabus: SerializedModuleWithLessons[];
      currentLesson: SerializedLesson;
      progress: CourseProgress;
    };

/**
 * Assembles everything the /learn/[courseSlug] page needs in one place:
 * the real course, whether this (trusted) student is enrolled, the
 * syllabus, which lesson to show (an explicit lessonSlug if the caller
 * asked for one and it's valid, otherwise the deterministic resume
 * lesson), and real progress. Viewing a specific lesson here also
 * updates the enrollment's access bookkeeping, exactly like actually
 * completing a lesson does.
 */
export async function getLearningState(
  studentId: string,
  courseSlug: string,
  requestedLessonSlug?: string,
): Promise<LearningState> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new EnrollmentCourseNotFoundError(courseSlug);
  }

  const enrollment = await findEnrollment(studentId, course.id);
  if (!enrollment) {
    return { status: "not-enrolled", course };
  }

  const syllabus = await getCourseModulesWithLessons(course.id);
  const totalLessons = syllabus.reduce((sum, module) => sum + module.lessons.length, 0);
  if (totalLessons === 0) {
    return { status: "empty", course };
  }

  let currentLesson: SerializedLesson;
  if (requestedLessonSlug) {
    const lesson = await getLessonByCourseAndSlug(course.id, requestedLessonSlug);
    if (!lesson) {
      throw new LearningLessonNotFoundError(courseSlug, requestedLessonSlug);
    }
    currentLesson = lesson;
  } else {
    const resumed = await resolveResumeLesson(studentId, course.id);
    if (!resumed.lesson) {
      // Unreachable: totalLessons > 0 was already confirmed above, and
      // resolveResumeLesson only omits a lesson when the course has none.
      throw new Error(`No resume lesson found for course "${courseSlug}" despite having lessons`);
    }
    currentLesson = resumed.lesson;
  }

  await touchEnrollmentAccess(studentId, course.id, currentLesson.id);
  await ensureLessonStarted(studentId, course.id, currentLesson.id);
  const progress = await calculateCourseProgress(studentId, course.id);

  return { status: "ready", course, syllabus, currentLesson, progress };
}
