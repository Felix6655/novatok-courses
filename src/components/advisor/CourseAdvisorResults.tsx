import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/courses/EmptyState";
import type { CourseAdvisorResult } from "@/server/advisor/advisor-service";

interface CourseAdvisorResultsProps {
  result: CourseAdvisorResult;
}

export function CourseAdvisorResults({ result }: CourseAdvisorResultsProps) {
  return (
    <div className="mt-8">
      <p className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Interpreted goal
      </p>
      <p className="mt-1 text-lg text-neutral-900 dark:text-neutral-100">{result.interpretedGoal}</p>

      {result.pathSummary && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{result.pathSummary}</p>
      )}

      {result.generatedBy === "fallback-ranking" && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          The AI reasoning step wasn&apos;t usable this time, so these are ranked directly from the
          catalog instead.
        </p>
      )}

      <div className="mt-6">
        {result.recommendations.length === 0 ? (
          <EmptyState
            title="No matching courses found"
            description="Try describing your goal differently, or broaden the topics you mention."
          />
        ) : (
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.recommendations.map((recommendation) => (
              <li key={recommendation.course.id} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Step {recommendation.order}
                </span>
                <CourseCard course={recommendation.course} />
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{recommendation.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
