"use client";

import { useState } from "react";

interface CourseActionsProps {
  title: string;
}

export function CourseActions({ title }: CourseActionsProps) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or share failed silently; fall through to copy
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled
        title="Saving courses is coming soon"
        className="cursor-not-allowed rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-400 dark:border-neutral-700 dark:text-neutral-600"
      >
        Save for later
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
      >
        {shareState === "copied" ? "Link copied" : "Share"}
      </button>
    </div>
  );
}
