import { z } from "zod";
import { slugParamSchema } from "@/lib/validation/course-query";
import { MAX_HISTORY_TURNS, tutorHistoryTurnSchema } from "@/lib/validation/tutor";

export const learningCoachRequestSchema = z.object({
  courseSlug: slugParamSchema,
  /** Optional recent Tutor Q&A from the active session — context only, never authoritative. */
  recentTutorHistory: z.array(tutorHistoryTurnSchema).max(MAX_HISTORY_TURNS).default([]),
});

export type LearningCoachRequest = z.infer<typeof learningCoachRequestSchema>;

/**
 * The model contributes explanation text only — never a lesson/course
 * identifier. Which lesson is "next" is entirely decided by
 * resolveResumeLesson() before the AI is ever called, so there is no
 * lesson/course field here for the model to hallucinate. `practiceSuggestion`
 * is likewise just prose — which lessons actually need review is decided
 * deterministically by getReviewCandidates(), not by the model.
 */
export const learningCoachModelResponseSchema = z.object({
  explanation: z.string().trim().min(1).max(1500),
  studyTips: z.array(z.string().trim().min(1).max(300)).max(5).default([]),
  practiceSuggestion: z.string().trim().min(1).max(300).nullable().default(null),
});

export type LearningCoachModelResponse = z.infer<typeof learningCoachModelResponseSchema>;
