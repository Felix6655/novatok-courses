import type { Category, Course } from "@/generated/prisma/client";
import type { Serialized } from "@/lib/serialize";

export type SerializedCategory = Serialized<Category>;
export type SerializedCourse = Serialized<Course>;
export type SerializedCourseWithCategory = SerializedCourse & {
  category: SerializedCategory;
};
