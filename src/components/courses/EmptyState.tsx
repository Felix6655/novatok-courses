interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  );
}
