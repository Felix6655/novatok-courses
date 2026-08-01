import { getCourseLessonsFlat } from "@/server/course-content";
import type { SerializedLesson } from "@/types/course";

/**
 * Common English stopwords plus Tutor-interaction meta words ("explain",
 * "practice", "next"...) that carry no topical signal about which lesson
 * a question relates to. Filtered out before scoring.
 */
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "in", "on", "at", "for", "with", "from", "into", "about",
  "this", "that", "these", "those", "it", "its", "my", "your", "you", "i",
  "me", "we", "us", "they", "them", "and", "or", "but", "if", "so", "than",
  "then", "what", "why", "how", "when", "where", "who", "which", "can",
  "could", "should", "would", "will", "shall", "do", "does", "did", "not",
  "no", "yes", "please", "help", "explain", "simpler", "simple", "example",
  "examples", "give", "next", "study", "learn", "learning", "understand",
  "understanding", "course", "lesson", "tutor", "quiz", "practice",
  "question", "questions", "more", "some", "any", "just", "like", "want",
  "need", "am", "im",
]);

/**
 * Extracts the topical keywords from a question, dropping stopwords and
 * short words. An empty result means the question carries no specific
 * topical signal (e.g. "what should I study next?") — callers should
 * treat that as a general/meta question, not as evidence the question is
 * unrelated to the course.
 */
export function extractKeywords(question: string): string[] {
  const words = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return [...new Set(words.filter((word) => word.length >= 4 && !STOPWORDS.has(word)))];
}

export interface ScorableLesson {
  title: string;
  summary: string;
  content: string;
}

/** Pure relevance score for one lesson against extracted keywords. */
export function scoreLessonAgainstKeywords(lesson: ScorableLesson, keywords: string[]): number {
  const haystacks: Array<{ text: string; weight: number }> = [
    { text: lesson.title, weight: 3 },
    { text: lesson.summary, weight: 2 },
    { text: lesson.content, weight: 1 },
  ];

  let score = 0;
  for (const keyword of keywords) {
    const needle = keyword.toLowerCase();
    if (!needle) continue;
    for (const { text, weight } of haystacks) {
      if (text.toLowerCase().includes(needle)) {
        score += weight;
      }
    }
  }
  return score;
}

export interface LessonRelevanceResult {
  /** Top-scored lessons for this question, highest first. Empty if the course has no content. */
  lessons: SerializedLesson[];
  /**
   * True when the question had extractable keywords but none of them
   * matched anything in the course's content — a strong, deterministic
   * signal the question is off-topic for this course.
   */
  outOfScope: boolean;
  /** True when the question had no extractable topical keywords (e.g. "what's next?"). */
  isMetaQuestion: boolean;
}

const MAX_RELEVANT_LESSONS = 3;

/**
 * Retrieves and ranks a course's real lessons against a student question.
 * PostgreSQL (via getCourseLessonsFlat) is the only source of lesson
 * content — this function only selects and orders what already exists.
 */
export async function getRelevantLessons(
  courseId: string,
  question: string,
  limit = MAX_RELEVANT_LESSONS,
): Promise<LessonRelevanceResult> {
  const lessons = await getCourseLessonsFlat(courseId);
  const keywords = extractKeywords(question);

  if (lessons.length === 0) {
    return { lessons: [], outOfScope: false, isMetaQuestion: keywords.length === 0 };
  }

  if (keywords.length === 0) {
    // General/meta question (e.g. "what should I study next?") — no
    // specific lesson is more relevant than another, so surface the
    // course's early lessons as a reasonable default context.
    return { lessons: lessons.slice(0, limit), outOfScope: false, isMetaQuestion: true };
  }

  const scored = lessons
    .map((lesson) => ({ lesson, score: scoreLessonAgainstKeywords(lesson, keywords) }))
    .sort((a, b) => b.score - a.score);

  const bestScore = scored[0]?.score ?? 0;
  if (bestScore === 0) {
    return { lessons: [], outOfScope: true, isMetaQuestion: false };
  }

  return {
    lessons: scored
      .filter(({ score }) => score > 0)
      .slice(0, limit)
      .map(({ lesson }) => lesson),
    outOfScope: false,
    isMetaQuestion: false,
  };
}
