import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryNavigation } from "@/components/courses/CategoryNavigation";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CoursesLoadingSkeleton } from "@/components/courses/CoursesLoadingSkeleton";
import { Pagination } from "@/components/courses/Pagination";
import {
  courseListQuerySchema,
  normalizePageSearchParams,
  type PageSearchParams,
} from "@/lib/validation/course-query";
import { listCategories } from "@/server/categories";
import { listCourses } from "@/server/courses";
import { getRequestLocale } from "@/i18n/request";
import type { Locale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Courses | NovaTok Courses",
  description: "Browse the NovaTok Courses catalog across 16 categories.",
};

interface CoursesPageProps {
  searchParams: Promise<PageSearchParams>;
}

/**
 * The route intentionally has no loading.tsx: a segment-level loading.tsx
 * wraps this page AND every nested route (/courses/[slug],
 * /courses/[slug]/tutor) in one Suspense boundary, which forces Next.js to
 * stream a 200 response before those nested routes' notFound() calls can
 * set a real 404 status. This component-local Suspense gives the same
 * loading UX for this page only, without affecting sibling routes.
 */
export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const rawParams = normalizePageSearchParams(await searchParams);
  const locale = await getRequestLocale();

  return (
    <Suspense fallback={<CoursesLoadingSkeleton />}>
      <CoursesContent rawParams={rawParams} locale={locale} />
    </Suspense>
  );
}

async function CoursesContent({ rawParams, locale }: { rawParams: Record<string, string>; locale: Locale }) {
  const parsed = courseListQuerySchema.safeParse(rawParams);
  const filters = parsed.success ? parsed.data : courseListQuerySchema.parse({});

  const isDefaultView = !filters.search && !filters.category && !filters.level;

  const [categories, { courses, pagination }, featured] = await Promise.all([
    listCategories(),
    listCourses(filters, locale, { includeDrafts: process.env.NODE_ENV !== "production" && rawParams.translationPreview === "1" }),
    isDefaultView && filters.page === 1
      ? listCourses({ ...courseListQuerySchema.parse({}), featured: true, limit: 4 }, locale, { includeDrafts: process.env.NODE_ENV !== "production" && rawParams.translationPreview === "1" })
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
          trades â€” built by NovaTok Social to help creators and professionals
          grow.
        </p>
      </div>

      {process.env.NODE_ENV !== "production" && rawParams.translationPreview === "1" && (
        <aside className="mt-4 rounded-md border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">
          Translation preview ({locale}): this page labels requested translations versus English/canonical fallback. Draft content remains review-only.
          <ul className="mt-1 list-disc pl-5">
            {courses.map((course) => { const state = (course as typeof course & { _localization?: { source: string; status: string | null } })._localization; return <li key={course.id}>{course.slug}: {state?.source ?? "canonical"}{state?.status ? ` (${state.status})` : ""}</li>; })}
          </ul>
        </aside>
      )}
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
