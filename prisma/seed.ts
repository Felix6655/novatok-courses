import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { categorySeeds } from "@/seed-data/categories";
import { courseContentSeeds } from "@/seed-data/course-content";
import { courseSeeds } from "@/seed-data/courses";

/**
 * Upserts by slug so re-running the seed never creates duplicates and
 * always converges seeded rows to the current seed-data definitions.
 */
async function main() {
  const categoryIdBySlug = new Map<string, string>();

  for (const category of categorySeeds) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        displayOrder: category.displayOrder,
        active: category.active,
      },
      create: category,
    });
    categoryIdBySlug.set(category.slug, record.id);
  }

  const courseIdBySlug = new Map<string, string>();

  for (const course of courseSeeds) {
    const categoryId = categoryIdBySlug.get(course.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Seed error: course "${course.slug}" references unknown category "${course.categorySlug}"`,
      );
    }

    const courseData = {
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      categoryId,
      instructorName: course.instructorName,
      instructorBio: course.instructorBio,
      thumbnailUrl: course.thumbnailUrl,
      promoVideoUrl: course.promoVideoUrl,
      price: course.price,
      originalPrice: course.originalPrice,
      currency: course.currency,
      level: course.level,
      language: course.language,
      durationMinutes: course.durationMinutes,
      lessonCount: course.lessonCount,
      certificateAvailable: course.certificateAvailable,
      prerequisites: course.prerequisites,
      learningOutcomes: course.learningOutcomes,
      enrollmentUrl: course.enrollmentUrl,
      status: course.status,
      featured: course.featured,
    };

    const record = await prisma.course.upsert({
      where: { slug: course.slug },
      update: courseData,
      create: courseData,
    });
    courseIdBySlug.set(course.slug, record.id);
  }

  for (const courseContent of courseContentSeeds) {
    const courseId = courseIdBySlug.get(courseContent.courseSlug);
    if (!courseId) {
      throw new Error(
        `Seed error: course content references unknown course "${courseContent.courseSlug}"`,
      );
    }

    for (const courseModule of courseContent.modules) {
      const moduleRecord = await prisma.courseModule.upsert({
        where: { courseId_displayOrder: { courseId, displayOrder: courseModule.displayOrder } },
        update: {
          title: courseModule.title,
          description: courseModule.description,
        },
        create: {
          courseId,
          title: courseModule.title,
          description: courseModule.description,
          displayOrder: courseModule.displayOrder,
        },
      });

      for (const lesson of courseModule.lessons) {
        const lessonData = {
          moduleId: moduleRecord.id,
          courseId,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          content: lesson.content,
          displayOrder: lesson.displayOrder,
        };

        await prisma.lesson.upsert({
          where: { courseId_slug: { courseId, slug: lesson.slug } },
          update: lessonData,
          create: lessonData,
        });
      }
    }
  }

  const categoryCount = await prisma.category.count();
  const courseCount = await prisma.course.count();
  const moduleCount = await prisma.courseModule.count();
  const lessonCount = await prisma.lesson.count();
  console.log(
    `Seed complete: ${categoryCount} categories, ${courseCount} courses, ` +
      `${moduleCount} modules, ${lessonCount} lessons.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
