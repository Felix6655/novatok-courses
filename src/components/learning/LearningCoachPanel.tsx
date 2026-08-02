"use client";

import { useI18n } from "@/i18n/client";
import { useState } from "react";

interface LearningCoachLessonRef {
  slug: string;
  title: string;
  moduleTitle: string;
}

interface LearningCoachCourseRef {
  slug: string;
  title: string;
}

interface ReviewCandidate {
  lessonSlug: string;
  lessonTitle: string;
  reason: string;
}

interface LearningCoachResult {
  isCourseComplete: boolean;
  nextLesson: LearningCoachLessonRef | null;
  explanation: string;
  studyTips: string[];
  practiceSuggestion: string | null;
  suggestedCourses: LearningCoachCourseRef[];
  reviewCandidates: ReviewCandidate[];
  answerSource: "ai" | "fallback";
}

interface LearningCoachPanelProps {
  courseSlug: string;
}

type Status = "idle" | "loading" | "error";

export function LearningCoachPanel({ courseSlug }: LearningCoachPanelProps) {
  const { locale, dictionary } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<LearningCoachResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAsk() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/ai/learning-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, locale }),
      });
      const body = await response.json();
      if (!response.ok) {
        setErrorMessage(
          response.status === 503
            ? `${body.error ?? "The AI provider is unavailable."} Make sure Ollama is running locally.`
            : (body.error ?? "Something went wrong."),
        );
        setStatus("error");
        return;
      }
      setResult(body as LearningCoachResult);
      setStatus("idle");
    } catch {
      setErrorMessage(dictionary.error);
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {dictionary.coach}
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Grounded in your actual progress in this course.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAsk}
          disabled={status === "loading"}
          className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {status === "loading" ? dictionary.loading : dictionary.next}
        </button>
      </div>

      {status === "error" && errorMessage && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      {result && (
        <div className="mt-4">
          {result.nextLesson && (
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {dictionary.next}: {result.nextLesson.title} ({result.nextLesson.moduleTitle})
            </p>
          )}
          <p className="mt-2 whitespace-pre-line text-neutral-800 dark:text-neutral-200">
            {result.explanation}
          </p>
          {result.studyTips.length > 0 && (
            <ul className="mt-3 list-inside list-disc text-sm text-neutral-700 dark:text-neutral-300">
              {result.studyTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          )}
          {result.practiceSuggestion && (
            <p className="mt-3 text-sm text-neutral-600 italic dark:text-neutral-300">
              {result.practiceSuggestion}
            </p>
          )}
          {result.reviewCandidates.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                May be worth reviewing
              </p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                {result.reviewCandidates.map((candidate) => (
                  <li key={candidate.lessonSlug}>
                    <span className="font-medium">{candidate.lessonTitle}</span> â€” {candidate.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestedCourses.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                You might also like
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.suggestedCourses.map((course) => (
                  <li key={course.slug}>
                    <a
                      href={`/courses/${course.slug}`}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      {course.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
