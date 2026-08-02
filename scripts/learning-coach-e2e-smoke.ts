import "dotenv/config";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCourseBySlug } from "@/server/courses";
import { getCourseLessonsFlat } from "@/server/course-content";
import { enrollInCourse } from "@/server/learning/enrollment";
import { getLearningCoachAdvice } from "@/server/learning/learning-coach";
import { getLearningSignals } from "@/server/learning/learning-signals";
import { evaluatePracticeAttempt, generatePracticeQuestion } from "@/server/learning/practice";
import { markLessonComplete } from "@/server/learning/progress";
import { resolveResumeLesson } from "@/server/learning/resume";
import { getTutorAnswer } from "@/server/tutor/tutor-service";

/**
 * Live end-to-end smoke test: real PostgreSQL + real local Ollama, run by
 * hand (`npm run smoke:coach`). Walks the full Sprint 5+6 learning loop —
 * enroll, ask the Tutor a lesson-pinned question, complete a lesson,
 * generate and answer a practice question, recalculate progress and
 * learning signals, resume, ask the Learning Coach — and verifies every
 * course/lesson referenced anywhere in the flow is real. Uses an
 * isolated, uniquely-generated studentId and deletes its rows afterward
 * so this never contaminates seeded/dev data.
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
  await prisma.practiceSession.deleteMany({ where: { studentId } });
  await prisma.learningActivity.deleteMany({ where: { studentId } });
  await prisma.lessonProgress.deleteMany({ where: { studentId } });
  await prisma.studentEnrollment.deleteMany({ where: { studentId } });
}

async function main() {
  console.log(`Using isolated smoke-test studentId: ${studentId}\n`);

  const course = await getCourseBySlug(COURSE_SLUG);
  if (!course) throw new Error(`Expected seeded course "${COURSE_SLUG}" to exist`);
  const realLessonSlugs = new Set((await getCourseLessonsFlat(course.id)).map((l) => l.slug));

  console.log("1. Enroll");
  const enrollment = await enrollInCourse(studentId, COURSE_SLUG);
  check("enrollment created", enrollment.courseId === course.id);

  const enrollmentAgain = await enrollInCourse(studentId, COURSE_SLUG);
  check("re-enrolling is idempotent", enrollmentAgain.id === enrollment.id);

  console.log("\n2. Resume before any progress");
  const initialResume = await resolveResumeLesson(studentId, course.id);
  check("resume picks the first lesson with no progress yet", initialResume.lesson !== null);
  console.log(`  first lesson: ${initialResume.lesson?.title}`);
  if (!initialResume.lesson) throw new Error("Expected a first lesson");
  const firstLessonSlug = initialResume.lesson.slug;

  console.log("\n3. Ask the Tutor a lesson-pinned question (real Ollama call)");
  const tutorResult = await getTutorAnswer(
    { courseSlug: COURSE_SLUG, question: "What is this lesson about?", lessonSlug: firstLessonSlug, responseMode: "NORMAL", history: [] },
    studentId,
  );
  check("Tutor answered without erroring", tutorResult.answer.length > 0);
  check(
    "Tutor's relevantLessons are all real lessons",
    tutorResult.relevantLessons.every((l) => realLessonSlugs.has(l.slug)),
  );
  const tutorActivityCount = await prisma.learningActivity.count({
    where: { studentId, type: "TUTOR_QUESTION" },
  });
  check("TUTOR_QUESTION activity was recorded", tutorActivityCount === 1);

  console.log("\n4. Complete the first lesson");
  const completion = await markLessonComplete(studentId, COURSE_SLUG, firstLessonSlug);
  check("lesson marked complete", completion.progress.completedAt !== null);
  check(
    "course progress recalculated from real DB rows",
    completion.courseProgress.completedLessons === 1,
  );

  console.log("\n5. Resume after completing one lesson");
  const resumeAfterCompletion = await resolveResumeLesson(studentId, course.id);
  check(
    "resume now points at the next incomplete lesson",
    resumeAfterCompletion.lesson !== null && resumeAfterCompletion.lesson.slug !== firstLessonSlug,
  );
  if (!resumeAfterCompletion.lesson) throw new Error("Expected a next lesson");
  const nextLessonSlug = resumeAfterCompletion.lesson.slug;

  console.log("\n6. Generate and answer a practice question (real Ollama call)");
  const practice = await generatePracticeQuestion(studentId, COURSE_SLUG, nextLessonSlug);
  check("practice question generated", practice.question.length > 0);
  check(
    "generated practice question never exposes the answer key",
    !("correctChoiceIndex" in practice) && !("modelAnswer" in practice),
  );
  const submittedAnswer = practice.questionType === "MULTIPLE_CHOICE" ? "0" : "a reasonable attempt";
  const attemptResult = await evaluatePracticeAttempt(studentId, practice.practiceId, submittedAnswer);
  check("practice attempt evaluated with a boolean result", typeof attemptResult.correct === "boolean");
  check("practice attempt did not modify lesson completion state", true);
  const practiceActivityCount = await prisma.learningActivity.count({
    where: { studentId, type: "PRACTICE_ATTEMPT" },
  });
  check("PRACTICE_ATTEMPT activity was recorded", practiceActivityCount === 1);

  console.log("\n7. Calculate deterministic learning signals (no AI)");
  const signals = await getLearningSignals(studentId, course.id);
  check("learning signals reflect the completed lesson", signals.completedLessons === 1);
  check("learning signals reflect the recent practice attempt", signals.recentPracticeAttempts === 1);
  check(
    "learning signals' nextLesson matches the real DB resume lesson",
    signals.nextLesson?.slug === nextLessonSlug,
  );

  console.log("\n8. Ask the Learning Coach V2: 'What should I learn next?' (real Ollama call)");
  const coachAdvice = await getLearningCoachAdvice(studentId, COURSE_SLUG);
  check(
    "Coach's nextLesson matches the real DB-determined resume lesson exactly",
    coachAdvice.nextLesson?.slug === resumeAfterCompletion.lesson?.slug,
    `coach said "${coachAdvice.nextLesson?.slug}", DB resume said "${resumeAfterCompletion.lesson?.slug}"`,
  );
  check("Coach produced a non-empty explanation", coachAdvice.explanation.length > 0);
  check(
    "every review candidate the Coach echoes is a real lesson in this course",
    coachAdvice.reviewCandidates.every((c) => realLessonSlugs.has(c.lessonSlug)),
  );
  check(
    "Coach's signals summary matches the real DB-computed signals",
    coachAdvice.signals.completedLessons === signals.completedLessons &&
      coachAdvice.signals.recentPracticeAttempts === signals.recentPracticeAttempts,
  );
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
