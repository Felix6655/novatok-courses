import { z } from "zod";
import { slugParamSchema } from "@/lib/validation/course-query";
import { localeSchema } from "@/i18n/config";

export const PRACTICE_QUESTION_TYPES = ["MULTIPLE_CHOICE", "SHORT_ANSWER"] as const;
export type PracticeQuestionType = (typeof PRACTICE_QUESTION_TYPES)[number];

export const practiceRequestSchema = z.object({
  courseSlug: slugParamSchema,
  lessonSlug: slugParamSchema,
  locale: localeSchema.optional(),
});

export type PracticeRequest = z.infer<typeof practiceRequestSchema>;

/**
 * Shape the AI provider must return when generating a practice question.
 * The answer key (correctChoiceIndex / modelAnswer) is never sent back to
 * the client from the generate endpoint â€” see src/server/learning/practice-store.ts.
 * Structural refinements below ensure a MULTIPLE_CHOICE question always
 * carries a usable, in-range answer key and a SHORT_ANSWER question always
 * carries a reference answer, so evaluation never has to guess.
 */
export const practiceModelResponseSchema = z
  .object({
    questionType: z.enum(PRACTICE_QUESTION_TYPES),
    question: z.string().trim().min(1).max(400),
    choices: z.array(z.string().trim().min(1).max(200)).min(2).max(6).nullable().default(null),
    correctChoiceIndex: z.number().int().min(0).max(5).nullable().default(null),
    modelAnswer: z.string().trim().min(1).max(400).nullable().default(null),
    explanation: z.string().trim().min(1).max(600),
  })
  .refine(
    (data) =>
      data.questionType !== "MULTIPLE_CHOICE" ||
      (data.choices !== null &&
        data.correctChoiceIndex !== null &&
        data.correctChoiceIndex < data.choices.length),
    {
      message: "MULTIPLE_CHOICE questions require choices and an in-range correctChoiceIndex",
      path: ["choices"],
    },
  )
  .refine((data) => data.questionType !== "SHORT_ANSWER" || data.modelAnswer !== null, {
    message: "SHORT_ANSWER questions require a modelAnswer",
    path: ["modelAnswer"],
  });

export type PracticeModelResponse = z.infer<typeof practiceModelResponseSchema>;

export const practiceEvaluateRequestSchema = z.object({
  practiceId: z.string().trim().min(1).max(200),
  studentAnswer: z.string().trim().min(1).max(500),
});

export type PracticeEvaluateRequest = z.infer<typeof practiceEvaluateRequestSchema>;

/**
 * Bounded shape the AI provider must return when evaluating a SHORT_ANSWER
 * attempt. MULTIPLE_CHOICE attempts never call the AI for evaluation â€”
 * see src/server/learning/practice.ts.
 */
export const practiceEvaluationModelResponseSchema = z.object({
  correct: z.boolean(),
  feedback: z.string().trim().min(1).max(400),
});

export type PracticeEvaluationModelResponse = z.infer<typeof practiceEvaluationModelResponseSchema>;
