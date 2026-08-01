import { getAIProvider } from "@/ai/get-ai-provider";
import type { AIProvider } from "@/ai/provider";
import type { TutorModelResponse, TutorRequest, TutorResponseMode } from "@/lib/validation/tutor";
import { getCourseModulesWithLessons } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";
import { recordLearningActivity } from "@/server/learning/activity";
import { findEnrollment } from "@/server/learning/enrollment";
import { getLearningSignals } from "@/server/learning/learning-signals";
import { getPinnedLessonContext, getRelevantLessons } from "@/server/tutor/content-retrieval";
import {
  TutorCourseNotFoundError,
  TutorLessonNotFoundError,
  TutorNoContentError,
} from "@/server/tutor/errors";
import {
  generateTutorAnswer,
  type RelevantLessonRef,
  type TutorLearningContext,
} from "@/server/tutor/tutor-response";
import type { SerializedLesson } from "@/types/course";

const MAX_REVIEW_TITLES_IN_TUTOR_CONTEXT = 2;

export interface TutorResult {
  courseSlug: string;
  courseTitle: string;
  question: string;
  responseMode: TutorResponseMode;
  /** The lesson the question was pinned to, if any — echoes request.lessonSlug once verified. */
  pinnedLessonSlug: string | null;
  answer: string;
  grounded: boolean;
  relevantLessons: RelevantLessonRef[];
  outOfScope: boolean;
  practiceQuestion: TutorModelResponse["practiceQuestion"];
  answerSource: "ai" | "fallback" | "redirect";
}

export interface TutorServiceDeps {
  /** Injectable for tests; defaults to the env-configured provider. */
  provider?: AIProvider;
}

function buildRedirectAnswer(courseTitle: string): string {
  return (
    `That's outside what's covered in ${courseTitle}. I can help with questions about this ` +
    "course's material — try asking about one of its lessons, or ask what to study next."
  );
}

/**
 * Orchestrates the Tutor pipeline: load the real course -> pin to a
 * specific lesson if one was requested, otherwise retrieve real lesson
 * content relevant to the question -> either redirect deterministically
 * (question is off-topic and no lesson was pinned) or ask the AI provider
 * to answer, grounded in that content -> return a validated structured
 * result. Never calls the AI provider for a question that's already been
 * deterministically identified as out of scope.
 *
 * `studentId` is optional — the Tutor remains fully usable by a student who
 * isn't enrolled in the course (Sprint 3/4/5 behavior, unchanged). When
 * present, two things happen in addition: (1) if the student is enrolled,
 * a small bounded learning-state summary (see TutorLearningContext) is
 * added to the prompt so the Tutor can sensibly answer things like "am I
 * ready for the next lesson?"; (2) one TUTOR_QUESTION LearningActivity is
 * recorded regardless of enrollment, with bounded metadata only (the
 * response mode) — never the question text itself.
 */
export async function getTutorAnswer(
  request: TutorRequest,
  studentId?: string,
  deps: TutorServiceDeps = {},
): Promise<TutorResult> {
  const course = await getCourseBySlug(request.courseSlug);
  if (!course) {
    throw new TutorCourseNotFoundError(request.courseSlug);
  }

  const syllabus = await getCourseModulesWithLessons(course.id);
  const totalLessons = syllabus.reduce((sum, module) => sum + module.lessons.length, 0);
  if (totalLessons === 0) {
    throw new TutorNoContentError(request.courseSlug);
  }

  let candidateLessons: SerializedLesson[];
  let outOfScope = false;
  let pinnedLessonId: string | null = null;

  if (request.lessonSlug) {
    const pinned = await getPinnedLessonContext(course.id, request.lessonSlug);
    if (!pinned) {
      throw new TutorLessonNotFoundError(request.courseSlug, request.lessonSlug);
    }
    // A student who explicitly opened a lesson and asked about it has,
    // by construction, asked an in-scope question — skip the keyword
    // out-of-scope check entirely for pinned-lesson requests.
    candidateLessons = [pinned.pinnedLesson, ...pinned.nearbyLessons];
    pinnedLessonId = pinned.pinnedLesson.id;
  } else {
    const relevance = await getRelevantLessons(course.id, request.question);
    outOfScope = relevance.outOfScope;
    candidateLessons = relevance.lessons;
  }

  if (studentId) {
    await recordLearningActivity({
      studentId,
      courseId: course.id,
      lessonId: pinnedLessonId,
      type: "TUTOR_QUESTION",
      metadata: { responseMode: request.responseMode },
    });
  }

  if (outOfScope) {
    return {
      courseSlug: course.slug,
      courseTitle: course.title,
      question: request.question,
      responseMode: request.responseMode,
      pinnedLessonSlug: null,
      answer: buildRedirectAnswer(course.title),
      grounded: false,
      relevantLessons: [],
      outOfScope: true,
      practiceQuestion: null,
      answerSource: "redirect",
    };
  }

  const provider = deps.provider ?? getAIProvider();

  let learningContext: TutorLearningContext | null = null;
  if (studentId) {
    const enrollment = await findEnrollment(studentId, course.id);
    if (enrollment) {
      const signals = await getLearningSignals(studentId, course.id);
      learningContext = {
        completedLessonCount: signals.completedLessons,
        totalLessons: signals.totalLessons,
        recentPracticeAccuracy: signals.recentPracticeAccuracy,
        reviewLessonTitles: signals.lessonsNeedingPractice
          .slice(0, MAX_REVIEW_TITLES_IN_TUTOR_CONTEXT)
          .map((candidate) => candidate.lessonTitle),
      };
    }
  }

  const tutorAnswer = await generateTutorAnswer(
    {
      courseTitle: course.title,
      syllabus,
      candidateLessons,
      question: request.question,
      responseMode: request.responseMode,
      pinnedLessonSlug: request.lessonSlug ?? null,
      history: request.history,
      learningContext,
    },
    provider,
  );

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    question: request.question,
    responseMode: request.responseMode,
    pinnedLessonSlug: request.lessonSlug ?? null,
    answer: tutorAnswer.answer,
    grounded: !tutorAnswer.outOfScope && candidateLessons.length > 0,
    relevantLessons: tutorAnswer.relevantLessons,
    outOfScope: tutorAnswer.outOfScope,
    practiceQuestion: tutorAnswer.practiceQuestion,
    answerSource: tutorAnswer.answerSource,
  };
}
