import { getAIProvider } from "@/ai/get-ai-provider";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider, ChatMessage } from "@/ai/provider";
import {
  learningCoachModelResponseSchema,
  type LearningCoachModelResponse,
} from "@/lib/validation/learning-coach";
import type { TutorHistoryTurn } from "@/lib/validation/tutor";
import { LANGUAGE_INSTRUCTIONS, type Locale } from "@/i18n/config";
import { getCourseModulesWithLessons } from "@/server/course-content";
import { getCourseBySlug, getRelatedCourses } from "@/server/courses";
import { recordLearningActivity } from "@/server/learning/activity";
import { findEnrollment } from "@/server/learning/enrollment";
import { EnrollmentCourseNotFoundError, NotEnrolledError } from "@/server/learning/errors";
import { getLearningSignals } from "@/server/learning/learning-signals";
import { calculateCourseProgress } from "@/server/learning/progress";
import type { ReviewCandidate } from "@/server/learning/review-recommendations";

export interface LearningCoachLessonRef {
  slug: string;
  title: string;
  moduleTitle: string;
}

export interface LearningCoachCourseRef {
  slug: string;
  title: string;
}

export interface LearningCoachSignalsSummary {
  completedLessons: number;
  totalLessons: number;
  recentPracticeAccuracy: number | null;
  recentPracticeAttempts: number;
}

export interface LearningCoachResult {
  courseSlug: string;
  courseTitle: string;
  isCourseComplete: boolean;
  /** Sourced entirely from getLearningSignals (resolveResumeLesson) â€” never from the AI. Null once the course is complete. */
  nextLesson: LearningCoachLessonRef | null;
  explanation: string;
  studyTips: string[];
  practiceSuggestion: string | null;
  /** Sourced entirely from getRelatedCourses â€” never from the AI. Only populated when the course is complete. */
  suggestedCourses: LearningCoachCourseRef[];
  /** Sourced entirely from getReviewCandidates (deterministic rules) â€” never from the AI. */
  reviewCandidates: ReviewCandidate[];
  signals: LearningCoachSignalsSummary;
  answerSource: "ai" | "fallback";
}

export interface LearningCoachDeps {
  provider?: AIProvider;
  recentTutorHistory?: TutorHistoryTurn[];
  locale?: Locale;
}

