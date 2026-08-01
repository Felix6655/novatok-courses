import type { Category, Course, CourseModule, Lesson } from "@/generated/prisma/client";
import type { Serialized } from "@/lib/serialize";

export type SerializedCategory = Serialized<Category>;
export type SerializedCourse = Serialized<Course>;
export type SerializedCourseWithCategory = SerializedCourse & {
  category: SerializedCategory;
};

export type SerializedLesson = Serialized<Lesson>;
export type SerializedCourseModule = Serialized<CourseModule>;
export type SerializedModuleWithLessons = SerializedCourseModule & {
  lessons: SerializedLesson[];
};
