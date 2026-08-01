import type { LessonProgress, StudentEnrollment } from "@/generated/prisma/client";
import type { Serialized } from "@/lib/serialize";

export type SerializedEnrollment = Serialized<StudentEnrollment>;
export type SerializedLessonProgress = Serialized<LessonProgress>;
