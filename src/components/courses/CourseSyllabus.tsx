import type { SerializedModuleWithLessons } from "@/types/course";

interface CourseSyllabusProps {
  modules: SerializedModuleWithLessons[];
}

export function CourseSyllabus({ modules }: CourseSyllabusProps) {
  return (
    <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
      {modules.map((module) => (
        <li key={module.id}>
          <span className="font-medium">{module.title}:</span>{" "}
          {module.lessons.map((lesson) => lesson.title).join(", ")}
        </li>
      ))}
    </ul>
  );
}
