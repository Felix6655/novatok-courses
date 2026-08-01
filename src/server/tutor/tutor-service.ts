import { getAIProvider } from "@/ai/get-ai-provider";
import type { AIProvider } from "@/ai/provider";
import type { TutorModelResponse, TutorRequest, TutorResponseMode } from "@/lib/validation/tutor";
import { getCourseModulesWithLessons } from "@/server/course-content";
import { getCourseBySlug } from "@/server/courses";
import { getRelevantLessons } from "@/server/tutor/content-retrieval";
import { TutorCourseNotFoundError, TutorNoContentError } from "@/server/tutor/errors";
import { generateTutorAnswer, type RelevantLessonRef } from "@/server/tutor/tutor-response";

export interface TutorResult {
  courseSlug: string;
  courseTitle: string;
  question: string;
  responseMode: TutorResponseMode;
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
 * Orchestrates the Tutor pipeline: load the real course -> retrieve real
 * lesson content relevant to the question -> either redirect
 * deterministically (question is off-topic) or ask the AI provider to
 * answer, grounded in that content -> return a validated structured
 * result. Never calls the AI provider for a question that's already been
 * deterministically identified as out of scope.
 */
export async function getTutorAnswer(
  request: TutorRequest,
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

  const relevance = await getRelevantLessons(course.id, request.question);

  if (relevance.outOfScope) {
    return {
      courseSlug: course.slug,
      courseTitle: course.title,
      question: request.question,
      responseMode: request.responseMode,
      answer: buildRedirectAnswer(course.title),
      grounded: false,
      relevantLessons: [],
      outOfScope: true,
      practiceQuestion: null,
      answerSource: "redirect",
    };
  }

  const provider = deps.provider ?? getAIProvider();

  const tutorAnswer = await generateTutorAnswer(
    {
      courseTitle: course.title,
      syllabus,
      candidateLessons: relevance.lessons,
      question: request.question,
      responseMode: request.responseMode,
    },
    provider,
  );

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    question: request.question,
    responseMode: request.responseMode,
    answer: tutorAnswer.answer,
    grounded: !tutorAnswer.outOfScope && relevance.lessons.length > 0,
    relevantLessons: tutorAnswer.relevantLessons,
    outOfScope: tutorAnswer.outOfScope,
    practiceQuestion: tutorAnswer.practiceQuestion,
    answerSource: tutorAnswer.answerSource,
  };
}
