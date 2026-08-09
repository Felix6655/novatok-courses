import Link from "next/link";

export default function LearningPathNotFound() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Learning path not found
      </h1>
      <p className="mt-2 max-w-md text-neutral-600 dark:text-neutral-300">
        This learning path may have been renamed or the link may be incorrect.
      </p>
      <Link
        href="/learning-paths"
        className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Browse all learning paths
      </Link>
    </main>
  );
}
