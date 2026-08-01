"use client";

import { useState, type FormEvent } from "react";
import { TutorAnswer } from "@/components/tutor/TutorAnswer";
import type { TutorResponseMode } from "@/lib/validation/tutor";
import type { TutorResult } from "@/server/tutor/tutor-service";

type Status = "idle" | "loading" | "success" | "error";

interface QuickAction {
  label: string;
  responseMode: TutorResponseMode;
  defaultQuestion: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Explain simpler", responseMode: "SIMPLE", defaultQuestion: "Explain the main idea of this course in simple terms." },
  { label: "Give example", responseMode: "EXAMPLE", defaultQuestion: "Give me an example." },
  { label: "Practice me", responseMode: "PRACTICE", defaultQuestion: "Quiz me on this course so far." },
  { label: "What next?", responseMode: "NORMAL", defaultQuestion: "What should I study next in this course?" },
];

interface TutorFormProps {
  courseSlug: string;
}

export function TutorForm({ courseSlug }: TutorFormProps) {
  const [question, setQuestion] = useState("");
  const [responseMode, setResponseMode] = useState<TutorResponseMode>("NORMAL");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TutorResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function applyQuickAction(action: QuickAction) {
    setResponseMode(action.responseMode);
    setQuestion((current) => (current.trim() ? current : action.defaultQuestion));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, question, responseMode }),
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(
          response.status === 503
            ? `${body.error ?? "The AI provider is unavailable."} Make sure Ollama is running locally.`
            : (body.error ?? "Something went wrong answering your question."),
        );
        setStatus("error");
        return;
      }

      setResult(body as TutorResult);
      setStatus("success");
    } catch {
      setErrorMessage("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="tutor-question" className="sr-only">
          Ask a question about this course
        </label>
        <textarea
          id="tutor-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Explain variables in simpler terms."
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={status === "loading" || !question.trim()}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {status === "loading" ? "Thinking..." : "Ask"}
          </button>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => applyQuickAction(action)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                responseMode === action.responseMode
                  ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </form>

      {status === "error" && errorMessage && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      {status === "success" && result && <TutorAnswer result={result} />}
    </div>
  );
}
