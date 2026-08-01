import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseActions } from "@/components/courses/CourseActions";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseMetadata } from "@/components/courses/CourseMetadata";
import { PriceDisplay } from "@/components/courses/PriceDisplay";
import { slugParamSchema } from "@/lib/validation/course-query";
import { getCourseBySlug, getRelatedCourses } from "@/server/courses";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function loadCourse(rawSlug: string) {
  const parsedSlug = slugParamSchema.safeParse(rawSlug);
  if (!parsedSlug.success) return null;
  return getCourseBySlug(parsedSlug.data);
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) return { title: "Course not found | NovaTok Courses" };
  return {
    title: `${course.title} | NovaTok Courses`,
    description: course.shortDescription,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await loadCourse(slug);

  if (!course) {
    notFound();
  }

  const relatedCourses = await getRelatedCourses(course);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        {" / "}
        <Link href={`/categories/${course.category.slug}`} className="hover:underline">
          {course.category.name}
        </Link>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {course.category.name}
        </span>
        {course.featured && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Featured
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {course.title}
      </h1>
      <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-300">
        {course.shortDescription}
      </p>

      <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
        Taught by <span className="font-medium">{course.instructorName}</span>
      </div>

      <div className="mt-6">
        <CourseMetadata
          level={course.level}
          durationMinutes={course.durationMinutes}
          lessonCount={course.lessonCount}
          language={course.language}
          certificateAvailable={course.certificateAvailable}
        />
      </div>

      <div className="mt-6 flex aspect-video items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-600">
        Promo media placeholder
      </div>

      <div className="mt-6">
        <PriceDisplay
          price={course.price}
          originalPrice={course.originalPrice}
          currency={course.currency}
          size="lg"
        />
      </div>

      <div className="mt-6">
        <CourseActions title={course.title} enrollmentUrl={course.enrollmentUrl} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          About this course
        </h2>
        <p className="mt-3 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
          {course.fullDescription}
        </p>
      </section>

      {course.learningOutcomes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            What you&apos;ll learn
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {course.learningOutcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span aria-hidden>✓</span>
                {outcome}
              </li>
            ))}
          </ul>
        </section>
      )}

      {course.prerequisites.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Prerequisites
          </h2>
          <ul className="mt-3 list-inside list-disc text-sm text-neutral-700 dark:text-neutral-300">
            {course.prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          About the instructor
        </h2>
        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
          {course.instructorBio}
        </p>
      </section>

      {relatedCourses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Related courses
          </h2>
          <div className="mt-4">
            <CourseGrid courses={relatedCourses} />
          </div>
        </section>
      )}
    </main>
  );
}
