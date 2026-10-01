import { z } from "zod";
import { localeSchema, type Locale } from "@/i18n/config";

export const GUIDED_LEARNING_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type GuidedLearningLevel = (typeof GUIDED_LEARNING_LEVELS)[number];

export const guidedLearningRequestSchema = z.object({
  goal: z.string().trim().min(3).max(500),
  currentLevel: z.enum(GUIDED_LEARNING_LEVELS).default("BEGINNER"),
  weeklyHours: z.number().int().min(1).max(40).default(5),
  locale: localeSchema.optional(),
});

export type GuidedLearningRequest = Omit<z.infer<typeof guidedLearningRequestSchema>, "locale"> & {
  locale?: Locale;
};

export const guidedLearningStepSchema = z.object({
  title: z.string().trim().min(1).max(160),
  outcome: z.string().trim().min(1).max(500),
  topics: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
  practice: z.array(z.string().trim().min(1).max(240)).max(5).default([]),
});

export const guidedLearningModelResponseSchema = z.object({
  goalSummary: z.string().trim().min(1).max(500),
  estimatedWeeks: z.number().int().min(1).max(52),
  steps: z.array(guidedLearningStepSchema).min(2).max(12),
  studyTips: z.array(z.string().trim().min(1).max(240)).max(6).default([]),
  resourceQueries: z.array(z.string().trim().min(1).max(160)).max(8).default([]),
});

export type GuidedLearningModelResponse = z.infer<typeof guidedLearningModelResponseSchema>;


export const saveGuidedLearningPlanSchema = guidedLearningRequestSchema.extend({
  source: z.enum(["ai", "fallback"]),
  plan: guidedLearningModelResponseSchema,
});

export type SaveGuidedLearningPlanRequest = z.infer<typeof saveGuidedLearningPlanSchema>;

export const updateGuidedLearningProgressSchema = z.object({
  stepIndex: z.number().int().min(0).max(11),
  completed: z.boolean(),
});

export type UpdateGuidedLearningProgressRequest = z.infer<
  typeof updateGuidedLearningProgressSchema
>;
