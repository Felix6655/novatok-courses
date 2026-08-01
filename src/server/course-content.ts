import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import type { SerializedLesson, SerializedModuleWithLessons } from "@/types/course";

/**
 * Modules and their lessons for a course, ordered for display and for
 * building a syllabus overview. Returns [] for courses with no Sprint 3
 * content yet — callers should treat that as "no Tutor content available"
 * rather than an error.
 */
export async function getCourseModulesWithLessons(
  courseId: string,
): Promise<SerializedModuleWithLessons[]> {
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    include: { lessons: { orderBy: { displayOrder: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });
  return toJSONSafe(modules);
}

/**
 * Flat, ordered list of a course's lessons (module order, then lesson
 * order within the module) — the shape the Tutor's retrieval/ranking
 * layer scores against.
 */
export async function getCourseLessonsFlat(courseId: string): Promise<SerializedLesson[]> {
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: [{ module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
  });
  return toJSONSafe(lessons);
}

export async function getLessonByCourseAndSlug(
  courseId: string,
  slug: string,
): Promise<SerializedLesson | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { courseId_slug: { courseId, slug } },
  });
  return lesson ? toJSONSafe(lesson) : null;
}
