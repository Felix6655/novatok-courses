"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface EnrollButtonProps {
  courseSlug: string;
}

export function EnrollButton({ courseSlug }: EnrollButtonProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEnroll() {
    setIsEnrolling(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/learning/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrorMessage(body.error ?? "Could not enroll right now. Please try again.");
        setIsEnrolling(false);
        return;
      }
      router.refresh();
    } catch {
      setErrorMessage("Could not reach the server. Please try again.");
      setIsEnrolling(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={isEnrolling}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {isEnrolling ? "Enrolling..." : "Enroll for free"}
      </button>
      {errorMessage && <p className="mt-2 text-sm text-red-700 dark:text-red-400">{errorMessage}</p>}
    </div>
  );
}
