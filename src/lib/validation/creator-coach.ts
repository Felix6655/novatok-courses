import { z } from "zod";
import { localeSchema } from "@/i18n/config";

export const CREATOR_EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

/**
 * Structured interpretation of a creator's free-text business/goal
 * description. Mirrors src/lib/validation/learning-intent.ts's role for
 * the Course Advisor, scoped to creator-business context instead of a
 * general learning goal. Deliberately minimal — extend when a concrete
 * feature needs more, not speculatively.
 */
export const creatorProfileSchema = z.object({
  businessSummary: z.string().trim().min(1).max(300),
  platforms: z.array(z.string().trim().min(1).max(40)).max(9).default([]),
  experienceLevel: z.enum(CREATOR_EXPERIENCE_LEVELS).default("BEGINNER"),
  primaryGoal: z.string().trim().min(1).max(300),
  focusAreas: z.array(z.string().trim().min(1).max(60)).min(1).max(8),
  constraints: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
});

export type CreatorProfile = z.infer<typeof creatorProfileSchema>;

export const creatorCoachRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  locale: localeSchema.optional(),
});

export type CreatorCoachRequest = z.infer<typeof creatorCoachRequestSchema>;

const MAX_PLAN_WEEKS = 8;

/**
 * Shape the AI provider must return for the week-by-week plan. Never
 * trusted as-is: `courseSlug` gets grounded against the courses actually
 * retrieved for this profile before reaching the client, exactly like the
 * Course Advisor's recommendation grounding.
 */
export const creatorCoachModelResponseSchema = z.object({
  weeks: z
    .array(
      z.object({
        focus: z.string().trim().min(1).max(120),
        summary: z.string().trim().min(1).max(400),
        courseSlug: z.string().trim().min(1),
      }),
    )
    .min(1)
    .max(MAX_PLAN_WEEKS),
  overallSummary: z.string().trim().min(1).max(600).nullable().default(null),
});

export type CreatorCoachModelResponse = z.infer<typeof creatorCoachModelResponseSchema>;
