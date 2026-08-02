"use client";

import { useI18n } from "@/i18n/client";
import { useState, type FormEvent } from "react";
import { TutorAnswer } from "@/components/tutor/TutorAnswer";
import { MAX_HISTORY_TURNS, type TutorHistoryTurn, type TutorResponseMode } from "@/lib/validation/tutor";
import type { TutorResult } from "@/server/tutor/tutor-service";

interface LessonOption {
  slug: string;
  title: string;
  moduleTitle: string;
}

interface TutorFormProps {
  courseSlug: string;
  lessonOptions: LessonOption[];
  initialLessonSlug: string | null;
}

interface Turn {
  question: string;
  result: TutorResult;
}

type Status = "idle" | "loading" | "error";

interface QuickAction {
  label: string;
  responseMode: TutorResponseMode;
  /** Used to prefill the box when there's no conversation yet to follow up on. */
  starterQuestion: string;
  /** Used to submit immediately as a follow-up once a conversation exists. */
  followUpQuestion: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Explain simpler",
    responseMode: "SIMPLE",
    starterQuestion: "Explain the main idea of this course in simple terms.",
    followUpQuestion: "Can you explain that more simply?",
  },
  {
    label: "Give example",
    responseMode: "EXAMPLE",
    starterQuestion: "Give me an example.",
    followUpQuestion: "Can you give me another example?",
  },
  {
    label: "Quiz me",
    responseMode: "PRACTICE",
    starterQuestion: "Quiz me on this course so far.",
    followUpQuestion: "Quiz me on that.",
  },
  {
    label: "What next?",
    responseMode: "NORMAL",
    starterQuestion: "What should I study next in this course?",
    followUpQuestion: "What should I learn next?",
  },
];

export function TutorForm({ courseSlug, lessonOptions, initialLessonSlug }: TutorFormProps) {
  const { locale, dictionary } = useI18n();
  const [lessonSlug, setLessonSlug] = useState<string | null>(initialLessonSlug);
  const [question, setQuestion] = useState("");
  const [responseMode, setResponseMode] = useState<TutorResponseMode>("NORMAL");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function buildHistory(): TutorHistoryTurn[] {
    const flat: TutorHistoryTurn[] = turns.flatMap((turn) => [
      { role: "user" as const, content: turn.question },
      { role: "assistant" as const, content: turn.result.answer },
    ]);
    // The server enforces this bound too; trimming client-side avoids an
    // avoidable 400 once a session runs long.
    return flat.slice(-MAX_HISTORY_TURNS);
  }

  async function submitQuestion(rawQuestion: string, mode: TutorResponseMode) {
    if (!rawQuestion.trim()) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          question: rawQuestion,
          responseMode: mode,
          lessonSlug: lessonSlug ?? undefined,
          history: buildHistory(),
          locale,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        const message =
          response.status === 503
            ? `${body.error ?? "The AI provider is unavailable."} Make sure Ollama is running locally.`
            : response.status === 429
              ? (body.error ?? "Too many requests â€” please wait a moment and try again.")
              : (body.error ?? "Something went wrong answering your question.");
        setErrorMessage(message);
        setStatus("error");
        return;
      }

      setTurns((prev) => [...prev, { question: rawQuestion, result: body as TutorResult }]);
      setQuestion("");
      setStatus("idle");
    } catch {
      setErrorMessage(dictionary.error);
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(question, responseMode);
  }

  function handleQuickAction(action: QuickAction) {
    setResponseMode(action.responseMode);
    if (turns.length === 0) {
      setQuestion((current) => (current.trim() ? current : action.starterQuestion));
      return;
    }
    void submitQuestion(action.followUpQuestion, action.responseMode);
  }

  const isLoading = status === "loading";

  return (
    <div>
      {lessonOptions.length > 0 && (
        <div className="mb-3">
          <label
            htmlFor="tutor-lesson"
            className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
          >
            {dictionary.question}
          </label>
          <select
            id="tutor-lesson"
            value={lessonSlug ?? ""}
            onChange={(event) => setLessonSlug(event.target.value || null)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">{dictionary.generalQuestion}</option>
            {lessonOptions.map((lesson) => (
              <option key={lesson.slug} value={lesson.slug}>
                {lesson.moduleTitle} â€” {lesson.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="tutor-question" className="sr-only">
          {dictionary.askTutor}
        </label>
        <textarea
          id="tutor-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={dictionary.question}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {isLoading ? dictionary.loading : dictionary.send}
          </button>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickAction(action)}
              className={`rounded-full border px-3 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

      {turns.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {turns.map((turn, index) => (
            <div key={index}>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                You asked: {turn.question}
              </p>
              <TutorAnswer result={turn.result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
