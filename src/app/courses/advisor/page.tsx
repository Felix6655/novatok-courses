import type { Metadata } from "next";
import { CourseAdvisorForm } from "@/components/advisor/CourseAdvisorForm";

export const metadata: Metadata = {
  title: "Course Advisor | NovaTok Courses",
  description: "Describe your learning goal and get course recommendations grounded in the NovaTok Courses catalog.",
};

export default function CourseAdvisorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Course Advisor
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
        Tell us what you want to learn — your current level, your goal, how much time you have — and
        we&apos;ll suggest real courses from the NovaTok Courses catalog and explain why they fit.
      </p>

      <div className="mt-8">
        <CourseAdvisorForm />
      </div>
    </main>
  );
}