const SYSTEM_PROMPT = `You are the NovaTok AI Learning Coach. A specific next lesson (or course-complete state) has
ALREADY been determined by the system from the student's real progress â€” your only job is to
explain, concretely and encouragingly, why this comes next and how to approach it well. Ground
your explanation in the actual lesson content and the student's completed lessons given below.
Never suggest a different lesson or course than the one you're given, and never invent course or
lesson names of your own.

You are also given the student's recent practice accuracy and a list of lessons the system has
flagged as possibly needing review (determined by fixed rules, not by you). You may reference
these in your explanation or practice suggestion, but you did not determine that list and must
not add to it, remove from it, or invent a different one.

If prior Tutor conversation is included, treat it only as context for what the student has
recently been asking about â€” it is not a source of course facts.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{ "explanation": string, "studyTips": string[], "practiceSuggestion": string | null }

"explanation" is 2-4 sentences. "studyTips" is 0-5 short, concrete tips for approaching this
specific material well â€” [] if you don't have any worth giving. "practiceSuggestion" is one short
sentence suggesting what to practice next (e.g. referencing a flagged review lesson), or null if
you don't have a useful suggestion.`;

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}â€¦` : text;
}

function buildFallback(
  nextLesson: LearningCoachLessonRef | null,
  courseTitle: string,
): { explanation: string; studyTips: string[]; practiceSuggestion: string | null } {
  if (!nextLesson) {
    return {
      explanation: `You've completed every lesson in ${courseTitle}. Nice work â€” consider exploring a related course to keep building on what you've learned.`,
      studyTips: [],
      practiceSuggestion: null,
    };
  }
  return {
    explanation: `Next up: "${nextLesson.title}" in ${nextLesson.moduleTitle}. This continues your progress in ${courseTitle}.`,
    studyTips: [],
    practiceSuggestion: null,
  };
}

/**
 * "What should I learn next?" â€” grounded in real enrollment/progress/
 * activity data. The database decides WHAT the next lesson is and WHICH
 * lessons may need review (via getLearningSignals, which composes
 * resolveResumeLesson and the deterministic review-candidate rules); the
 * AI only explains WHY and HOW, and never names a lesson, course, or
 * review candidate the system didn't already determine.
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

  await recordLearningActivity({ studentId, courseId: course.id, type: "COACH_REQUEST" });

  const [syllabus, signals, progress] = await Promise.all([
    getCourseModulesWithLessons(course.id),
    getLearningSignals(studentId, course.id),
    calculateCourseProgress(studentId, course.id),
  ]);

  const flatLessons = syllabus.flatMap((learningModule) => learningModule.lessons);
  const moduleTitleForLessonSlug = (lessonSlug: string) =>
    syllabus.find((learningModule) => learningModule.lessons.some((lesson) => lesson.slug === lessonSlug))
      ?.title ?? "";

  const nextLesson: LearningCoachLessonRef | null = signals.nextLesson
    ? {
        slug: signals.nextLesson.slug,
        title: signals.nextLesson.title,
        moduleTitle: moduleTitleForLessonSlug(signals.nextLesson.slug),
      }
    : null;

  const nextLessonContent = signals.nextLesson
    ? (flatLessons.find((lesson) => lesson.slug === signals.nextLesson?.slug)?.content ?? "")
    : "";

  const suggestedCourses: LearningCoachCourseRef[] = signals.isCourseComplete
    ? (await getRelatedCourses(course, 3)).map((related) => ({ slug: related.slug, title: related.title }))
    : [];

  const provider = deps.provider ?? getAIProvider();

  const completedTitles = flatLessons
    .filter((lesson) => progress.completedLessonSlugs.includes(lesson.slug))
    .map((lesson) => lesson.title);

  const accuracyText =
    signals.recentPracticeAccuracy === null
      ? "no recent practice attempts yet"
      : `${Math.round(signals.recentPracticeAccuracy * 100)}% correct over ${signals.recentPracticeAttempts} recent attempts`;
  const reviewText =
    signals.lessonsNeedingPractice.length > 0
      ? signals.lessonsNeedingPractice
          .map((candidate) => `"${candidate.lessonTitle}" (${candidate.reason})`)
          .join("; ")
      : "(none)";

  const userContent =
    `Course: ${course.title}\n` +
    `Progress: ${progress.completedLessons}/${progress.totalLessons} lessons complete (${progress.percentage}%)\n` +
    `Completed so far: ${completedTitles.length > 0 ? completedTitles.join(", ") : "(none yet)"}\n` +
    `Recent practice: ${accuracyText}\n` +
    `Lessons the system flagged as possibly needing review: ${reviewText}\n\n` +
    (nextLesson
      ? `Next lesson (already determined by the system): "${nextLesson.title}" in module "${nextLesson.moduleTitle}"\n` +
        `Next lesson content:\n${truncate(nextLessonContent, 800)}\n`
      : `The student has completed every lesson in this course.\n`) +
    `\nWrite the explanation, study tips, and an optional practice suggestion for this student now.`;

  const messages: ChatMessage[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTIONS[deps.locale ?? "en"]}` },
    ...(deps.recentTutorHistory ?? []).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: userContent },
  ];

  const completion = await provider.generateCompletion({ messages, temperature: 0.3 });

  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : learningCoachModelResponseSchema.safeParse(parsed);

  const { explanation, studyTips, practiceSuggestion }: LearningCoachModelResponse =
    validated && validated.success ? validated.data : buildFallback(nextLesson, course.title);

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    isCourseComplete: signals.isCourseComplete,
    nextLesson,
    explanation,
    studyTips,
    practiceSuggestion,
    suggestedCourses,
    reviewCandidates: signals.lessonsNeedingPractice,
    signals: {
      completedLessons: signals.completedLessons,
      totalLessons: signals.totalLessons,
      recentPracticeAccuracy: signals.recentPracticeAccuracy,
      recentPracticeAttempts: signals.recentPracticeAttempts,
    },
    answerSource: validated && validated.success ? "ai" : "fallback",
  };
}
