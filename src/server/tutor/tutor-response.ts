import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider, ChatMessage } from "@/ai/provider";
import {
  tutorModelResponseSchema,
  type TutorHistoryTurn,
  type TutorModelResponse,
  type TutorResponseMode,
} from "@/lib/validation/tutor";
import type { SerializedLesson, SerializedModuleWithLessons } from "@/types/course";
import { LANGUAGE_INSTRUCTIONS, type Locale } from "@/i18n/config";

export interface RelevantLessonRef {
  slug: string;
  title: string;
  moduleTitle: string;
}

export interface TutorAnswer {
  answer: string;
  relevantLessons: RelevantLessonRef[];
  outOfScope: boolean;
  practiceQuestion: TutorModelResponse["practiceQuestion"];
  answerSource: "ai" | "fallback";
}

const MAX_EXCERPT_LENGTH = 800;

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}â€¦` : text;
}

const MODE_INSTRUCTIONS: Record<TutorResponseMode, string> = {
  NORMAL: "Answer the student's question clearly, grounded in the course material below.",
  SIMPLE:
    "Answer as simply as possible, as if explaining to a complete beginner, grounded in the course material below.",
  EXAMPLE:
    "Answer primarily with a concrete, worked example that illustrates the concept, grounded in the course material below.",
  PRACTICE:
    "Instead of a direct explanation, write one practice question (with an answer and a short " +
    "explanation) that tests understanding of the course material below, and populate the " +
    "practiceQuestion field with it. Keep \"answer\" to a one-sentence introduction of the practice question.",
};

const SYSTEM_PROMPT = `You are the NovaTok AI Tutor for a specific course. The course material provided to you
is authoritative for any claim about what this course covers or teaches â€” never say the course
covers something that isn't in the material provided. If the question can't reasonably be
answered from the course material and closely related foundational knowledge, say so honestly
and suggest what part of the course might help instead, rather than inventing course content.

If a prior conversation is included, treat it as context for what's already been discussed, not as
a source of course facts â€” the lesson material below is still the only authoritative source for
what this course teaches, even if something in the prior conversation suggested otherwise.

If a student learning context is included, you may use it to answer questions like "am I ready
for the next lesson?", "I'm still confused", or "can we practice this again?" â€” but always present
it as guidance, never as an authoritative record. The platform's own progress tracking, not your
judgment, is what actually determines completion and what comes next.

Respond with ONLY a JSON object of this exact shape, no prose, no markdown fences:

{
  "answer": string,
  "relevantLessonSlugs": string[],
  "outOfScope": boolean,
  "practiceQuestion": null | { "question": string, "choices": string[] | null, "answer": string, "explanation": string }
}

"relevantLessonSlugs" must only contain slugs copied exactly from the lesson list you're given.
Set "outOfScope" to true only if the question has nothing to do with this course's subject matter
at all â€” not merely because the exact wording isn't in the material. "practiceQuestion" must stay
null unless you were explicitly asked to generate one.`;

/**
 * A small, bounded slice of a student's real progress in this course â€”
 * never the full learning record. Sourced from src/server/learning/learning-signals.ts
 * only when the caller is enrolled; entirely absent otherwise. Guidance
 * only, per the system prompt above â€” the model cannot use this to change
 * authoritative progress state, it can only reference it in prose.
 */
export interface TutorLearningContext {
  completedLessonCount: number;
  totalLessons: number;
  recentPracticeAccuracy: number | null;
  reviewLessonTitles: string[];
}

interface BuildPromptParams {
  courseTitle: string;
  syllabus: SerializedModuleWithLessons[];
  candidateLessons: SerializedLesson[];
  question: string;
  responseMode: TutorResponseMode;
  /** When set, candidateLessons[0] is treated as the lesson the student is currently viewing. */
  pinnedLessonSlug?: string | null;
  /** Bounded prior turns for light follow-up context â€” see tutorRequestSchema. */
  history?: TutorHistoryTurn[];
  /** Present only when the student is enrolled in this course. */
  learningContext?: TutorLearningContext | null;
  locale?: Locale;
}

function buildLearningContextSection(context?: TutorLearningContext | null): string {
  if (!context) return "";

  const accuracyText =
    context.recentPracticeAccuracy === null
      ? "no recent practice attempts yet"
      : `${Math.round(context.recentPracticeAccuracy * 100)}% recent practice accuracy`;
  const reviewText =
    context.reviewLessonTitles.length > 0
      ? ` Lessons that might be worth reviewing: ${context.reviewLessonTitles.join(", ")}.`
      : "";

  return (
    "\n\nStudent learning context (guidance only, not authoritative): " +
    `${context.completedLessonCount}/${context.totalLessons} lessons completed in this course, ` +
    `${accuracyText}.${reviewText}`
  );
}

function buildLessonSection(params: BuildPromptParams): string {
  if (params.candidateLessons.length === 0) {
    return "Relevant lesson material:\n(no directly relevant lesson content found)";
  }

  const format = (lesson: SerializedLesson) =>
    `slug: "${lesson.slug}" | title: "${lesson.title}"\n${truncate(lesson.content, MAX_EXCERPT_LENGTH)}`;

  if (params.pinnedLessonSlug && params.candidateLessons[0]?.slug === params.pinnedLessonSlug) {
    const [current, ...nearby] = params.candidateLessons;
    const nearbyText = nearby.length > 0 ? nearby.map(format).join("\n\n") : "(none)";
    return (
      `Current lesson (the student is asking from this lesson â€” treat it as primary context):\n${format(current)}\n\n` +
      `Other lessons in the same module:\n${nearbyText}`
    );
  }

  return `Relevant lesson material:\n${params.candidateLessons.map(format).join("\n\n")}`;
}

/** Pure prompt construction â€” separately testable without an AI call. */
export function buildTutorPromptMessages(params: BuildPromptParams): ChatMessage[] {
  const syllabusText = params.syllabus
    .map((module) => `- ${module.title}: ${module.lessons.map((l) => l.title).join(", ")}`)
    .join("\n");

  const userContent =
    `Course: ${params.courseTitle}\n\n` +
    `Course structure:\n${syllabusText || "(no modules yet)"}\n\n` +
    `${buildLessonSection(params)}\n\n` +
    `Student question: ${params.question}\n\n` +
    `Instructions: ${MODE_INSTRUCTIONS[params.responseMode]}` +
    buildLearningContextSection(params.learningContext);

  const historyMessages: ChatMessage[] = (params.history ?? []).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  return [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTIONS[params.locale ?? "en"]}` },
    ...historyMessages,
    { role: "user", content: userContent },
  ];
}

