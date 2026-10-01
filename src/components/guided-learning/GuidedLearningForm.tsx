"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/client";
import type { GuidedLearningResult } from "@/server/guided-learning/guided-learning-service";
import type { GuidedLearningLevel } from "@/lib/validation/guided-learning";

type Status = "idle" | "loading" | "success" | "error";

const LEVELS: GuidedLearningLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LOADING_STAGES = [
  "Understanding your goal",
  "Building your learning path",
  "Finding verified resources",
] as const;

export function GuidedLearningForm() {
  const { locale, dictionary } = useI18n();
  const [goal, setGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState<GuidedLearningLevel>("BEGINNER");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<GuidedLearningResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    if (status !== "loading") {
      setLoadingStage(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStage((current) =>
        Math.min(current + 1, LOADING_STAGES.length - 1),
      );
    }, 1800);

    return () => window.clearInterval(interval);
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (goal.trim().length < 3) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/guided-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, currentLevel, weeklyHours, locale }),
      });
      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(body.error ?? "Could not build the learning path.");
        setStatus("error");
        return;
      }

      setResult(body as GuidedLearningResult);
      setSaveStatus("idle");
      setStatus("success");
    } catch {
      setErrorMessage(dictionary.error);
      setStatus("error");
    }
  }

  async function saveCurrentPlan() {
    if (!result) return;
    setSaveStatus("saving");

    try {
      const response = await fetch("/api/guided-learning/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          currentLevel,
          weeklyHours,
          locale,
          source: result.source,
          plan: {
            goalSummary: result.goalSummary,
            estimatedWeeks: result.estimatedWeeks,
            steps: result.steps,
            studyTips: result.studyTips,
            resourceQueries: result.resourceQueries,
          },
        }),
      });

      if (!response.ok) {
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="space-y-5 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <div>
          <label htmlFor="learning-goal" className="mb-2 block text-sm font-medium">
            What do you want to learn?
          </label>
          <textarea
            id="learning-goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Example: I want to learn machine learning from zero and build my first useful AI project."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Current level
            <select
              value={currentLevel}
              onChange={(event) => setCurrentLevel(event.target.value as GuidedLearningLevel)}
              className="mt-2 block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Hours per week
            <input
              type="number"
              min={1}
              max={40}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(Number(event.target.value))}
              className="mt-2 block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || goal.trim().length < 3}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {status === "loading" ? "Working..." : "Build my learning path"}
        </button>
      </form>

      {status === "loading" && (
        <section
          aria-live="polite"
          className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
            <div>
              <p className="font-medium">{LOADING_STAGES[loadingStage]}...</p>
              <p className="mt-1 text-sm text-neutral-500">
                NovaTok will show a fast fallback plan automatically if the AI is taking too long.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {LOADING_STAGES.map((stage, index) => (
              <div
                key={stage}
                className={`h-1 rounded-full ${
                  index <= loadingStage
                    ? "bg-neutral-700 dark:bg-neutral-300"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {status === "error" && errorMessage && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      {status === "success" && result && (
        <section className="space-y-6">
          {result.source === "fallback" && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Fast plan shown because the AI response was unavailable or too slow. Verified resources are still matched from NovaTok&apos;s provider registry.
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Estimated plan: {result.estimatedWeeks} weeks</p>
              <h2 className="mt-1 text-2xl font-semibold">{result.goalSummary}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveCurrentPlan}
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "Saved"
                    : "Save learning path"}
              </button>
              {saveStatus === "saved" && (
                <a href="/guided-learning/saved" className="text-sm underline">
                  View saved paths
                </a>
              )}
            </div>
            {saveStatus === "error" && (
              <p className="basis-full text-sm text-red-700 dark:text-red-300">
                Could not save this learning path.
              </p>
            )}
          </div>

          <ol className="space-y-4">
            {result.steps.map((step, index) => (
              <li key={`${index}-${step.title}`} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Step {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{step.outcome}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {step.topics.map((topic) => (
                    <span key={topic} className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs dark:border-neutral-700">
                      {topic}
                    </span>
                  ))}
                </div>
                {step.practice.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                    {step.practice.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>

          {result.verifiedResources.length > 0 && (
            <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
              <h3 className="font-semibold">Verified learning resources</h3>
              <p className="mt-1 text-sm text-neutral-500">
                These links come from NovaTok's verified provider registry, not from model-generated URLs.
              </p>
              <div className="mt-4 space-y-3">
                {result.verifiedResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{resource.title}</span>
                      <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs dark:border-neutral-700">
                        Verified {resource.provider}
                      </span>
                      {resource.freeAccess && (
                        <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs dark:border-neutral-700">
                          Free access
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                      {resource.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {result.resourceQueries.length > 0 && (
            <aside className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
              <h3 className="font-semibold">Resource searches</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Additional search ideas only. Verified links, when available, are shown separately above.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {result.resourceQueries.map((query) => <li key={query}>{query}</li>)}
              </ul>
            </aside>
          )}
        </section>
      )}
    </div>
  );
}
