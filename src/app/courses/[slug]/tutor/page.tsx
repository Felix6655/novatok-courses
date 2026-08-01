import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseSyllabus } from "@/components/courses/CourseSyllabus";
import { TutorForm } from "@/components/tutor/TutorForm";
import { slugParamSchema } from "@/lib/validation/course-query";
import { getCourseModulesWithLessons } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";

interface TutorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lessonSlug?: string }>;
}

async function loadCourse(rawSlug: string) {
  const parsedSlug = slugParamSchema.safeParse(rawSlug);
  if (!parsedSlug.success) return null;
  return getCourseBySlug(parsedSlug.data);
}

export async function generateMetadata({ params }: TutorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) return { title: "Course not found | NovaTok Courses" };
  return { title: `AI Tutor · ${course.title} | NovaTok Courses` };
}

export default async function CourseTutorPage({ params, searchParams }: TutorPageProps) {
  const { slug } = await params;
  const { lessonSlug } = await searchParams;
  const course = await loadCourse(slug);

  if (!course) {
    notFound();
  }

  const syllabus = await getCourseModulesWithLessons(course.id);
  const hasContent = syllabus.some((module) => module.lessons.length > 0);

  const lessonOptions = syllabus.flatMap((module) =>
    module.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      moduleTitle: module.title,
    })),
  );

  const initialLessonSlug =
    lessonSlug && lessonOptions.some((option) => option.slug === lessonSlug) ? lessonSlug : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/courses" className="hover:underline">
          Courses
        </Link>
        {" / "}
        <Link href={`/courses/${course.slug}`} className="hover:underline">
          {course.title}
        </Link>
        {" / AI Tutor"}
      </nav>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        AI Tutor
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">
        Ask questions about <span className="font-medium">{course.title}</span>. Answers are
        grounded in this course&apos;s material — the Tutor will say so if something is outside
        what&apos;s covered here.
      </p>

      {hasContent ? (
        <>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Course content
            </p>
            <div className="mt-2">
              <CourseSyllabus modules={syllabus} tutorCourseSlug={course.slug} />
            </div>
          </div>

          <div className="mt-8">
            <TutorForm
              courseSlug={course.slug}
              lessonOptions={lessonOptions}
              initialLessonSlug={initialLessonSlug}
            />
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          The AI Tutor isn&apos;t available for this course yet — lesson content hasn&apos;t been
          added.
        </div>
      )}
    </main>
  );
}
