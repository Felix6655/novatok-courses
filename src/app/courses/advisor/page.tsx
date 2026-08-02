import type { Metadata } from "next";
import { CourseAdvisorForm } from "@/components/advisor/CourseAdvisorForm";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/dictionaries";
export async function generateMetadata(): Promise<Metadata> { const locale=await getRequestLocale(); const d=getDictionary(locale); return { title:`${d.advisor} | NovaTok Courses`, description:d.advisorPrompt, alternates:{canonical:`/${locale}/courses/advisor`} }; }
export default async function CourseAdvisorPage() { const d=getDictionary(await getRequestLocale()); return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{d.advisor}</h1><p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">{d.advisorPrompt}</p><div className="mt-8"><CourseAdvisorForm /></div></main>; }
