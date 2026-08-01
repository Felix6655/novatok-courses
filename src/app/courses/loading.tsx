export default function CoursesLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-9 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-28 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </main>
  );
}
