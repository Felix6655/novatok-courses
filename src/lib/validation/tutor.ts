import { z } from "zod";
import { slugParamSchema } from "@/lib/validation/course-query";

export const TUTOR_RESPONSE_MODES = ["NORMAL", "SIMPLE", "EXAMPLE", "PRACTICE"] as const;
export type TutorResponseMode = (typeof TUTOR_RESPONSE_MODES)[number];

/**
 * Small bound on follow-up context: enough for "explain that more
 * simply" / "give me another example" style follow-ups within one page
 * session, not a persistent conversation. Client-supplied and never
 * trusted as fact — see tutor-response.ts's system prompt.
 */
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_MESSAGE_LENGTH = 1000;

export const tutorHistoryTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_HISTORY_MESSAGE_LENGTH),
});

export type TutorHistoryTurn = z.infer<typeof tutorHistoryTurnSchema>;

export const tutorRequestSchema = z.object({
  courseSlug: slugParamSchema,
  question: z.string().trim().min(1).max(500),
  lessonSlug: slugParamSchema.optional(),
  responseMode: z.enum(TUTOR_RESPONSE_MODES).default("NORMAL"),
  history: z.array(tutorHistoryTurnSchema).max(MAX_HISTORY_TURNS).default([]),
});

export type TutorRequest = z.infer<typeof tutorRequestSchema>;

/**
 * Shape the AI provider must return for a Tutor turn. Never trusted
 * as-is: `relevantLessonSlugs` gets grounded against the lessons actually
 * retrieved for the question before reaching the client, exactly like the
 * Course Advisor's recommendation grounding.
 */
export const tutorModelResponseSchema = z.object({
  answer: z.string().trim().min(1).max(2000),
  relevantLessonSlugs: z.array(z.string().trim().min(1)).max(5).default([]),
  outOfScope: z.boolean().default(false),
  practiceQuestion: z
    .object({
      question: z.string().trim().min(1).max(400),
      choices: z.array(z.string().trim().min(1).max(200)).max(6).optional(),
      answer: z.string().trim().min(1).max(400),
      explanation: z.string().trim().min(1).max(600),
    })
    .nullable()
    .default(null),
});

export type TutorModelResponse = z.infer<typeof tutorModelResponseSchema>;
