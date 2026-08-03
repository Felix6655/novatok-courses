import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

/**
 * PracticePanel is a "use client" component and this repo has no
 * rendering harness (no jsdom/@testing-library) for it. Instead of adding
 * one for a two-line fix, this statically verifies the two button labels
 * are real JSX interpolations of the dictionary — not quoted literal
 * text — and that the keys they reference resolve to real translated
 * strings for every supported locale, which is what actually determines
 * the rendered output.
 */
const source = readFileSync(
  new URL("./PracticePanel.tsx", import.meta.url),
  "utf-8",
);

describe("PracticePanel localized button labels", () => {
  it("never renders a quoted dictionary interpolation as literal text", () => {
    expect(source).not.toMatch(/["']\{dictionary\.\w+\}["']/);
  });

  it("interpolates the retry label from the dictionary after a result", () => {
    expect(source).toMatch(/result \? dictionary\.tryAgain : "Start practice"/);
  });

  it("interpolates the submit label from the dictionary while not submitting", () => {
    expect(source).toMatch(
      /status === "submitting" \? "Checking\.\.\." : dictionary\.submitAnswer/,
    );
  });

  it("resolves tryAgain and submitAnswer to real translated text for every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const dictionary = dictionaries[locale];
      expect(dictionary.tryAgain).not.toMatch(/\{dictionary\./);
      expect(dictionary.submitAnswer).not.toMatch(/\{dictionary\./);
      expect(dictionary.tryAgain.length).toBeGreaterThan(0);
      expect(dictionary.submitAnswer.length).toBeGreaterThan(0);
    }
  });
});
