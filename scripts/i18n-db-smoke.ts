import "dotenv/config";
import { prisma } from "@/lib/prisma";
async function main() {
  const counts = await Promise.all([
    prisma.course.count(), prisma.courseModule.count(), prisma.lesson.count(),
    prisma.courseTranslation.count(), prisma.courseModuleTranslation.count(), prisma.lessonTranslation.count(),
  ]);
  const spanish = await prisma.courseTranslation.findFirst({ where: { locale: "es", title: { contains: "JavaScript" } }, include: { course: true } });
  console.log(JSON.stringify({ courses: counts[0], modules: counts[1], lessons: counts[2], courseTranslations: counts[3], moduleTranslations: counts[4], lessonTranslations: counts[5], localizedCanonicalSlug: spanish?.course.slug }, null, 2));
}
main().finally(() => prisma.$disconnect());
