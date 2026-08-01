import type { Metadata } from "next";
import { CategoryNavigation } from "@/components/courses/CategoryNavigation";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Pagination } from "@/components/courses/Pagination";
import {
  courseListQuerySchema,
  normalizePageSearchParams,
  type PageSearchParams,
} from "@/lib/validation/course-query";
import { listCategories } from "@/server/categories";
import { listCourses } from "@/server/courses";

export const metadata: Metadata = {
  title: "Courses | NovaTok Courses",
  description: "Browse the NovaTok Courses catalog across 15 categories.",
};

interface CoursesPageProps {
  searchParams: Promise<PageSearchParams>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const rawParams = normalizePageSearchParams(await searchParams);
  const parsed = courseListQuerySchema.safeParse(rawParams);
  const filters = parsed.success
    ? parsed.data
    : courseListQuerySchema.parse({});

  const isDefaultView = !filters.search && !filters.category && !filters.level;

  const [categories, { courses, pagination }, featured] = await Promise.all([
    listCategories(),
    listCourses(filters),
    isDefaultView && filters.page === 1
      ? listCourses({ ...courseListQuerySchema.parse({}), featured: true, limit: 4 })
      : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          NovaTok Courses
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Practical courses across business, technology, finance, and skilled
          trades — built by NovaTok Social to help creators and professionals
          grow.
        </p>
      </div>

      <div className="mt-8">
        <CategoryNavigation categories={categories} />
      </div>

      {featured && featured.courses.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Featured courses
          </h2>
          <div className="mt-4">
            <CourseGrid courses={featured.courses} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          All courses
        </h2>
        <div className="mt-4">
          <CourseFilters
            basePath="/courses"
            categories={categories}
            defaultValues={{
              search: filters.search,
              category: filters.category,
              level: filters.level,
              minPrice: rawParams.minPrice,
              maxPrice: rawParams.maxPrice,
            }}
          />
        </div>

        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          {pagination.total} course{pagination.total === 1 ? "" : "s"} found
        </p>

        <div className="mt-4">
          <CourseGrid courses={courses} />
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          basePath="/courses"
          searchParams={rawParams}
        />
      </section>
    </main>
  );
}
