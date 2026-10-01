import type { Metadata } from "next";
import Link from "next/link";
import { SavedGuidedLearningPlanCard } from "@/components/guided-learning/SavedGuidedLearningPlanCard";
import { requireBrowserStudentIdentity } from "@/server/identity/browser-identity";
import { listGuidedLearningPlans } from "@/server/guided-learning/saved-plan-service";

export const metadata: Metadata = {
  title: "Saved Learning Paths | NovaTok Courses",
  description: "Continue your saved Guided Learning paths.",
};

export default async function SavedGuidedLearningPage() {
  const identity = await requireBrowserStudentIdentity("/guided-learning/saved");
  const plans = await listGuidedLearningPlans(identity.studentId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">NovaTok AI Tutor</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved learning paths</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Continue a personalized path and track each completed step.
          </p>
        </div>
        <Link href="/guided-learning" className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">
          Create another path
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
          <p className="text-neutral-600 dark:text-neutral-300">No saved learning paths yet.</p>
          <Link href="/guided-learning" className="mt-4 inline-block text-sm underline">
            Build your first path
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {plans.map((plan) => (
            <SavedGuidedLearningPlanCard key={plan.id} initialPlan={plan} />
          ))}
        </div>
      )}
    </main>
  );
}
