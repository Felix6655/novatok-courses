import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LearnError from "@/app/learn/error";

const source = readFileSync(new URL("./error.tsx", import.meta.url), "utf-8");

describe("/learn error boundary", () => {
  it("is a client component, as Next.js requires for error.tsx", () => {
    expect(source).toMatch(/^"use client";/);
  });

  it("renders a safe, generic error state and never leaks the underlying error", () => {
    const sensitiveError = Object.assign(
      new Error("DATABASE_URL=postgresql://user:hunter2@host/novatok_courses leaked"),
      { digest: "abc123digest" },
    );
    const html = renderToStaticMarkup(
      createElement(LearnError, { error: sensitiveError, reset: () => {} }),
    );

    expect(html).not.toContain("hunter2");
    expect(html).not.toContain("DATABASE_URL");
    expect(html).not.toContain("abc123digest");
    expect(html).not.toContain(sensitiveError.message);
    expect(html).toContain("Something went wrong");
    expect(html).toMatch(/<button[^>]*>\s*Try again\s*<\/button>/);
    expect(html).toContain("/courses");
  });
});
