import type { TutorResult } from "@/server/tutor/tutor-service";

interface TutorAnswerProps {
  result: TutorResult;
}

export function TutorAnswer({ result }: TutorAnswerProps) {
  return (
    <div className="mt-6 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <p className="whitespace-pre-line text-neutral-800 dark:text-neutral-200">{result.answer}</p>

      {result.practiceQuestion && (
        <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {result.practiceQuestion.question}
          </p>
          {result.practiceQuestion.choices && result.practiceQuestion.choices.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-neutral-700 dark:text-neutral-300">
              {result.practiceQuestion.choices.map((choice) => (
                <li key={choice}>{choice}</li>
              ))}
            </ul>
          )}
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400">
              Show answer
            </summary>
            <p className="mt-2 text-neutral-800 dark:text-neutral-200">
              <span className="font-medium">Answer: </span>
              {result.practiceQuestion.answer}
            </p>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {result.practiceQuestion.explanation}
            </p>
          </details>
        </div>
      )}

      {result.relevantLessons.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Based on
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {result.relevantLessons.map((lesson) => (
              <li
                key={lesson.slug}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
                title={lesson.moduleTitle}
              >
                {lesson.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!result.grounded && !result.outOfScope && (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          This answer draws on general knowledge beyond this course&apos;s current lesson material.
        </p>
      )}
    </div>
  );
}
