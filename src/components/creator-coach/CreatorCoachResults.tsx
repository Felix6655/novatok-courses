"use client";
import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/courses/EmptyState";
import type { CreatorCoachResult } from "@/server/creator-coach/creator-coach-service";
import { useI18n } from "@/i18n/client";

interface CreatorCoachResultsProps {
  result: CreatorCoachResult;
}

export function CreatorCoachResults({ result }: CreatorCoachResultsProps) {
  const { dictionary } = useI18n();
  return (
    <div className="mt-8">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {dictionary.creatorCoachPrompt}
      </p>
      <p className="mt-1 text-lg text-neutral-900 dark:text-neutral-100">{result.profile.businessSummary}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{result.profile.primaryGoal}</p>

      {result.overallSummary && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{result.overallSummary}</p>
      )}

      {result.generatedBy === "fallback-sequence" && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          The AI reasoning step wasn&apos;t usable this time, so this plan is sequenced directly from the
          catalog instead.
        </p>
      )}

      <div className="mt-6">
        {result.weeks.length === 0 ? (
          <EmptyState title={dictionary.noPlan} description={dictionary.retry} />
        ) : (
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.weeks.map((week) => (
              <li key={`${week.weekNumber}-${week.course.id}`} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {dictionary.week} {week.weekNumber} — {week.focus}
                </span>
                <CourseCard course={week.course} />
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{week.summary}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
