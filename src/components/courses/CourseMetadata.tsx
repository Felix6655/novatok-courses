import { formatDuration, formatLevel } from "@/lib/format";

interface CourseMetadataProps {
  level: string;
  durationMinutes: number;
  lessonCount: number;
  language: string;
  certificateAvailable: boolean;
}

export function CourseMetadata({
  level,
  durationMinutes,
  lessonCount,
  language,
  certificateAvailable,
}: CourseMetadataProps) {
  const items = [
    formatLevel(level),
    formatDuration(durationMinutes),
    `${lessonCount} lesson${lessonCount === 1 ? "" : "s"}`,
    language.toUpperCase(),
    certificateAvailable ? "Certificate available" : "No certificate",
  ];

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
          {item}
        </li>
      ))}
    </ul>
  );
}
