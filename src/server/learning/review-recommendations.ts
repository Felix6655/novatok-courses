import { prisma } from "@/lib/prisma";
import { getCourseModulesWithLessons } from "@/server/course-content";

export interface ReviewCandidate {
  lessonSlug: string;
  lessonTitle: string;
  moduleTitle: string;
  /** Plain-language, explainable reason — never an AI-generated score. */
  reason: string;
}

const MIN_PRACTICE_ATTEMPTS_FOR_SIGNAL = 2;
const LOW_ACCURACY_THRESHOLD = 0.5;
const REPEATED_TUTOR_QUESTIONS_THRESHOLD = 3;
const MAX_REVIEW_CANDIDATES = 5;

interface PracticeMetadata {
  correct?: boolean;
}

/**
 * Deterministic, explainable review-candidate rules — no AI, no
 * spaced-repetition scheduling. A lesson becomes a candidate when either
 * (a) at least 2 practice attempts were made and fewer than half were
 * correct, or (b) the Tutor was asked about it at least 3 times. Both are
 * plain counts over real LearningActivity rows.
 */
export async function getReviewCandidates(
  studentId: string,
  courseId: string,
): Promise<ReviewCandidate[]> {
  const [practiceActivities, tutorCounts, syllabus] = await Promise.all([
    prisma.learningActivity.findMany({
      where: { studentId, courseId, type: "PRACTICE_ATTEMPT", lessonId: { not: null } },
      select: { lessonId: true, metadata: true },
    }),
    prisma.learningActivity.groupBy({
      by: ["lessonId"],
      where: { studentId, courseId, type: "TUTOR_QUESTION", lessonId: { not: null } },
      _count: { _all: true },
    }),
    getCourseModulesWithLessons(courseId),
  ]);

  const practiceByLesson = new Map<string, { correct: number; total: number }>();
  for (const activity of practiceActivities) {
    if (!activity.lessonId) continue;
    const metadata = activity.metadata as PracticeMetadata | null;
    const bucket = practiceByLesson.get(activity.lessonId) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (metadata?.correct) bucket.correct += 1;
    practiceByLesson.set(activity.lessonId, bucket);
  }

  const tutorCountByLesson = new Map<string, number>();
  for (const row of tutorCounts) {
    if (row.lessonId) {
      tutorCountByLesson.set(row.lessonId, row._count._all);
    }
  }

  const candidates: ReviewCandidate[] = [];
  for (const learningModule of syllabus) {
    for (const lesson of learningModule.lessons) {
      const reasons: string[] = [];

      const practice = practiceByLesson.get(lesson.id);
      if (practice && practice.total >= MIN_PRACTICE_ATTEMPTS_FOR_SIGNAL) {
        const accuracy = practice.correct / practice.total;
        if (accuracy < LOW_ACCURACY_THRESHOLD) {
          reasons.push(
            `correct on only ${Math.round(accuracy * 100)}% of ${practice.total} recent practice attempts`,
          );
        }
      }

      const tutorCount = tutorCountByLesson.get(lesson.id) ?? 0;
      if (tutorCount >= REPEATED_TUTOR_QUESTIONS_THRESHOLD) {
        reasons.push(`asked the Tutor about this lesson ${tutorCount} times`);
      }

      if (reasons.length > 0) {
        candidates.push({
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          moduleTitle: learningModule.title,
          reason: reasons.join("; "),
        });
      }
    }
  }

  return candidates.slice(0, MAX_REVIEW_CANDIDATES);
}
