"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Exam {
  attemptId: string;
  passingScore: number;
  questions: Array<{ id: string; lessonTitle: string; question: string; choices: string[] }>;
}

export function FinalExamPanel({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; passed: boolean; passingScore: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/learning/final-exam/start", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseSlug }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.error ?? "Could not start the final assessment."); return; }
      setExam(body);
      setAnswers(Array(body.questions.length).fill(-1));
      setResult(null);
    } catch { setError("Could not start the final assessment."); }
    finally { setLoading(false); }
  }

  async function submit() {
    if (!exam || answers.some((answer) => answer < 0)) { setError("Answer every question before submitting."); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/learning/final-exam/submit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: exam.attemptId, answers }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.error ?? "Could not submit the final assessment."); return; }
      setResult(body);
      if (body.passed) router.refresh();
    } catch { setError("Could not submit the final assessment."); }
    finally { setLoading(false); }
  }

  if (!exam) {
    return (
      <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h3 className="font-semibold text-neutral-950 dark:text-white">Final assessment</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Complete a server-graded final assessment to unlock the course certificate.
        </p>
        <button onClick={start} disabled={loading} className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900">
          {loading ? "Preparing..." : "Start final assessment"}
        </button>
        {error && <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <h3 className="font-semibold text-neutral-950 dark:text-white">Final assessment</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Passing score: {exam.passingScore}%.</p>
      <div className="mt-6 space-y-7">
        {exam.questions.map((question, qIndex) => (
          <fieldset key={question.id}>
            <legend className="font-medium text-neutral-900 dark:text-neutral-100">
              {qIndex + 1}. {question.question}
            </legend>
            <p className="mt-1 text-xs text-neutral-500">From: {question.lessonTitle}</p>
            <div className="mt-3 space-y-2">
              {question.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex} className="flex cursor-pointer gap-3 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[qIndex] === choiceIndex}
                    onChange={() => setAnswers((current) => current.map((value, index) => index === qIndex ? choiceIndex : value))}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <button onClick={submit} disabled={loading || Boolean(result)} className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900">
        {loading ? "Submitting..." : "Submit final assessment"}
      </button>
      {result && (
        <div className={`mt-4 rounded-lg p-4 text-sm ${result.passed ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
          Score: {result.score}%. {result.passed ? "Passed. Your certificate is now unlocked." : "Not passed yet. You can start a new attempt."}
        </div>
      )}
      {result && !result.passed && (
        <button onClick={() => { setExam(null); setResult(null); setAnswers([]); }} className="mt-3 text-sm font-medium text-neutral-700 underline dark:text-neutral-300">
          Try again
        </button>
      )}
      {error && <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
    </section>
  );
}
