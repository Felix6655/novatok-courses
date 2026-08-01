import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/courses/EmptyState";
import type { SerializedCourseWithCategory } from "@/types/course";

interface CourseGridProps {
  courses: SerializedCourseWithCategory[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CourseGrid({
  courses,
  emptyTitle = "No courses found",
  emptyDescription = "Try adjusting your search or filters to see more results.",
}: CourseGridProps) {
  if (courses.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
