import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { getLearningPathBySlug } from "@/server/learning-paths";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/dictionaries";

interface LearningPathPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LearningPathPageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);
  const locale = await getRequestLocale();
  if (!path) return { title: "Learning path not found | NovaTok Courses" };
  return {
    title: `${path.title} | NovaTok Courses`,
    description: path.description,
    alternates: { canonical: `/${locale}/learning-paths/${path.slug}` },
  };
}

export default async function LearningPathPage({ params }: LearningPathPageProps) {
  const { slug } = await params;
  const d = getDictionary(await getRequestLocale());
  const path = await getLearningPathBySlug(slug);

  if (!path) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/learning-paths" className="hover:underline">
          {d.learningPaths}
        </Link>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {path.title}
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">{path.description}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <span>{path.targetAudience}</span>
        <span>~{path.estimatedWeeks} weeks</span>
        <span>
          {path.courses.length} course{path.courses.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-8">
        {path.courses.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            This path&apos;s courses aren&apos;t available right now.
          </p>
        ) : (
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {path.courses.map((course, index) => (
              <li key={course.id} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Step {index + 1}
                </span>
                <CourseCard course={course} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
