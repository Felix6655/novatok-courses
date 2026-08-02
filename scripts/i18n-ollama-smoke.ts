import "dotenv/config";
import { getCourseAdvisorRecommendation } from "@/server/advisor/advisor-service";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";

const prompts: Record<Locale, string> = {
  en: "I want to learn cybersecurity.",
  es: "Quiero aprender ciberseguridad.",
  pt: "Quero aprender programação.",
  fr: "Je veux apprendre l'intelligence artificielle.",
  de: "Ich möchte Projektmanagement lernen.",
};
async function main() {
  for (const [locale, message] of Object.entries(prompts) as [Locale, string][]) {
    const result = await getCourseAdvisorRecommendation(message, { locale });
    const slugs = result.recommendations.map((item) => item.course.slug);
    const realCount = await prisma.course.count({ where: { slug: { in: slugs } } });
    if (realCount !== slugs.length) throw new Error(`${locale}: ungrounded recommendation`);
    console.log(JSON.stringify({ locale, generatedBy: result.generatedBy, slugs, pathSummary: result.pathSummary }));
  }
}
main().finally(() => prisma.$disconnect());
