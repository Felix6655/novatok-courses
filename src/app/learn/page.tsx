import type { Metadata } from "next";
import Link from "next/link";
import { ProgressBar } from "@/components/learning/ProgressBar";
import { getStudentIdentity } from "@/server/identity/dev-identity";
import { getRecentActivity, getStudentDashboard } from "@/server/learning/dashboard";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> { const locale=await getRequestLocale(); const d=getDictionary(locale); return { title:`${d.learn} | NovaTok Courses`, description:d.progress, alternates:{canonical:`/${locale}/learn`} }; }

const ACTIVITY_LABELS: Record<string, string> = {
  LESSON_STARTED: "Started",
  LESSON_COMPLETED: "Completed",
  TUTOR_QUESTION: "Asked the Tutor about",
  PRACTICE_ATTEMPT: "Practiced",
  COACH_REQUEST: "Asked the Learning Coach about",
};

export default async function LearnDashboardPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const identity = await getStudentIdentity();
  const [enrollments, recentActivity] = await Promise.all([
    getStudentDashboard(identity.studentId),
    getRecentActivity(identity.studentId),
  ]);

  const inProgress = enrollments.filter((e) => !e.progress.isComplete);
  const completed = enrollments.filter((e) => e.progress.isComplete);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        {dictionary.learn}
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">
        Your enrolled courses and progress.
      </p>

      {enrollments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            You haven&apos;t enrolled in any courses yet
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Browse the catalog and enroll in a course to start learning.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {dictionary.courses}
          </Link>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                In progress
              </h2>
              <ul className="mt-4 space-y-4">
                {inProgress.map((enrollment) => (
                  <li
                    key={enrollment.course.id}
                    className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          {enrollment.course.category.name}
                        </p>
                        <h3 className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                          {enrollment.course.title}
                        </h3>
                      </div>
                      <Link
                        href={`/learn/${enrollment.course.slug}`}
                        className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                      >
                        {dictionary.continue}
                      </Link>
                    </div>
                    <div className="mt-4 max-w-sm">
                      <ProgressBar
                        completedLessons={enrollment.progress.completedLessons}
                        totalLessons={enrollment.progress.totalLessons}
                        percentage={enrollment.progress.percentage}
                      />
                    </div>
                    {enrollment.reviewCandidateCount > 0 && (
                      <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                        {enrollment.reviewCandidateCount === 1
                          ? "1 lesson may be worth reviewing"
                          : `${enrollment.reviewCandidateCount} lessons may be worth reviewing`}
                        {" â€” ask the AI Learning Coach why."}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {recentActivity.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Recent activity
              </h2>
              <ul className="mt-4 space-y-2">
                {recentActivity.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-2.5 text-sm dark:border-neutral-800"
                  >
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {ACTIVITY_LABELS[activity.type] ?? activity.type}{" "}
                      {activity.lessonTitle ? `"${activity.lessonTitle}"` : activity.courseTitle}
                      {activity.lessonTitle && (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {" "}
                          in {activity.courseTitle}
                        </span>
                      )}
                    </span>
                    <Link
                      href={`/learn/${activity.courseSlug}`}
                      className="shrink-0 text-neutral-500 hover:underline dark:text-neutral-400"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {completed.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Completed
              </h2>
              <ul className="mt-4 space-y-2">
                {completed.map((enrollment) => (
                  <li
                    key={enrollment.course.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
                  >
                    <div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {enrollment.course.title}
                      </span>
                      <span className="ml-2 text-xs text-emerald-700 dark:text-emerald-400">
                        âœ“ Completed
                      </span>
                    </div>
                    <Link
                      href={`/learn/${enrollment.course.slug}`}
                      className="text-sm text-neutral-600 hover:underline dark:text-neutral-300"
                    >
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
