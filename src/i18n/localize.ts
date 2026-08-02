import type { Locale } from "@/i18n/config";

export type LocalizedFields = Record<string, unknown> & { locale: string };

/** Central fallback: requested locale, then explicit English, then canonical fields. */
export function applyTranslation<T extends Record<string, unknown>>(
  canonical: T,
  translations: LocalizedFields[],
  locale: Locale,
): T {
  const translation = translations.find((item) => item.locale === locale)
    ?? translations.find((item) => item.locale === "en");
  if (!translation) return canonical;
  const fields = Object.fromEntries(Object.entries(translation).filter(([key]) => key !== "locale"));
  return { ...canonical, ...fields } as T;
}

export function translationLocales(locale: Locale): Locale[] {
  return locale === "en" ? ["en"] : [locale, "en"];
}
