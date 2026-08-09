"use client";

import { useI18n } from "@/i18n/client";
import { useState, type FormEvent } from "react";
import { CreatorCoachResults } from "@/components/creator-coach/CreatorCoachResults";
import type { CreatorCoachResult } from "@/server/creator-coach/creator-coach-service";

type Status = "idle" | "loading" | "success" | "error";

const EXAMPLE_PROMPTS = [
  "I sell clothing online. I have 700 Instagram followers and 300 TikTok followers. My videos average 400 views. I want to make $2,000/month.",
  "I'm a fitness coach just starting out on Instagram and YouTube Shorts with no following yet.",
  "I do UGC content and want to land my first brand deals.",
];

export function CreatorCoachForm() {
  const { locale, dictionary } = useI18n();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<CreatorCoachResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/creator-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, locale }),
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(
          response.status === 503
            ? `${body.error ?? "The AI provider is unavailable."} Make sure Ollama is running locally.`
            : (body.error ?? "Something went wrong building a plan."),
        );
        setStatus("error");
        return;
      }

      setResult(body as CreatorCoachResult);
      setStatus("success");
    } catch {
      setErrorMessage(dictionary.error);
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="creator-coach-message" className="sr-only">
          {dictionary.creatorCoachPrompt}
        </label>
        <textarea
          id="creator-coach-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={dictionary.creatorCoachPrompt}
          rows={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={status === "loading" || !message.trim()}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {status === "loading" ? dictionary.loading : dictionary.send}
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

      {status === "success" && result && <CreatorCoachResults result={result} />}
    </div>
  );
}
