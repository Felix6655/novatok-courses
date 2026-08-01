import { z } from "zod";
import { slugParamSchema } from "@/lib/validation/course-query";

export const enrollRequestSchema = z.object({
  courseSlug: slugParamSchema,
});

export type EnrollRequest = z.infer<typeof enrollRequestSchema>;

export const completeLessonRequestSchema = z.object({
  courseSlug: slugParamSchema,
  lessonSlug: slugParamSchema,
});

export type CompleteLessonRequest = z.infer<typeof completeLessonRequestSchema>;
