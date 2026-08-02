import "dotenv/config";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCourseBySlug } from "@/server/courses";
import { getCourseLessonsFlat } from "@/server/course-content";
import { enrollInCourse } from "@/server/learning/enrollment";
import { evaluatePracticeAttempt, generatePracticeQuestion } from "@/server/learning/practice";

/**
 * Live end-to-end smoke test for Sprint 7's PostgreSQL-backed practice
 * store: real PostgreSQL + real local Ollama, run by hand
 * (`npm run smoke:practice`). Focused specifically on the security
 * properties a production-safe practice store must have: the answer key
 * is never returned to the caller, it's actually persisted in Postgres
 * (not just held in a process-local Map), ownership is enforced so a
 * different student can't consume or read someone else's pending
 * question, replay of an already-consumed practiceId is rejected, and an
 * expired practiceId is rejected. Uses isolated, uniquely-generated
 * studentIds and deletes all rows for them afterward.
 */

const COURSE_SLUG = "javascript-fundamentals";
const studentId = `smoke-test-practice-${randomUUID()}`;
const attackerStudentId = `smoke-test-attacker-${randomUUID()}`;

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function cleanup() {
  for (const id of [studentId, attackerStudentId]) {
    await prisma.practiceSession.deleteMany({ where: { studentId: id } });
    await prisma.learningActivity.deleteMany({ where: { studentId: id } });
    await prisma.lessonProgress.deleteMany({ where: { studentId: id } });
    await prisma.studentEnrollment.deleteMany({ where: { studentId: id } });
  }
}

async function main() {
  console.log(`Using isolated smoke-test studentId: ${studentId}`);
  console.log(`Using isolated "attacker" studentId: ${attackerStudentId}\n`);

  const course = await getCourseBySlug(COURSE_SLUG);
  if (!course) throw new Error(`Expected seeded course "${COURSE_SLUG}" to exist`);
  const lessons = await getCourseLessonsFlat(course.id);
  const lessonSlug = lessons[0]?.slug;
  if (!lessonSlug) throw new Error("Expected the course to have at least one lesson");

  console.log("1. Enroll the real student");
  await enrollInCourse(studentId, COURSE_SLUG);
  check("enrolled", true);

  console.log("\n2. Generate a practice question (real Ollama call)");
  const practice = await generatePracticeQuestion(studentId, COURSE_SLUG, lessonSlug);
  check("practice question generated", practice.question.length > 0);
  check(
    "generate response never exposes the answer key",
    !("correctChoiceIndex" in practice) && !("modelAnswer" in practice),
  );

  console.log("\n3. Verify the answer key IS persisted server-side in PostgreSQL");
  const row = await prisma.practiceSession.findUnique({ where: { id: practice.practiceId } });
  check("PracticeSession row exists in Postgres", row !== null);
  check(
    "the stored row has a real answer key",
    row?.correctChoiceIndex !== null || row?.modelAnswer !== null,
  );
  check("the row is not yet consumed", row?.consumedAt === null);

  console.log("\n4. Ownership isolation: a different student cannot consume this practiceId");
  await expectRejection(
    "attacker evaluating the real student's practiceId is rejected",
    () => evaluatePracticeAttempt(attackerStudentId, practice.practiceId, "0"),
  );
  const rowAfterAttack = await prisma.practiceSession.findUnique({ where: { id: practice.practiceId } });
  check(
    "the attacker's failed attempt did NOT consume the real owner's row",
    rowAfterAttack?.consumedAt === null,
  );

  console.log("\n5. The real owner can still evaluate it normally");
  const studentAnswer = practice.questionType === "MULTIPLE_CHOICE" ? "0" : "a reasonable attempt";
  const result = await evaluatePracticeAttempt(studentId, practice.practiceId, studentAnswer);
  check("evaluation returned a boolean correctness result", typeof result.correct === "boolean");

  console.log("\n6. Replay protection: evaluating the same practiceId again is rejected");
  await expectRejection("replay of a consumed practiceId is rejected", () =>
    evaluatePracticeAttempt(studentId, practice.practiceId, studentAnswer),
  );

  console.log("\n7. PRACTICE_ATTEMPT activity was recorded exactly once");
  const activityCount = await prisma.learningActivity.count({
    where: { studentId, type: "PRACTICE_ATTEMPT" },
  });
  check("exactly one PRACTICE_ATTEMPT activity recorded", activityCount === 1);

  console.log("\n8. Expired practice questions are rejected");
  const expiredPractice = await generatePracticeQuestion(studentId, COURSE_SLUG, lessonSlug);
  await prisma.practiceSession.update({
    where: { id: expiredPractice.practiceId },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  await expectRejection("an expired practiceId is rejected", () =>
    evaluatePracticeAttempt(studentId, expiredPractice.practiceId, "0"),
  );

  console.log(`\n${failures === 0 ? "All practice E2E security checks passed." : `${failures} issue(s) found.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

async function expectRejection(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    failures++;
    console.log(`  FAIL ${label} — expected a rejection but it succeeded`);
  } catch {
    console.log(`  ok   ${label}`);
  }
}

main()
  .catch((error) => {
    failures++;
    console.error("Smoke test crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await prisma.$disconnect();
  });
