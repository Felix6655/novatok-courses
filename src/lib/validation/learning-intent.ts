import { z } from "zod";
import { COURSE_LEVEL_VALUES } from "@/lib/validation/course-query";
import { localeSchema } from "@/i18n/config";

/**
 * Structured interpretation of a student's free-text learning goal.
 * Deliberately minimal â€” only fields the Sprint 2 catalog-retrieval and
 * reasoning steps actually use. Extend when a concrete feature needs more,
 * not speculatively.
 */
export const learningIntentSchema = z.object({
  goal: z.string().trim().min(1).max(300),
  currentSkillLevel: z.enum(COURSE_LEVEL_VALUES).default("BEGINNER"),
  topics: z.array(z.string().trim().min(1).max(60)).min(1).max(8),
  availableHoursPerWeek: z.number().positive().max(168).nullable().default(null),
  budgetPreference: z.enum(["FREE", "ANY"]).default("ANY"),
  constraints: z.array(z.string().trim().min(1).max(200)).max(10).default([]),
});

export type LearningIntent = z.infer<typeof learningIntentSchema>;

export const courseAdvisorRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  locale: localeSchema.optional(),
});

export type CourseAdvisorRequest = z.infer<typeof courseAdvisorRequestSchema>;
