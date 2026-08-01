import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { getTutorAnswer } from "@/server/tutor/tutor-service";

/**
 * Live end-to-end smoke test: real PostgreSQL + real local Ollama, run by
 * hand (`npm run smoke:tutor`) against a seeded dev database. Not part of
 * the automated test suite — that suite uses fakes and must never require
 * a live server.
 */

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("--- Normal question (keyword retrieval)");
  const normal = await getTutorAnswer({
    courseSlug: "javascript-fundamentals",
    question: "Explain variables in JavaScript",
    responseMode: "NORMAL",
    history: [],
  });
  check("grounded", normal.grounded === true);
  check(
    "relevant lessons come from real DB",
    normal.relevantLessons.some((l) => l.slug === "variables-and-data-types"),
  );
  console.log(`  answerSource: ${normal.answerSource}`);

  console.log("\n--- Lesson-pinned question");
  const pinned = await getTutorAnswer({
    courseSlug: "javascript-fundamentals",
    question: "Explain this simply",
    responseMode: "SIMPLE",
    lessonSlug: "variables-and-data-types",
    history: [],
  });
  check("pinnedLessonSlug echoed back", pinned.pinnedLessonSlug === "variables-and-data-types");
  check(
    "pinned lesson is the primary relevant lesson",
    pinned.relevantLessons[0]?.slug === "variables-and-data-types",
  );

  console.log("\n--- Follow-up with history");
  const followUp = await getTutorAnswer({
    courseSlug: "javascript-fundamentals",
    question: "Can you give me another example?",
    responseMode: "EXAMPLE",
    lessonSlug: "variables-and-data-types",
    history: [
      { role: "user", content: "Explain variables in JavaScript" },
      { role: "assistant", content: normal.answer },
    ],
  });
  check("follow-up produced a grounded answer", followUp.grounded === true);
  console.log(`  answer: ${followUp.answer.slice(0, 120)}...`);

  console.log("\n--- PRACTICE mode");
  const practice = await getTutorAnswer({
    courseSlug: "cybersecurity-fundamentals",
    question: "Quiz me on this",
    responseMode: "PRACTICE",
    history: [],
  });
  check("practice request produced a grounded response", practice.grounded === true);
  console.log(`  answerSource: ${practice.answerSource}, has practiceQuestion: ${practice.practiceQuestion !== null}`);

  console.log("\n--- Out-of-scope question");
  // Deliberately picks a question with zero plausible keyword overlap
  // with any javascript-fundamentals lesson, so the deterministic
  // keyword-based redirect (no AI call) should catch it. A question that
  // happens to share one common word with lesson prose (e.g. "best") can
  // legitimately fall through to the secondary AI-judged path instead —
  // both are correct per the two-layer design, but this question is
  // chosen to exercise the primary, no-AI-call path specifically.
  const outOfScope = await getTutorAnswer({
    courseSlug: "javascript-fundamentals",
    question: "What are some good hiking trails near Denver?",
    responseMode: "NORMAL",
    history: [],
  });
  check("flagged as out of scope", outOfScope.outOfScope === true);
  check("answerSource is the deterministic redirect", outOfScope.answerSource === "redirect");

  console.log("\n--- Unknown course rejection");
  try {
    await getTutorAnswer({
      courseSlug: "not-a-real-course",
      question: "hi",
      responseMode: "NORMAL",
      history: [],
    });
    check("rejects unknown course", false, "did not throw");
  } catch (error) {
    check("rejects unknown course", error instanceof Error && error.name === "TutorCourseNotFoundError");
  }

  console.log("\n--- Cross-course lessonSlug rejection");
  try {
    await getTutorAnswer({
      courseSlug: "cybersecurity-fundamentals",
      question: "hi",
      responseMode: "NORMAL",
      lessonSlug: "variables-and-data-types", // belongs to javascript-fundamentals
      history: [],
    });
    check("rejects cross-course lessonSlug", false, "did not throw");
  } catch (error) {
    check(
      "rejects cross-course lessonSlug",
      error instanceof Error && error.name === "TutorLessonNotFoundError",
    );
  }

  console.log(`\n${failures === 0 ? "All Tutor E2E checks passed." : `${failures} issue(s) found.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    failures++;
    console.error("Smoke test crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
