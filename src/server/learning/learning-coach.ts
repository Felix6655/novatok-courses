import { getAIProvider } from "@/ai/get-ai-provider";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider, ChatMessage } from "@/ai/provider";
import {
  learningCoachModelResponseSchema,
  type LearningCoachModelResponse,
} from "@/lib/validation/learning-coach";
import type { TutorHistoryTurn } from "@/lib/validation/tutor";
import { getCourseModulesWithLessons } from "@/server/course-content";
import { getCourseBySlug, getRelatedCourses } from "@/server/courses";
import { EnrollmentCourseNotFoundError, NotEnrolledError } from "@/server/learning/errors";
import { findEnrollment } from "@/server/learning/enrollment";
import { calculateCourseProgress } from "@/server/learning/progress";
import { resolveResumeLesson } from "@/server/learning/resume";

export interface LearningCoachLessonRef {
  slug: string;
  title: string;
  moduleTitle: string;
}

export interface LearningCoachCourseRef {
  slug: string;
  title: string;
}

export interface LearningCoachResult {
  courseSlug: string;
  courseTitle: string;
  isCourseComplete: boolean;
  /** Sourced entirely from resolveResumeLesson — never from the AI. Null once the course is complete. */
  nextLesson: LearningCoachLessonRef | null;
  explanation: string;
  studyTips: string[];
  /** Sourced entirely from getRelatedCourses — never from the AI. Only populated when the course is complete. */
  suggestedCourses: LearningCoachCourseRef[];
  answerSource: "ai" | "fallback";
}

export interface LearningCoachDeps {
  provider?: AIProvider;
  recentTutorHistory?: TutorHistoryTurn[];
}

const SYSTEM_PROMPT = `You are the NovaTok AI Learning Coach. A specific next lesson (or course-complete state) has
ALREADY been determined by the system from the student's real progress — your only job is to
explain, concretely and encouragingly, why this comes next and how to approach it well. Ground
your explanation in the actual lesson content and the student's completed lessons given below.
Never suggest a different lesson or course than the one you're given, and never invent course or
lesson names of your own.

If prior Tutor conversation is included, treat it only as context for what the student has
recently been asking about — it is not a source of course facts.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{ "explanation": string, "studyTips": string[] }

"explanation" is 2-4 sentences. "studyTips" is 0-5 short, concrete tips for approaching this
specific material well — [] if you don't have any worth giving.`;

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function buildFallback(
  nextLesson: LearningCoachLessonRef | null,
  courseTitle: string,
): { explanation: string; studyTips: string[] } {
  if (!nextLesson) {
    return {
      explanation: `You've completed every lesson in ${courseTitle}. Nice work — consider exploring a related course to keep building on what you've learned.`,
      studyTips: [],
    };
  }
  return {
    explanation: `Next up: "${nextLesson.title}" in ${nextLesson.moduleTitle}. This continues your progress in ${courseTitle}.`,
    studyTips: [],
  };
}

/**
 * "What should I learn next?" — grounded in real enrollment/progress
 * data. The database decides WHAT the next lesson is (via
 * resolveResumeLesson, the same deterministic logic the learning page
 * itself uses); the AI only explains WHY and HOW, and never names a
 * lesson or course the system didn't already determine.
 */
export async function getLearningCoachAdvice(
  studentId: string,
  courseSlug: string,
  deps: LearningCoachDeps = {},
): Promise<LearningCoachResult> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new EnrollmentCourseNotFoundError(courseSlug);
  }

  const enrollment = await findEnrollment(studentId, course.id);
  if (!enrollment) {
    throw new NotEnrolledError(courseSlug);
  }

  const [syllabus, progress, resumeState] = await Promise.all([
    getCourseModulesWithLessons(course.id),
    calculateCourseProgress(studentId, course.id),
    resolveResumeLesson(studentId, course.id),
  ]);

  const moduleTitleForLesson = (lessonId: string) =>
    syllabus.find((module) => module.lessons.some((lesson) => lesson.id === lessonId))?.title ?? "";

  const nextLesson: LearningCoachLessonRef | null =
    !resumeState.isCourseComplete && resumeState.lesson
      ? {
          slug: resumeState.lesson.slug,
          title: resumeState.lesson.title,
          moduleTitle: moduleTitleForLesson(resumeState.lesson.id),
        }
      : null;

  const suggestedCourses: LearningCoachCourseRef[] = resumeState.isCourseComplete
    ? (await getRelatedCourses(course, 3)).map((related) => ({
        slug: related.slug,
        title: related.title,
      }))
    : [];

  const provider = deps.provider ?? getAIProvider();

  const completedTitles = syllabus
    .flatMap((module) => module.lessons)
    .filter((lesson) => progress.completedLessonSlugs.includes(lesson.slug))
    .map((lesson) => lesson.title);

  const userContent =
    `Course: ${course.title}\n` +
    `Progress: ${progress.completedLessons}/${progress.totalLessons} lessons complete (${progress.percentage}%)\n` +
    `Completed so far: ${completedTitles.length > 0 ? completedTitles.join(", ") : "(none yet)"}\n\n` +
    (nextLesson
      ? `Next lesson (already determined by the system): "${nextLesson.title}" in module "${nextLesson.moduleTitle}"\n` +
        `Next lesson content:\n${truncate(resumeState.lesson?.content ?? "", 800)}\n`
      : `The student has completed every lesson in this course.\n`) +
    `\nWrite the explanation and study tips for this student now.`;

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(deps.recentTutorHistory ?? []).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: userContent },
  ];

  const completion = await provider.generateCompletion({ messages, temperature: 0.3 });

  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : learningCoachModelResponseSchema.safeParse(parsed);

  const { explanation, studyTips }: LearningCoachModelResponse =
    validated && validated.success ? validated.data : buildFallback(nextLesson, course.title);

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    isCourseComplete: resumeState.isCourseComplete,
    nextLesson,
    explanation,
    studyTips,
    suggestedCourses,
    answerSource: validated && validated.success ? "ai" : "fallback",
  };
}
