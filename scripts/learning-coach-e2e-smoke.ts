import "dotenv/config";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCourseBySlug } from "@/server/courses";
import { enrollInCourse } from "@/server/learning/enrollment";
import { markLessonComplete } from "@/server/learning/progress";
import { resolveResumeLesson } from "@/server/learning/resume";
import { getLearningCoachAdvice } from "@/server/learning/learning-coach";

/**
 * Live end-to-end smoke test: real PostgreSQL + real local Ollama, run by
 * hand (`npm run smoke:coach`). Walks the full learning loop — enroll,
 * complete a lesson, recalculate progress, resume, ask the Learning
 * Coach — and verifies the Coach's nextLesson matches the real
 * DB-determined lesson exactly. Uses an isolated, uniquely-generated
 * studentId and deletes its rows afterward so this never contaminates
 * seeded/dev data.
 */

const COURSE_SLUG = "javascript-fundamentals";
const studentId = `smoke-test-${randomUUID()}`;

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
  await prisma.lessonProgress.deleteMany({ where: { studentId } });
  await prisma.studentEnrollment.deleteMany({ where: { studentId } });
}

async function main() {
  console.log(`Using isolated smoke-test studentId: ${studentId}\n`);

  const course = await getCourseBySlug(COURSE_SLUG);
  if (!course) throw new Error(`Expected seeded course "${COURSE_SLUG}" to exist`);

  console.log("1. Enroll");
  const enrollment = await enrollInCourse(studentId, COURSE_SLUG);
  check("enrollment created", enrollment.courseId === course.id);

  const enrollmentAgain = await enrollInCourse(studentId, COURSE_SLUG);
  check("re-enrolling is idempotent", enrollmentAgain.id === enrollment.id);

  console.log("\n2. Resume before any progress");
  const initialResume = await resolveResumeLesson(studentId, course.id);
  check("resume picks the first lesson with no progress yet", initialResume.lesson !== null);
  console.log(`  first lesson: ${initialResume.lesson?.title}`);

  console.log("\n3. Complete the first lesson");
  if (!initialResume.lesson) throw new Error("Expected a first lesson to complete");
  const firstLessonSlug = initialResume.lesson.slug;
  const completion = await markLessonComplete(studentId, COURSE_SLUG, firstLessonSlug);
  check("lesson marked complete", completion.progress.completedAt !== null);
  check(
    "course progress recalculated from real DB rows",
    completion.courseProgress.completedLessons === 1,
  );

  console.log("\n4. Resume after completing one lesson");
  const resumeAfterCompletion = await resolveResumeLesson(studentId, course.id);
  check(
    "resume now points at the next incomplete lesson",
    resumeAfterCompletion.lesson !== null && resumeAfterCompletion.lesson.slug !== firstLessonSlug,
  );

  console.log("\n5. Ask the Learning Coach: 'What should I learn next?'");
  const coachAdvice = await getLearningCoachAdvice(studentId, COURSE_SLUG);
  check(
    "Coach's nextLesson matches the real DB-determined resume lesson exactly",
    coachAdvice.nextLesson?.slug === resumeAfterCompletion.lesson?.slug,
    `coach said "${coachAdvice.nextLesson?.slug}", DB resume said "${resumeAfterCompletion.lesson?.slug}"`,
  );
  check("Coach produced a non-empty explanation", coachAdvice.explanation.length > 0);
  console.log(`  answerSource: ${coachAdvice.answerSource}`);
  console.log(`  explanation: ${coachAdvice.explanation.slice(0, 160)}...`);

  console.log(`\n${failures === 0 ? "All Learning Coach E2E checks passed." : `${failures} issue(s) found.`}`);
  process.exitCode = failures === 0 ? 0 : 1;
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
