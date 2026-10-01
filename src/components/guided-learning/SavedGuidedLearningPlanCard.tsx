"use client";

import { useState } from "react";
import type { SavedGuidedLearningPlan } from "@/server/guided-learning/saved-plan-service";

export function SavedGuidedLearningPlanCard({
  initialPlan,
}: {
  initialPlan: SavedGuidedLearningPlan;
}) {
  const [completed, setCompleted] = useState<number[]>(initialPlan.completedStepIndexes);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  async function toggleStep(stepIndex: number) {
    const shouldComplete = !completed.includes(stepIndex);
    setPendingStep(stepIndex);

    const response = await fetch(
      `/api/guided-learning/plans/${initialPlan.id}/progress`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIndex, completed: shouldComplete }),
      },
    );

    if (response.ok) {
      const updated = (await response.json()) as SavedGuidedLearningPlan;
      setCompleted(updated.completedStepIndexes);
    }

    setPendingStep(null);
  }

  const percentage =
    initialPlan.plan.steps.length === 0
      ? 0
      : Math.round((completed.length / initialPlan.plan.steps.length) * 100);

  return (
    <article className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {initialPlan.currentLevel} · {initialPlan.weeklyHours} hours/week
          </p>
          <h2 className="mt-1 text-xl font-semibold">{initialPlan.plan.goalSummary}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {completed.length}/{initialPlan.plan.steps.length} steps complete · {percentage}%
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {initialPlan.plan.steps.map((step, index) => {
          const isComplete = completed.includes(index);
          return (
            <li
              key={`${initialPlan.id}-${index}`}
              className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-start gap-3">
                <input
                  aria-label={`Mark step ${index + 1} complete`}
                  type="checkbox"
                  checked={isComplete}
                  disabled={pendingStep === index}
                  onChange={() => toggleStep(index)}
                  className="mt-1"
                />
                <div>
                  <p className="text-xs text-neutral-500">Step {index + 1}</p>
                  <h3 className={`font-medium ${isComplete ? "line-through opacity-60" : ""}`}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                    {step.outcome}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {initialPlan.verifiedResources.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-medium">Verified resources</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {initialPlan.verifiedResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:border-neutral-500 dark:border-neutral-700"
              >
                {resource.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
