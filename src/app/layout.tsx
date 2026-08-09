import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SUPPORTED_LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getRequestLocale } from "@/i18n/request";
import { I18nProvider } from "@/i18n/client";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "NovaTok Courses",
  description: "Learn practical skills with NovaTok Courses",
  alternates: { canonical: "/en/courses", languages: Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, `/${locale}/courses`])) },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  return <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full flex flex-col"><I18nProvider dictionary={dictionary} locale={locale}><nav aria-label="Primary" className="flex gap-5 border-b px-6 py-3 text-sm"><Link href={`/${locale}/courses`}>{dictionary.courses}</Link><Link href={`/${locale}/courses/advisor`}>{dictionary.advisor}</Link><Link href={`/${locale}/learning-paths`}>{dictionary.learningPaths}</Link><Link href={`/${locale}/courses/creator-coach`}>{dictionary.creatorCoach}</Link><Link href={`/${locale}/learn`}>{dictionary.learn}</Link></nav><LanguageSwitcher locale={locale}/>{children}</I18nProvider></body></html>;
}
