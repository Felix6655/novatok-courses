import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import type { Locale } from "@/i18n/config";
import { applyTranslation, translationLocales } from "@/i18n/localize";

export async function getLocalizedCourseBySlug(slug: string, locale: Locale) {
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, translations: { where: { locale: { in: translationLocales(locale) } } } },
  });
  if (!course) return null;
  const { translations, ...canonical } = course;
  return toJSONSafe(applyTranslation(canonical, translations, locale));
}

export async function getLocalizedCourseContent(courseId: string, locale: Locale) {
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    include: {
      translations: { where: { locale: { in: translationLocales(locale) } } },
      lessons: {
        orderBy: { displayOrder: "asc" },
        include: { translations: { where: { locale: { in: translationLocales(locale) } } } },
      },
    },
    orderBy: { displayOrder: "asc" },
  });
  return toJSONSafe(modules.map((module) => {
    const { translations, lessons, ...canonical } = module;
    return {
      ...applyTranslation(canonical, translations, locale),
      lessons: lessons.map((lesson) => {
        const { translations: lessonTranslations, ...lessonCanonical } = lesson;
        return applyTranslation(lessonCanonical, lessonTranslations, locale);
      }),
    };
  }));
}

export async function searchLocalizedCourses(query: string, locale: Locale, limit = 20) {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { translations: { some: { locale, OR: [
          { title: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
          { fullDescription: { contains: query, mode: "insensitive" } },
        ] } } },
        { title: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { fullDescription: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { category: true, translations: { where: { locale: { in: translationLocales(locale) } } } },
    take: limit,
  });
  return toJSONSafe(courses.map((course) => {
    const { translations, ...canonical } = course;
    return applyTranslation(canonical, translations, locale);
  }));
}
