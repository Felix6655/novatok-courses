import { InvalidModelOutputError } from "@/ai/errors";
import { getAIProvider } from "@/ai/get-ai-provider";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider, ChatMessage } from "@/ai/provider";
import {
  practiceEvaluationModelResponseSchema,
  practiceModelResponseSchema,
  type PracticeQuestionType,
} from "@/lib/validation/practice";
import { getLessonByCourseAndSlug } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";
import { recordLearningActivity } from "@/server/learning/activity";
import { findEnrollment } from "@/server/learning/enrollment";
import {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
  PracticeNotFoundError,
} from "@/server/learning/errors";
import { storePendingPractice, takePendingPractice } from "@/server/learning/practice-store";

export interface GeneratedPractice {
  practiceId: string;
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  questionType: PracticeQuestionType;
  question: string;
  choices: string[] | null;
}

export interface PracticeAttemptResult {
  courseSlug: string;
  lessonSlug: string;
  questionType: PracticeQuestionType;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  /** AI-generated feedback for a SHORT_ANSWER attempt only; null for MULTIPLE_CHOICE. */
  feedback: string | null;
}

export interface PracticeDeps {
  provider?: AIProvider;
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

const GENERATE_SYSTEM_PROMPT = `You are generating one practice question for a student studying a specific lesson. The
lesson content given is the only authoritative source of facts — never invent course content
that isn't supported by it. Prefer MULTIPLE_CHOICE; use SHORT_ANSWER only when the concept
genuinely doesn't fit a multiple-choice format.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{
  "questionType": "MULTIPLE_CHOICE" | "SHORT_ANSWER",
  "question": string,
  "choices": string[] | null,
  "correctChoiceIndex": number | null,
  "modelAnswer": string | null,
  "explanation": string
}

For MULTIPLE_CHOICE: "choices" must have 2-6 options and "correctChoiceIndex" must be the
0-based index of the single correct one; "modelAnswer" must be null.
For SHORT_ANSWER: "modelAnswer" must be a concise reference answer; "choices" and
"correctChoiceIndex" must be null.
"explanation" is a short, standalone explanation of why the correct answer is correct.`;

function buildGeneratePromptMessages(courseTitle: string, lessonTitle: string, lessonContent: string): ChatMessage[] {
  return [
    { role: "system", content: GENERATE_SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `Course: ${courseTitle}\nLesson: ${lessonTitle}\n\n` +
        `Lesson content:\n${truncate(lessonContent, 1200)}\n\n` +
        "Generate one practice question for this lesson now.",
    },
  ];
}

/**
 * Generates one AI practice question grounded in a specific enrolled
 * lesson's real content, and stores its answer key server-side (never sent
 * to the client — see practice-store.ts) keyed by an opaque practiceId.
 */
export async function generatePracticeQuestion(
  studentId: string,
  courseSlug: string,
  lessonSlug: string,
  deps: PracticeDeps = {},
): Promise<GeneratedPractice> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new EnrollmentCourseNotFoundError(courseSlug);
  }

  const enrollment = await findEnrollment(studentId, course.id);
  if (!enrollment) {
    throw new NotEnrolledError(courseSlug);
  }

  const lesson = await getLessonByCourseAndSlug(course.id, lessonSlug);
  if (!lesson) {
    throw new LearningLessonNotFoundError(courseSlug, lessonSlug);
  }

  const provider = deps.provider ?? getAIProvider();
  const completion = await provider.generateCompletion({
    messages: buildGeneratePromptMessages(course.title, lesson.title, lesson.content),
    temperature: 0.4,
  });

  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : practiceModelResponseSchema.safeParse(parsed);

  if (!validated || !validated.success) {
    throw new InvalidModelOutputError(
      "The AI provider returned a practice question that could not be used.",
      completion,
    );
  }

  const practiceId = await storePendingPractice({
    studentId,
    courseId: course.id,
    courseSlug: course.slug,
    lessonId: lesson.id,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    questionType: validated.data.questionType,
    question: validated.data.question,
    choices: validated.data.choices,
    correctChoiceIndex: validated.data.correctChoiceIndex,
    modelAnswer: validated.data.modelAnswer,
    explanation: validated.data.explanation,
  });

  return {
    practiceId,
    courseSlug: course.slug,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    questionType: validated.data.questionType,
    question: validated.data.question,
    choices: validated.data.choices,
  };
}

