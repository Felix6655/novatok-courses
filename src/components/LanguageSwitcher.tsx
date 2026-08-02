"use client";
import { usePathname, useRouter } from "next/navigation";
import { LOCALE_NAMES, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

export function localizePath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (SUPPORTED_LOCALES.includes(parts[1] as Locale)) parts[1] = next;
  else parts.splice(1, 0, next);
  return parts.join("/") || `/${next}`;
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  return <label className="fixed right-4 top-4 z-50 rounded-md bg-white/95 p-2 text-sm shadow dark:bg-neutral-900"><span className="sr-only">Language</span><select value={locale} onChange={(event) => router.push(localizePath(pathname, event.target.value as Locale))}>{SUPPORTED_LOCALES.map((code) => <option key={code} value={code}>{LOCALE_NAMES[code]}</option>)}</select></label>;
}
