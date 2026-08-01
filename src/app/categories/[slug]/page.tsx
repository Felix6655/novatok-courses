import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Pagination } from "@/components/courses/Pagination";
import {
  courseListQuerySchema,
  normalizePageSearchParams,
  slugParamSchema,
  type PageSearchParams,
} from "@/lib/validation/course-query";
import { getCategoryBySlug } from "@/server/categories";
import { listCourses } from "@/server/courses";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<PageSearchParams>;
}

async function loadCategory(rawSlug: string) {
  const parsedSlug = slugParamSchema.safeParse(rawSlug);
  if (!parsedSlug.success) return null;
  return getCategoryBySlug(parsedSlug.data);
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return { title: "Category not found | NovaTok Courses" };
  return {
    title: `${category.name} Courses | NovaTok Courses`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await loadCategory(slug);

  if (!category) {
    notFound();
  }

  const rawParams = normalizePageSearchParams(await searchParams);
  const parsed = courseListQuerySchema.safeParse({ ...rawParams, category: category.slug });
  const filters = parsed.success
    ? parsed.data
    : courseListQuerySchema.parse({ category: category.slug });

  const { courses, pagination } = await listCourses(filters);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Category
        </span>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {category.name}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">{category.description}</p>
      </div>

      <div className="mt-8">
        <CourseFilters
          basePath={`/categories/${category.slug}`}
          defaultValues={{
            search: filters.search,
            level: filters.level,
            minPrice: rawParams.minPrice,
            maxPrice: rawParams.maxPrice,
          }}
        />
      </div>

      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        {pagination.total} course{pagination.total === 1 ? "" : "s"} in {category.name}
      </p>

      <div className="mt-4">
        <CourseGrid
          courses={courses}
          emptyTitle="No courses in this category yet"
          emptyDescription="Try adjusting your search or filters, or check back soon."
        />
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        basePath={`/categories/${category.slug}`}
        searchParams={rawParams}
      />
    </main>
  );
}