const EVALUATE_SYSTEM_PROMPT = `You are evaluating a student's short-answer response against a reference answer, grounded
in the lesson content given. Be lenient about phrasing — judge whether the student demonstrated
the correct understanding, not whether they used the exact same words.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{ "correct": boolean, "feedback": string }

"feedback" is one or two sentences, addressed to the student.`;

async function evaluateShortAnswer(
  pending: { question: string; modelAnswer: string | null; explanation: string },
  studentAnswer: string,
  provider: AIProvider,
): Promise<{ correct: boolean; feedback: string }> {
  const messages: ChatMessage[] = [
    { role: "system", content: EVALUATE_SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `Question: ${pending.question}\n` +
        `Reference answer: ${pending.modelAnswer ?? ""}\n` +
        `Explanation: ${pending.explanation}\n\n` +
        `Student's answer: ${studentAnswer}\n\n` +
        "Evaluate the student's answer now.",
    },
  ];

  const completion = await provider.generateCompletion({ messages, temperature: 0.1 });
  const parsed = parseJsonLoosely(completion);
  const validated =
    parsed === undefined ? undefined : practiceEvaluationModelResponseSchema.safeParse(parsed);

  if (!validated || !validated.success) {
    throw new InvalidModelOutputError(
      "The AI provider returned an evaluation that could not be used.",
      completion,
    );
  }

  return validated.data;
}

/**
 * Deterministically evaluates a MULTIPLE_CHOICE attempt by comparing the
 * submitted 0-based choice index to the answer key generated alongside the
 * question — the AI is never asked whether its own answer is correct.
 * SHORT_ANSWER attempts use the AI only for the judgement call a string
 * comparison can't make, with a bounded, bordered response shape. Neither
 * path ever writes to StudentEnrollment or LessonProgress: practice results
 * are recorded only as a LearningActivity signal, never authoritative
 * completion state.
 */
export async function evaluatePracticeAttempt(
  studentId: string,
  practiceId: string,
  studentAnswer: string,
  deps: PracticeDeps = {},
): Promise<PracticeAttemptResult> {
  const pending = await takePendingPractice(practiceId, studentId);
  if (!pending) {
    throw new PracticeNotFoundError();
  }

  let correct: boolean;
  let feedback: string | null;
  let correctAnswer: string;

  if (pending.questionType === "MULTIPLE_CHOICE") {
    const chosenIndex = Number(studentAnswer);
    correct = Number.isInteger(chosenIndex) && chosenIndex === pending.correctChoiceIndex;
    feedback = null;
    correctAnswer = pending.choices?.[pending.correctChoiceIndex ?? -1] ?? "";
  } else {
    const provider = deps.provider ?? getAIProvider();
    const evaluation = await evaluateShortAnswer(pending, studentAnswer, provider);
    correct = evaluation.correct;
    feedback = evaluation.feedback;
    correctAnswer = pending.modelAnswer ?? "";
  }

  await recordLearningActivity({
    studentId,
    courseId: pending.courseId,
    lessonId: pending.lessonId,
    type: "PRACTICE_ATTEMPT",
    metadata: { correct, questionType: pending.questionType },
  });

  return {
    courseSlug: pending.courseSlug,
    lessonSlug: pending.lessonSlug,
    questionType: pending.questionType,
    correct,
    correctAnswer,
    explanation: pending.explanation,
    feedback,
  };
}
