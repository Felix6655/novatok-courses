"use client";

import { useState, type FormEvent } from "react";
import { CourseAdvisorResults } from "@/components/advisor/CourseAdvisorResults";
import type { CourseAdvisorResult } from "@/server/advisor/advisor-service";

type Status = "idle" | "loading" | "success" | "error";

const EXAMPLE_PROMPTS = [
  "I have never coded before and want to learn Python so I can build AI tools.",
  "I want to learn cybersecurity. I only have about 5 hours a week.",
  "I want to learn AI so I can automate parts of my business.",
];

export function CourseAdvisorForm() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CourseAdvisorResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/course-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(
          response.status === 503
            ? `${body.error ?? "The AI provider is unavailable."} Make sure Ollama is running locally.`
            : (body.error ?? "Something went wrong generating a recommendation."),
        );
        setStatus("error");
        return;
      }

      setResult(body as CourseAdvisorResult);
      setStatus("success");
    } catch {
      setErrorMessage("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="advisor-message" className="sr-only">
          Describe your learning goal
        </label>
        <textarea
          id="advisor-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="e.g. I have never coded before and want to learn Python so I can build AI tools."
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={status === "loading" || !message.trim()}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {status === "loading" ? "Thinking..." : "Get recommendations"}
          </button>
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
            >
              {example.length > 40 ? `${example.slice(0, 40)}…` : example}
            </button>
          ))}
        </div>
      </form>

      {status === "error" && errorMessage && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      {status === "success" && result && <CourseAdvisorResults result={result} />}
    </div>
  );
}
