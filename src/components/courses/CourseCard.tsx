import Link from "next/link";
import { accentForSlug, formatLevel } from "@/lib/format";
import { PriceDisplay } from "@/components/courses/PriceDisplay";
import type { SerializedCourseWithCategory } from "@/types/course";

interface CourseCardProps {
  course: SerializedCourseWithCategory;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 transition hover:border-neutral-400 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <div
        className={`flex aspect-video items-center justify-center bg-gradient-to-br ${accentForSlug(course.slug)} text-white`}
      >
        <span className="px-4 text-center text-sm font-medium opacity-90">
          {course.category.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {course.category.name}
          </span>
          {course.featured && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Featured
            </span>
          )}
        </div>
        <h3 className="font-semibold text-neutral-900 group-hover:underline dark:text-neutral-100">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
          {course.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatLevel(course.level)}
          </span>
          <PriceDisplay
            price={course.price}
            originalPrice={course.originalPrice}
            currency={course.currency}
          />
        </div>
      </div>
    </Link>
  );
}
