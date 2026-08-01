import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { getCourseAdvisorRecommendation } from "@/server/advisor/advisor-service";

/**
 * Live end-to-end smoke test: real PostgreSQL + real local Ollama, run by
 * hand (`npm run smoke:advisor`) against a seeded dev database. Not part
 * of the automated test suite — that suite uses fakes and must never
 * require a live server.
 */

const REPRESENTATIVE_INTENTS = [
  "I have never coded before and want to learn Python.",
  "I'm a business owner and want to learn AI so I can automate parts of my business.",
  "I'm a complete beginner and want to learn cybersecurity.",
  "I want to learn project management for my new job.",
  "I only have about 3 hours a week — what's a good beginner course?",
  "I want to learn something for free about investing.",
];

let failures = 0;

async function main() {
  for (const message of REPRESENTATIVE_INTENTS) {
    console.log(`\n--- "${message}"`);
    try {
      const result = await getCourseAdvisorRecommendation(message);
      console.log(`  interpretedGoal: ${result.interpretedGoal}`);
      console.log(`  generatedBy: ${result.generatedBy}`);

      if (result.recommendations.length === 0) {
        console.log("  (no recommendations returned)");
        continue;
      }

      for (const rec of result.recommendations) {
        const exists = await prisma.course.findUnique({ where: { slug: rec.course.slug } });
        const groundedMark = exists ? "grounded" : "NOT IN DB (hallucination leaked through!)";
        if (!exists) failures++;
        console.log(`  - [${groundedMark}] ${rec.course.slug} — ${rec.reason}`);
      }
    } catch (error) {
      failures++;
      console.log(`  FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`\n${failures === 0 ? "All Advisor E2E checks passed." : `${failures} issue(s) found.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().finally(async () => {
  await prisma.$disconnect();
});
