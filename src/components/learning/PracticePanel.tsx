"use client";

import { useState } from "react";

type QuestionType = "MULTIPLE_CHOICE" | "SHORT_ANSWER";

interface GeneratedPractice {
  practiceId: string;
  questionType: QuestionType;
  question: string;
  choices: string[] | null;
}

interface PracticeAttemptResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  feedback: string | null;
}

interface PracticePanelProps {
  courseSlug: string;
  lessonSlug: string;
}

type Status = "idle" | "generating" | "answering" | "submitting" | "result" | "error";

export function PracticePanel({ courseSlug, lessonSlug }: PracticePanelProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [practice, setPractice] = useState<GeneratedPractice | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("generating");
    setErrorMessage(null);
    setResult(null);
    setSelectedChoice("");
    setShortAnswer("");
    try {
      const response = await fetch("/api/learning/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug }),
      });
      const body = await response.json();
      if (!response.ok) {
        setErrorMessage(
          response.status === 503
            ? `${body.error ?? "The AI provider is unavailable."} Make sure Ollama is running locally.`
            : (body.error ?? "Could not generate a practice question."),
        );
        setStatus("error");
        return;
      }
      setPractice(body as GeneratedPractice);
      setStatus("answering");
    } catch {
      setErrorMessage("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  async function handleSubmit() {
    if (!practice) return;
    const studentAnswer = practice.questionType === "MULTIPLE_CHOICE" ? selectedChoice : shortAnswer;
    if (!studentAnswer.trim()) return;

    setStatus("submitting");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/learning/practice/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceId: practice.practiceId, studentAnswer }),
      });
      const body = await response.json();
      if (!response.ok) {
        setErrorMessage(
          response.status === 404
            ? "This practice question expired. Request a new one."
            : (body.error ?? "Could not evaluate your answer."),
        );
        setStatus("error");
        return;
      }
      setResult(body as PracticeAttemptResult);
      setStatus("result");
    } catch {
      setErrorMessage("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Practice this lesson
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            A short question grounded in this lesson&apos;s content.
          </p>
        </div>
        {status !== "answering" && status !== "submitting" && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "generating"}
            className="shrink-0 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
          >
            {status === "generating" ? "Generating..." : result ? "Try another question" : "Start practice"}
          </button>
        )}
      </div>

      {status === "error" && errorMessage && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {errorMessage}
        </p>
      )}

      {practice && (status === "answering" || status === "submitting") && (
        <div className="mt-4">
          <p className="text-neutral-800 dark:text-neutral-200">{practice.question}</p>

          {practice.questionType === "MULTIPLE_CHOICE" && practice.choices ? (
            <fieldset className="mt-3 space-y-2">
              {practice.choices.map((choice, index) => (
                <label
                  key={choice}
                  className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <input
                    type="radio"
                    name="practice-choice"
                    value={String(index)}
                    checked={selectedChoice === String(index)}
                    onChange={(event) => setSelectedChoice(event.target.value)}
                  />
                  {choice}
                </label>
              ))}
            </fieldset>
          ) : (
            <textarea
              value={shortAnswer}
              onChange={(event) => setShortAnswer(event.target.value)}
              rows={3}
              className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="Type your answer..."
            />
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              status === "submitting" ||
              (practice.questionType === "MULTIPLE_CHOICE" ? !selectedChoice : !shortAnswer.trim())
            }
            className="mt-3 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {status === "submitting" ? "Checking..." : "Submit answer"}
          </button>
        </div>
      )}

      {result && status === "result" && (
        <div
          className={`mt-4 rounded-md border px-4 py-3 text-sm ${
            result.correct
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          <p className="font-medium">{result.correct ? "Correct!" : "Not quite."}</p>
          {!result.correct && <p className="mt-1">Correct answer: {result.correctAnswer}</p>}
          <p className="mt-1">{result.explanation}</p>
          {result.feedback && <p className="mt-1 italic">{result.feedback}</p>}
        </div>
      )}
    </div>
  );
}
