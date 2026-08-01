import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, targetPage: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(targetPage));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({ page, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 pt-4">
      {hasPrev ? (
        <Link
          href={buildHref(basePath, searchParams, page - 1)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-300 dark:border-neutral-800 dark:text-neutral-700">
          Previous
        </span>
      )}
      <span className="text-sm text-neutral-600 dark:text-neutral-400">
        Page {page} of {totalPages}
      </span>
      {hasNext ? (
        <Link
          href={buildHref(basePath, searchParams, page + 1)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-300 dark:border-neutral-800 dark:text-neutral-700">
          Next
        </span>
      )}
    </nav>
  );
}
