import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { courseListQuerySchema } from "@/lib/validation/course-query";
import { getCourseModulesWithLessons, getCourseLessonsFlat } from "@/server/course-content";
import { listCategories, getCategoryBySlug } from "@/server/categories";
import { listCourses, getCourseBySlug } from "@/server/courses";
import { getRelevantLessons } from "@/server/tutor/content-retrieval";

/**
 * Exercises the real service layer (not mocks) against a live PostgreSQL
 * database, so schema/query wiring gets caught by something other than
 * "does the mock match what I typed." Not a monitoring tool — run by hand
 * (`npm run db:smoke`) against a dev database that's already been seeded.
 */

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("Categories");
  const categories = await listCategories();
  check("returns 15 active categories", categories.length === 15, `got ${categories.length}`);
  check(
    "ordered by displayOrder ascending",
    categories.every((c, i) => i === 0 || c.displayOrder >= categories[i - 1].displayOrder),
  );

  const category = await getCategoryBySlug("software-development");
  check("getCategoryBySlug finds a known category", category?.name === "Software Development");
  check("getCategoryBySlug returns null for an unknown slug", (await getCategoryBySlug("not-a-real-category")) === null);

  console.log("\nCourses");
  const defaultList = await listCourses(courseListQuerySchema.parse({}));
  const publishedCount = await prisma.course.count({ where: { status: "PUBLISHED" } });
  check(
    "pagination.total matches actual PUBLISHED course count",
    defaultList.pagination.total === publishedCount,
    `expected ${publishedCount}, got ${defaultList.pagination.total}`,
  );

  const course = await getCourseBySlug("javascript-fundamentals");
  check("getCourseBySlug finds a known published course", course?.title === "JavaScript Fundamentals");
  check("course includes its category relation", course?.category.slug === "software-development");
  check(
    "getCourseBySlug returns null for a DRAFT course",
    (await getCourseBySlug("building-an-ai-adoption-roadmap")) === null,
  );

  const categoryFiltered = await listCourses(
    courseListQuerySchema.parse({ category: "cybersecurity" }),
  );
  check(
    "category filter returns only that category's courses",
    categoryFiltered.courses.length > 0 &&
      categoryFiltered.courses.every((c) => c.category.slug === "cybersecurity"),
  );

  const levelFiltered = await listCourses(courseListQuerySchema.parse({ level: "BEGINNER" }));
  check(
    "level filter returns only BEGINNER courses",
    levelFiltered.courses.length > 0 && levelFiltered.courses.every((c) => c.level === "BEGINNER"),
  );

  const priceFiltered = await listCourses(courseListQuerySchema.parse({ maxPrice: "0" }));
  check(
    "maxPrice=0 filter returns only free courses",
    priceFiltered.courses.length > 0 && priceFiltered.courses.every((c) => c.price === "0.00"),
  );

  const searched = await listCourses(courseListQuerySchema.parse({ search: "python" }));
  check(
    "search finds courses mentioning 'python'",
    searched.courses.some((c) => c.title.toLowerCase().includes("python")),
  );

  console.log("\nCourse content (modules/lessons)");
  const contentCourse = await getCourseBySlug("javascript-fundamentals");
  if (!contentCourse) throw new Error("expected javascript-fundamentals to exist");

  const modules = await getCourseModulesWithLessons(contentCourse.id);
  check("javascript-fundamentals has seeded modules", modules.length === 2, `got ${modules.length}`);
  check(
    "modules are ordered and each has lessons",
    modules.every((m, i) => (i === 0 || m.displayOrder >= modules[i - 1].displayOrder) && m.lessons.length > 0),
  );

  const flatLessons = await getCourseLessonsFlat(contentCourse.id);
  check("flat lesson list matches module lesson count", flatLessons.length === modules.reduce((s, m) => s + m.lessons.length, 0));

  console.log("\nTutor content retrieval");
  const relevant = await getRelevantLessons(contentCourse.id, "Explain variables in JavaScript");
  check(
    "keyword-relevant question matches the variables lesson",
    relevant.lessons.some((l) => l.slug === "variables-and-data-types"),
  );

  const offTopic = await getRelevantLessons(contentCourse.id, "Tell me about plumbing permits");
  check("clearly off-topic question is flagged out of scope", offTopic.outOfScope === true);

  console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) FAILED.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    console.error("Smoke test crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
