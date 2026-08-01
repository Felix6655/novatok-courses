import Link from "next/link";
import type { SerializedCategory } from "@/types/course";

interface CategoryNavigationProps {
  categories: SerializedCategory[];
  activeSlug?: string;
}

export function CategoryNavigation({ categories, activeSlug }: CategoryNavigationProps) {
  return (
    <nav aria-label="Course categories" className="-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1">
      <Link
        href="/courses"
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
          !activeSlug
            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
            : "border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
        }`}
      >
        All categories
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
            activeSlug === category.slug
              ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
              : "border-neutral-300 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
