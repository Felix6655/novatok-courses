interface ProgressBarProps {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export function ProgressBar({ completedLessons, totalLessons, percentage }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
        <span>
          {completedLessons} of {totalLessons} lessons complete
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
