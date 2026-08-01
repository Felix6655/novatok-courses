import Link from "next/link";
import type { SerializedModuleWithLessons } from "@/types/course";

interface CourseSyllabusProps {
  modules: SerializedModuleWithLessons[];
  /** When provided, lesson titles link directly into that lesson's Tutor context. */
  tutorCourseSlug?: string;
}

export function CourseSyllabus({ modules, tutorCourseSlug }: CourseSyllabusProps) {
  return (
    <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
      {modules.map((module) => (
        <li key={module.id}>
          <span className="font-medium">{module.title}:</span>{" "}
          {module.lessons.map((lesson, index) => (
            <span key={lesson.id}>
              {tutorCourseSlug ? (
                <Link
                  href={`/courses/${tutorCourseSlug}/tutor?lessonSlug=${lesson.slug}`}
                  className="underline decoration-dotted underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  {lesson.title}
                </Link>
              ) : (
                lesson.title
              )}
              {index < module.lessons.length - 1 ? ", " : ""}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
