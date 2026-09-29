import { z } from "zod";
import { InvalidModelOutputError } from "@/ai/errors";
import { getAIProvider } from "@/ai/get-ai-provider";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider, ChatMessage } from "@/ai/provider";
import { prisma } from "@/lib/prisma";
import { getCourseLessonsFlat } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";
import { findEnrollment } from "@/server/learning/enrollment";
import {
  CourseNotCompleteError,
  EnrollmentCourseNotFoundError,
  FinalExamAttemptNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import { calculateCourseProgress } from "@/server/learning/progress";

const QUESTION_COUNT = 5;
const ATTEMPT_TTL_MS = 30 * 60 * 1000;
export const FINAL_EXAM_PASSING_SCORE = 80;

const generatedQuestionSchema = z.object({
  question: z.string().trim().min(1).max(400),
  choices: z.array(z.string().trim().min(1).max(200)).length(4),
  correctChoiceIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(1).max(600),
});

const SYSTEM_PROMPT = `Create one rigorous multiple-choice final-exam question grounded ONLY in the supplied lesson.
Return ONLY JSON with this exact shape:
{"question":string,"choices":[string,string,string,string],"correctChoiceIndex":number,"explanation":string}
There must be exactly four plausible choices and exactly one correct answer. Never introduce facts not supported by the lesson.`;

export interface FinalExamQuestionView {
  id: string;
  lessonTitle: string;
  question: string;
  choices: string[];
}

export interface FinalExamView {
  attemptId: string;
  courseSlug: string;
  passingScore: number;
  expiresAt: string;
  questions: FinalExamQuestionView[];
}

export interface FinalExamResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
  results: Array<{
    questionId: string;
    correct: boolean;
    correctChoiceIndex: number;
    explanation: string;
  }>;
}

function selectRepresentativeLessons<T>(lessons: T[], count: number): T[] {
  if (lessons.length <= count) return lessons;
  if (count <= 1) return [lessons[0]];
  return Array.from({ length: count }, (_, index) => {
    const position = Math.round((index * (lessons.length - 1)) / (count - 1));
    return lessons[position];
  });
}

function toView(attempt: {
  id: string;
  expiresAt: Date;
  course: { slug: string };
  questions: Array<{ id: string; question: string; choices: string[]; lesson: { title: string } }>;
}): FinalExamView {
  return {
    attemptId: attempt.id,
    courseSlug: attempt.course.slug,
    passingScore: FINAL_EXAM_PASSING_SCORE,
    expiresAt: attempt.expiresAt.toISOString(),
    questions: attempt.questions.map((question) => ({
      id: question.id,
      lessonTitle: question.lesson.title,
      question: question.question,
      choices: question.choices,
    })),
  };
}

async function generateQuestion(
  provider: AIProvider,
  courseTitle: string,
  lesson: { title: string; content: string },
) {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Course: ${courseTitle}\nLesson: ${lesson.title}\n\nLesson content:\n${lesson.content.slice(0, 1800)}\n\nGenerate the final-exam question.`,
    },
  ];
  const completion = await provider.generateCompletion({ messages, temperature: 0.25 });
  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : generatedQuestionSchema.safeParse(parsed);
  if (!validated || !validated.success) {
    throw new InvalidModelOutputError("The AI provider returned an unusable final-exam question.", completion);
  }
  return validated.data;
}

export async function hasPassedFinalExam(studentId: string, courseId: string): Promise<boolean> {
  const passed = await prisma.courseExamAttempt.findFirst({
    where: { studentId, courseId, passed: true, submittedAt: { not: null } },
    select: { id: true },
  });
  return Boolean(passed);
}

export async function startFinalExam(
  studentId: string,
  courseSlug: string,
  deps: { provider?: AIProvider } = {},
): Promise<FinalExamView> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) throw new EnrollmentCourseNotFoundError(courseSlug);
  if (!(await findEnrollment(studentId, course.id))) throw new NotEnrolledError(courseSlug);
  const progress = await calculateCourseProgress(studentId, course.id);
  if (!progress.isComplete) throw new CourseNotCompleteError(courseSlug);

  const now = new Date();
  const existing = await prisma.courseExamAttempt.findFirst({
    where: { studentId, courseId: course.id, submittedAt: null, expiresAt: { gt: now } },
    include: {
      course: { select: { slug: true } },
      questions: {
        orderBy: { displayOrder: "asc" },
        include: { lesson: { select: { title: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return toView(existing);

  const lessons = selectRepresentativeLessons(await getCourseLessonsFlat(course.id), QUESTION_COUNT);
  if (lessons.length === 0) throw new CourseNotCompleteError(courseSlug);
  const provider = deps.provider ?? getAIProvider(process.env, { task: "final-exam" });

  const generated = [];
  for (const lesson of lessons) {
    generated.push({ lesson, generated: await generateQuestion(provider, course.title, lesson) });
  }

  const attempt = await prisma.courseExamAttempt.create({
    data: {
      studentId,
      courseId: course.id,
      expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS),
      questions: {
        create: generated.map(({ lesson, generated: question }, displayOrder) => ({
          lessonId: lesson.id,
          displayOrder,
          question: question.question,
          choices: question.choices,
          correctChoiceIndex: question.correctChoiceIndex,
          explanation: question.explanation,
        })),
      },
    },
    include: {
      course: { select: { slug: true } },
      questions: {
        orderBy: { displayOrder: "asc" },
        include: { lesson: { select: { title: true } } },
      },
    },
  });

  return toView(attempt);
}

export async function submitFinalExam(
  studentId: string,
  attemptId: string,
  answers: number[],
): Promise<FinalExamResult> {
  const now = new Date();
  const attempt = await prisma.courseExamAttempt.findFirst({
    where: { id: attemptId, studentId, submittedAt: null, expiresAt: { gt: now } },
    include: { questions: { orderBy: { displayOrder: "asc" } } },
  });
  if (!attempt || answers.length !== attempt.questions.length) throw new FinalExamAttemptNotFoundError();

  const results = attempt.questions.map((question, index) => ({
    questionId: question.id,
    correct: answers[index] === question.correctChoiceIndex,
    correctChoiceIndex: question.correctChoiceIndex,
    explanation: question.explanation,
  }));
  const correct = results.filter((result) => result.correct).length;
  const score = Math.round((correct / results.length) * 100);
  const passed = score >= FINAL_EXAM_PASSING_SCORE;

  const updated = await prisma.courseExamAttempt.updateMany({
    where: { id: attempt.id, studentId, submittedAt: null, expiresAt: { gt: now } },
    data: { submittedAt: now, score, passed },
  });
  if (updated.count !== 1) throw new FinalExamAttemptNotFoundError();

  return { attemptId: attempt.id, score, passed, passingScore: FINAL_EXAM_PASSING_SCORE, results };
}
