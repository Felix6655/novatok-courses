import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import type { CourseListQuery } from "@/lib/validation/course-query";
import { buildCourseWhere, computePagination, type PaginationMeta } from "@/server/course-query-builder";

const RELATED_COURSES_LIMIT = 4;

export async function listCourses(filters: CourseListQuery) {
  const where = buildCourseWhere(filters);

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.course.count({ where }),
  ]);

  const pagination: PaginationMeta = computePagination(total, filters.page, filters.limit);

  return toJSONSafe({ courses, pagination });
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  });
  return course ? toJSONSafe(course) : null;
}

export async function getRelatedCourses(
  course: { id: string; categoryId: string },
  limit = RELATED_COURSES_LIMIT,
) {
  const related = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: course.categoryId,
      id: { not: course.id },
    },
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return toJSONSafe(related);
}
