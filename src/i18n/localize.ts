import type { Locale } from "@/i18n/config";
export type LocalizedFields = Record<string, unknown> & { locale: string; status?: "DRAFT" | "REVIEWED" | "PUBLISHED" };
export function resolveTranslation(translations: LocalizedFields[], locale: Locale) {
  const requested = translations.find((item) => item.locale === locale);
  if (requested) return { translation: requested, source: "requested" as const, status: requested.status ?? null };
  const english = translations.find((item) => item.locale === "en");
  if (english) return { translation: english, source: "english" as const, status: english.status ?? null };
  return { translation: null, source: "canonical" as const, status: null };
}
export function applyTranslation<T extends Record<string, unknown>>(canonical: T, translations: LocalizedFields[], locale: Locale): T {
  const { translation } = resolveTranslation(translations, locale);
  if (!translation) return canonical;
  const fields = Object.fromEntries(Object.entries(translation).filter(([key]) => !["id", "locale", "status", "reviewedAt", "createdAt", "updatedAt", "courseId", "moduleId", "lessonId"].includes(key)));
  return { ...canonical, ...fields } as T;
}
export function translationLocales(locale: Locale): Locale[] { return locale === "en" ? ["en"] : [locale, "en"]; }
