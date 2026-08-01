import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/learning/EnrollButton";
import { LearningCoachPanel } from "@/components/learning/LearningCoachPanel";
import { LearningSyllabus } from "@/components/learning/LearningSyllabus";
import { MarkCompleteButton } from "@/components/learning/MarkCompleteButton";
import { ProgressBar } from "@/components/learning/ProgressBar";
import { slugParamSchema } from "@/lib/validation/course-query";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import { EnrollmentCourseNotFoundError, LearningLessonNotFoundError } from "@/server/learning/errors";
import { getLearningState } from "@/server/learning/learning-state";

interface LearnCoursePageProps {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ lessonSlug?: string }>;
}

export async function generateMetadata({ params }: LearnCoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const parsedSlug = slugParamSchema.safeParse(courseSlug);
  if (!parsedSlug.success) return { title: "Course not found | NovaTok Courses" };

  try {
    const identity = await getStudentIdentity();
    const state = await getLearningState(identity.studentId, parsedSlug.data);
    return { title: `Learn · ${state.course.title} | NovaTok Courses` };
  } catch {
    return { title: "Course not found | NovaTok Courses" };
  }
}

export default async function LearnCoursePage({ params, searchParams }: LearnCoursePageProps) {
  const { courseSlug } = await params;
  const { lessonSlug } = await searchParams;

  const parsedSlug = slugParamSchema.safeParse(courseSlug);
  if (!parsedSlug.success) {
    notFound();
  }
  const parsedLessonSlug = lessonSlug ? slugParamSchema.safeParse(lessonSlug) : undefined;

  const identity = await getStudentIdentity();

  let state;
  try {
    state = await getLearningState(
      identity.studentId,
      parsedSlug.data,
      parsedLessonSlug?.success ? parsedLessonSlug.data : undefined,
    );
  } catch (error) {
    if (error instanceof EnrollmentCourseNotFoundError || error instanceof LearningLessonNotFoundError) {
      notFound();
    }
    throw error;
  }

  if (state.status === "not-enrolled") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {state.course.title}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Enroll to start learning — it&apos;s free for now.
        </p>
        <div className="mt-6">
          <EnrollButton courseSlug={state.course.slug} />
        </div>
        <Link href={`/courses/${state.course.slug}`} className="mt-4 text-sm text-neutral-500 hover:underline">
          View course details
        </Link>
      </main>
    );
  }

  if (state.status === "empty") {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {state.course.title}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          This course doesn&apos;t have lesson content available to learn from yet.
        </p>
      </main>
    );
  }

  const { course, syllabus, currentLesson, progress } = state;
  const flatLessons = syllabus.flatMap((module) => module.lessons);
  const currentIndex = flatLessons.findIndex((lesson) => lesson.slug === currentLesson.slug);
  const previousLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const isCurrentLessonComplete = progress.completedLessonSlugs.includes(currentLesson.slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/learn" className="hover:underline">
          My learning
        </Link>
        {" / "}
        <Link href={`/courses/${course.slug}`} className="hover:underline">
          {course.title}
        </Link>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {course.title}
      </h1>

      <div className="mt-4 max-w-md">
        <ProgressBar
          completedLessons={progress.completedLessons}
          totalLessons={progress.totalLessons}
          percentage={progress.percentage}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <LearningSyllabus
            courseSlug={course.slug}
            modules={syllabus}
            currentLessonSlug={currentLesson.slug}
            completedLessonSlugs={progress.completedLessonSlugs}
          />
        </aside>

        <div>
          {progress.isComplete && (
            <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              You&apos;ve completed every lesson in this course. 🎉 Feel free to review any lesson
              from the syllabus, or ask the AI Learning Coach what to explore next.
            </div>
          )}

          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Current lesson
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {currentLesson.title}
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">{currentLesson.summary}</p>

          <div className="mt-6 whitespace-pre-line text-neutral-800 dark:text-neutral-200">
            {currentLesson.content}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MarkCompleteButton
              courseSlug={course.slug}
              lessonSlug={currentLesson.slug}
              isCompleted={isCurrentLessonComplete}
            />
            <Link
              href={`/courses/${course.slug}/tutor?lessonSlug=${currentLesson.slug}`}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
            >
              Ask AI Tutor about this lesson
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
            {previousLesson ? (
              <Link
                href={`/learn/${course.slug}?lessonSlug=${previousLesson.slug}`}
                className="text-sm text-neutral-600 hover:underline dark:text-neutral-300"
              >
                ← {previousLesson.title}
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link
                href={`/learn/${course.slug}?lessonSlug=${nextLesson.slug}`}
                className="text-sm text-neutral-600 hover:underline dark:text-neutral-300"
              >
                {nextLesson.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="mt-10">
            <LearningCoachPanel courseSlug={course.slug} />
          </div>
        </div>
      </div>
    </main>
  );
}
