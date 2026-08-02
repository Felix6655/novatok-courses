import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import type { CourseListQuery } from "@/lib/validation/course-query";
import type { Locale } from "@/i18n/config";
import { applyTranslation, resolveTranslation, translationLocales } from "@/i18n/localize";
import { buildCourseWhere, computePagination, type PaginationMeta } from "@/server/course-query-builder";

const RELATED_COURSES_LIMIT = 4;

export async function listCourses(filters: CourseListQuery, locale?: Locale, options: { includeDrafts?: boolean } = {}) {
  const canonicalWhere = buildCourseWhere(filters);
  const where = locale && filters.search ? {
    ...canonicalWhere,
    OR: [
      { title: { contains: filters.search, mode: "insensitive" as const } },
      { shortDescription: { contains: filters.search, mode: "insensitive" as const } },
      { translations: { some: { locale, ...(options.includeDrafts ? {} : { status: "PUBLISHED" as const }), OR: [
        { title: { contains: filters.search, mode: "insensitive" as const } },
        { shortDescription: { contains: filters.search, mode: "insensitive" as const } },
      ] } } },
    ],
  } : canonicalWhere;
  if (!locale) {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({ where, include: { category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], skip: (filters.page - 1) * filters.limit, take: filters.limit }),
      prisma.course.count({ where }),
    ]);
    return toJSONSafe({ courses, pagination: computePagination(total, filters.page, filters.limit) });
  }
  const [courses, total] = await Promise.all([
    prisma.course.findMany({ where, include: { category: true, translations: { where: { locale: { in: translationLocales(locale) }, ...(options.includeDrafts ? {} : { status: "PUBLISHED" as const }) } } }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], skip: (filters.page - 1) * filters.limit, take: filters.limit }),
    prisma.course.count({ where }),
  ]);
  const localized = courses.map(({ translations, ...canonical }) => ({ ...applyTranslation(canonical, translations, locale), _localization: resolveTranslation(translations, locale) }));
  const pagination: PaginationMeta = computePagination(total, filters.page, filters.limit);
  return toJSONSafe({ courses: localized, pagination });
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
  return course ? toJSONSafe(course) : null;
}

export async function getRelatedCourses(course: { id: string; categoryId: string }, limit = RELATED_COURSES_LIMIT) {
  const related = await prisma.course.findMany({ where: { status: "PUBLISHED", categoryId: course.categoryId, id: { not: course.id } }, include: { category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: limit });
  return toJSONSafe(related);
}
