import type { Metadata } from "next";
import { CreatorCoachForm } from "@/components/creator-coach/CreatorCoachForm";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const d = getDictionary(locale);
  return {
    title: `${d.creatorCoach} | NovaTok Courses`,
    description: d.creatorCoachPrompt,
    alternates: { canonical: `/${locale}/courses/creator-coach` },
  };
}

export default async function CreatorCoachPage() {
  const d = getDictionary(await getRequestLocale());
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {d.creatorCoach}
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
        Describe your business, the platforms you use, your rough audience size, and what you want to
        achieve. You&apos;ll get a real, week-by-week plan built from the NovaTok Courses catalog — never a
        guaranteed income or follower promise.
      </p>
      <div className="mt-8">
        <CreatorCoachForm />
      </div>
    </main>
  );
}
