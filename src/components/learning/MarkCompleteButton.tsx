"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/client";

interface MarkCompleteButtonProps {
  courseSlug: string;
  lessonSlug: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({ courseSlug, lessonSlug, isCompleted }: MarkCompleteButtonProps) {
  const { dictionary } = useI18n();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrorMessage(body.error ?? "Could not update progress. Please try again.");
        setIsSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setErrorMessage(dictionary.error);
      setIsSubmitting(false);
    }
  }

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <span aria-hidden>âœ“</span> Completed
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {isSubmitting ? dictionary.loading : dictionary.complete}
      </button>
      {errorMessage && <p className="mt-2 text-sm text-red-700 dark:text-red-400">{errorMessage}</p>}
    </div>
  );
}
