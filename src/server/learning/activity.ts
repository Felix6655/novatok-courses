import type { LearningActivityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { PracticeQuestionType } from "@/lib/validation/practice";
import type { TutorResponseMode } from "@/lib/validation/tutor";

/**
 * Fixed, small shape per activity type — never raw AI prompts, answers, or
 * unrestricted conversation text. This is the only data future learning
 * intelligence (src/server/learning/learning-signals.ts) can see about
 * what happened, by construction.
 */
export type LearningActivityMetadata =
  | { correct: boolean; questionType: PracticeQuestionType }
  | { responseMode: TutorResponseMode }
  | undefined;

export interface RecordLearningActivityParams {
  studentId: string;
  courseId: string;
  lessonId?: string | null;
  type: LearningActivityType;
  metadata?: LearningActivityMetadata;
}

/**
 * Appends one bounded learning-activity record. Fire-and-forget from the
 * caller's perspective is intentionally NOT how this is used — every call
 * site awaits this so activity data is consistent with the state change it
 * describes, but a failure here is never allowed to be more severe than
 * the learning-intelligence features that read it: callers that already
 * completed their primary side effect (e.g. marking a lesson complete)
 * should not fail the whole request if only the activity write fails.
 */
export async function recordLearningActivity(params: RecordLearningActivityParams): Promise<void> {
  await prisma.learningActivity.create({
    data: {
      studentId: params.studentId,
      courseId: params.courseId,
      lessonId: params.lessonId ?? null,
      type: params.type,
      metadata: params.metadata ?? undefined,
    },
  });
}
