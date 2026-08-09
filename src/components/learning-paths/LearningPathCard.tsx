import Link from "next/link";
import type { LearningPathSummary } from "@/server/learning-paths";

interface LearningPathCardProps {
  path: LearningPathSummary;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <Link
      href={`/learning-paths/${path.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <h3 className="font-semibold text-neutral-900 group-hover:underline dark:text-neutral-100">
        {path.title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">{path.description}</p>
      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{path.targetAudience}</span>
        <span>
          {path.courseCount} course{path.courseCount === 1 ? "" : "s"} · ~{path.estimatedWeeks} weeks
        </span>
      </div>
    </Link>
  );
}
