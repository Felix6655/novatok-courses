import type { Metadata } from "next";
import { LearningPathCard } from "@/components/learning-paths/LearningPathCard";
import { listLearningPaths } from "@/server/learning-paths";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const d = getDictionary(locale);
  return {
    title: `${d.learningPaths} | NovaTok Courses`,
    description: "Curated multi-course progressions for creators, from New Creator to Full-Time Creator.",
    alternates: { canonical: `/${locale}/learning-paths` },
  };
}

export default async function LearningPathsPage() {
  const d = getDictionary(await getRequestLocale());
  const paths = await listLearningPaths();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {d.learningPaths}
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
        Curated, ordered sequences of real courses — pick the path that matches where you are, instead of
        browsing an unorganized catalog.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <LearningPathCard key={path.slug} path={path} />
        ))}
      </div>
    </main>
  );
}
