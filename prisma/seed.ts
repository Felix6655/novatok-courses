import { prisma } from "@/lib/prisma";
import { categorySeeds } from "@/seed-data/categories";
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

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: courseData,
      create: courseData,
    });
  }

  const categoryCount = await prisma.category.count();
  const courseCount = await prisma.course.count();
  console.log(
    `Seed complete: ${categoryCount} categories, ${courseCount} courses.`,
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