function moduleTitleForLesson(
  slug: string,
  syllabus: SerializedModuleWithLessons[],
): string | undefined {
  return syllabus.find((module) => module.lessons.some((lesson) => lesson.slug === slug))?.title;
}

function toRefs(
  lessons: SerializedLesson[],
  syllabus: SerializedModuleWithLessons[],
): RelevantLessonRef[] {
  return lessons.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    moduleTitle: moduleTitleForLesson(lesson.slug, syllabus) ?? "",
  }));
}

/**
 * Deterministic answer used whenever the model's output is missing,
 * unparseable, or fails validation â€” it never fabricates an explanation,
 * it just surfaces the real retrieved lesson content directly.
 */
function buildFallbackAnswer(
  candidateLessons: SerializedLesson[],
  syllabus: SerializedModuleWithLessons[],
): TutorAnswer {
  const relevantLessons = toRefs(candidateLessons, syllabus);
  const answer =
    relevantLessons.length > 0
      ? `Here's what the course covers related to your question: ${candidateLessons
          .map((lesson) => `"${lesson.title}" â€” ${lesson.summary}`)
          .join("; ")}.`
      : "I wasn't able to generate an answer right now. Try asking about a specific lesson in this course.";

  return {
    answer,
    relevantLessons,
    outOfScope: false,
    practiceQuestion: null,
    answerSource: "fallback",
  };
}

/**
 * Asks the AI provider to answer a Tutor question grounded in the given
 * candidate lessons, then grounds the result: any lesson slug the model
 * cites that isn't one of `candidateLessons` is dropped. If the model's
 * output can't be used at all, falls back to presenting the real lesson
 * content directly rather than failing the request.
 */
export async function generateTutorAnswer(
  params: BuildPromptParams,
  provider: AIProvider,
): Promise<TutorAnswer> {
  const completion = await provider.generateCompletion({
    messages: buildTutorPromptMessages(params),
    temperature: 0.2,
  });

  const parsed = parseJsonLoosely(completion);
  const validated = parsed === undefined ? undefined : tutorModelResponseSchema.safeParse(parsed);

  if (!validated || !validated.success) {
    return buildFallbackAnswer(params.candidateLessons, params.syllabus);
  }

  if (validated.data.outOfScope) {
    return {
      answer: validated.data.answer,
      relevantLessons: [],
      outOfScope: true,
      practiceQuestion: null,
      answerSource: "ai",
    };
  }

  const candidateSlugs = new Set(params.candidateLessons.map((lesson) => lesson.slug));
  const groundedSlugs = validated.data.relevantLessonSlugs.filter((slug) => candidateSlugs.has(slug));
  const groundedLessons = params.candidateLessons.filter((lesson) => groundedSlugs.includes(lesson.slug));

  const relevantLessons = toRefs(
    groundedLessons.length > 0 ? groundedLessons : params.candidateLessons,
    params.syllabus,
  );

  return {
    answer: validated.data.answer,
    relevantLessons,
    outOfScope: false,
    practiceQuestion: validated.data.practiceQuestion,
    answerSource: "ai",
  };
}
