import { describe, expect, it } from "vitest";
import { localeSchema, normalizeLocale, SUPPORTED_LOCALES } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { applyTranslation, translationLocales } from "@/i18n/localize";
import { localizePath } from "@/components/LanguageSwitcher";

describe("internationalization foundation", () => {
  it("accepts only the V1 locale set", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "es", "pt", "fr", "de"]);
    for (const locale of SUPPORTED_LOCALES) expect(localeSchema.parse(locale)).toBe(locale);
    expect(localeSchema.safeParse("it").success).toBe(false);
    expect(normalizeLocale("it")).toBe("en");
  });
  it("keeps every core dictionary structurally complete", () => {
    const englishKeys = Object.keys(dictionaries.en).sort();
    for (const locale of SUPPORTED_LOCALES) expect(Object.keys(dictionaries[locale]).sort()).toEqual(englishKeys);
  });
  it("falls back requested locale to English then canonical", () => {
    const canonical = { title: "Canonical", slug: "stable" };
    expect(applyTranslation(canonical, [{ locale: "en", title: "English" }], "es")).toEqual({ title: "English", slug: "stable" });
    expect(applyTranslation(canonical, [], "de")).toEqual(canonical);
    expect(translationLocales("fr")).toEqual(["fr", "en"]);
  });
  it("switches language without changing logical identity", () => {
    expect(localizePath("/en/courses/javascript-fundamentals", "es")).toBe("/es/courses/javascript-fundamentals");
    expect(localizePath("/learn/javascript-fundamentals", "de")).toBe("/de/learn/javascript-fundamentals");
  });
});
