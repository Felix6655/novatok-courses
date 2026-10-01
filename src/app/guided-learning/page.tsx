import type { Metadata } from "next";
import { GuidedLearningForm } from "@/components/guided-learning/GuidedLearningForm";

export const metadata: Metadata = {
  title: "Guided Learning | NovaTok Courses",
  description: "Build a personalized learning path from any learning goal.",
};

export default function GuidedLearningPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-neutral-500">NovaTok AI Tutor</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Guided Learning
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
        Tell NovaTok what you want to learn, your current level, and how much time you have.
        The tutor will build a structured path from foundations to practical work.
      </p>
      <div className="mt-8">
        <GuidedLearningForm />
      </div>
    </main>
  );
}
