import { prisma } from "@/lib/prisma";
import { getCourseLessonsFlat } from "@/server/course-content";
import { findEnrollment } from "@/server/learning/enrollment";
import { calculateCourseProgress } from "@/server/learning/progress";
import { getReviewCandidates, type ReviewCandidate } from "@/server/learning/review-recommendations";
import { resolveResumeLesson } from "@/server/learning/resume";

const RECENT_PRACTICE_WINDOW = 20;

export interface LearningSignalLessonRef {
  slug: string;
  title: string;
}

/**
 * A deterministic, explainable summary of a student's real activity in one
 * course — entirely computed from PostgreSQL (progress, resume, and
 * LearningActivity rows). This is the DB-side input the AI Learning Coach
 * (V2) and the Tutor's bounded learning-state context are built on; it
 * contains no AI-generated content itself.
 */
export interface LearningSignals {
  completedLessons: number;
  totalLessons: number;
  /** 0-1, rounded to 2 decimals. Null when there are no recent practice attempts. */
  recentPracticeAccuracy: number | null;
  recentPracticeAttempts: number;
  recentTutorQuestions: number;
  lessonsNeedingPractice: ReviewCandidate[];
  /** The lesson the student last viewed (enrollment.currentLessonId), if any. */
  currentLesson: LearningSignalLessonRef | null;
  /** The deterministic resume target — see resolveResumeLesson. Null once the course is complete. */
  nextLesson: LearningSignalLessonRef | null;
  isCourseComplete: boolean;
}

interface PracticeMetadata {
  correct?: boolean;
}

export async function getLearningSignals(studentId: string, courseId: string): Promise<LearningSignals> {
  const [enrollment, flatLessons, progress, resumeState, recentPractice, recentTutorQuestions, reviewCandidates] =
    await Promise.all([
      findEnrollment(studentId, courseId),
      getCourseLessonsFlat(courseId),
      calculateCourseProgress(studentId, courseId),
      resolveResumeLesson(studentId, courseId),
      prisma.learningActivity.findMany({
        where: { studentId, courseId, type: "PRACTICE_ATTEMPT" },
        orderBy: { createdAt: "desc" },
        take: RECENT_PRACTICE_WINDOW,
        select: { metadata: true },
      }),
      prisma.learningActivity.count({ where: { studentId, courseId, type: "TUTOR_QUESTION" } }),
      getReviewCandidates(studentId, courseId),
    ]);

  const recentPracticeAttempts = recentPractice.length;
  const recentPracticeCorrect = recentPractice.filter(
    (activity) => (activity.metadata as PracticeMetadata | null)?.correct === true,
  ).length;

  const currentLesson = enrollment?.currentLessonId
    ? (flatLessons.find((lesson) => lesson.id === enrollment.currentLessonId) ?? null)
    : null;

  return {
    completedLessons: progress.completedLessons,
    totalLessons: progress.totalLessons,
    recentPracticeAccuracy:
      recentPracticeAttempts === 0
        ? null
        : Math.round((recentPracticeCorrect / recentPracticeAttempts) * 100) / 100,
    recentPracticeAttempts,
    recentTutorQuestions,
    lessonsNeedingPractice: reviewCandidates,
    currentLesson: currentLesson ? { slug: currentLesson.slug, title: currentLesson.title } : null,
    nextLesson:
      !resumeState.isCourseComplete && resumeState.lesson
        ? { slug: resumeState.lesson.slug, title: resumeState.lesson.title }
        : null,
    isCourseComplete: resumeState.isCourseComplete,
  };
}
