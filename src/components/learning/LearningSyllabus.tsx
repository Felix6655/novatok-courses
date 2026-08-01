import Link from "next/link";
import type { SerializedModuleWithLessons } from "@/types/course";

interface LearningSyllabusProps {
  courseSlug: string;
  modules: SerializedModuleWithLessons[];
  currentLessonSlug: string;
  completedLessonSlugs: string[];
}

export function LearningSyllabus({
  courseSlug,
  modules,
  currentLessonSlug,
  completedLessonSlugs,
}: LearningSyllabusProps) {
  const completed = new Set(completedLessonSlugs);

  return (
    <nav aria-label="Course syllabus" className="space-y-4">
      {modules.map((module) => (
        <div key={module.id}>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {module.title}
          </p>
          <ul className="mt-1.5 space-y-1">
            {module.lessons.map((lesson) => {
              const isCurrent = lesson.slug === currentLessonSlug;
              const isDone = completed.has(lesson.slug);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${courseSlug}?lessonSlug=${lesson.slug}`}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                      isCurrent
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span aria-hidden className="w-4 shrink-0 text-center">
                      {isDone ? "✓" : ""}
                    </span>
                    {lesson.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
