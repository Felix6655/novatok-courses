import { prisma } from "@/lib/prisma";
import type { PracticeQuestionType } from "@/lib/validation/practice";

export interface PendingPractice {
  studentId: string;
  courseId: string;
  courseSlug: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  questionType: PracticeQuestionType;
  question: string;
  choices: string[] | null;
  correctChoiceIndex: number | null;
  modelAnswer: string | null;
  explanation: string;
}

const TTL_MS = 15 * 60 * 1000;

/**
 * PostgreSQL-backed practice-question store (Sprint 7; replaces Sprint
 * 6's in-memory Map). A generated question's answer key is written to the
 * `PracticeSession` table and never sent to the client — see
 * practiceRequestSchema's generate response. Survives process
 * restarts/multiple instances by construction, unlike the Sprint 6
 * version.
 */
export async function storePendingPractice(data: PendingPractice): Promise<string> {
  // Opportunistic, bounded cleanup: only this student's own expired rows,
  // on their own write path — no global sweep job required.
  await prisma.practiceSession.deleteMany({
    where: { studentId: data.studentId, expiresAt: { lt: new Date() } },
  });

  const created = await prisma.practiceSession.create({
    data: {
      studentId: data.studentId,
      courseId: data.courseId,
      lessonId: data.lessonId,
      questionType: data.questionType,
      question: data.question,
      choices: data.choices ?? [],
      correctChoiceIndex: data.correctChoiceIndex,
      modelAnswer: data.modelAnswer,
      explanation: data.explanation,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });

  return created.id;
}

/**
 * Consumes a pending practice question in one atomic step: `updateMany`
 * with `consumedAt: null` in its WHERE clause is a single conditional SQL
 * UPDATE, so two concurrent evaluate requests for the same practiceId
 * can't both "win" — only one will match zero-consumed rows and flip
 * `consumedAt`, the other gets `count: 0`. Returns undefined for an
 * unknown id, an expired id, an already-consumed id, or an id that
 * belongs to a different student — the caller can't tell which, which is
 * the point (no information leak about other students' practice
 * sessions).
 */
export async function takePendingPractice(
  practiceId: string,
  studentId: string,
): Promise<PendingPractice | undefined> {
  const now = new Date();

  const consumed = await prisma.practiceSession.updateMany({
    where: { id: practiceId, studentId, consumedAt: null, expiresAt: { gt: now } },
    data: { consumedAt: now },
  });
  if (consumed.count === 0) return undefined;

  const row = await prisma.practiceSession.findUnique({
    where: { id: practiceId },
    include: { course: true, lesson: true },
  });
  if (!row) return undefined;

  return {
    studentId: row.studentId,
    courseId: row.courseId,
    courseSlug: row.course.slug,
    lessonId: row.lessonId,
    lessonSlug: row.lesson.slug,
    lessonTitle: row.lesson.title,
    questionType: row.questionType,
    question: row.question,
    choices: row.choices.length > 0 ? row.choices : null,
    correctChoiceIndex: row.correctChoiceIndex,
    modelAnswer: row.modelAnswer,
    explanation: row.explanation,
  };
}
