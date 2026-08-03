"use client";

import Link from "next/link";

export default function LearnCourseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Something went wrong loading this course
      </h1>
      <p className="mt-2 max-w-md text-neutral-600 dark:text-neutral-300">
        This is likely temporary. Try again, or sign in again if the problem continues.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Try again
        </button>
        <Link
          href="/learn"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
        >
          Back to my learning
        </Link>
      </div>
    </main>
  );
}
