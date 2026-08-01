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
  expiresAt: number;
}

const TTL_MS = 15 * 60 * 1000;

/**
 * In-memory, single-process, one-shot store for a just-generated practice
 * question's answer key. Deliberately never sent to the client — see
 * practiceRequestSchema's generate response, which omits correctChoiceIndex
 * and modelAnswer. Same trade-off already accepted for src/lib/ai-request-guard.ts:
 * the smallest thing that fits a single dev/local instance, not a
 * distributed cache. Swap for a shared store before running more than one
 * instance in production.
 */
const store = new Map<string, PendingPractice>();

function sweepExpired(now: number): void {
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) {
      store.delete(id);
    }
  }
}

export function storePendingPractice(data: Omit<PendingPractice, "expiresAt">): string {
  const now = Date.now();
  sweepExpired(now);
  const practiceId = crypto.randomUUID();
  store.set(practiceId, { ...data, expiresAt: now + TTL_MS });
  return practiceId;
}

/**
 * Consumes (deletes) a pending practice question. Returns undefined for an
 * unknown id, an expired id, or an id that belongs to a different student —
 * the caller can't tell which, which is the point (no information leak
 * about other students' practice sessions).
 */
export function takePendingPractice(practiceId: string, studentId: string): PendingPractice | undefined {
  const entry = store.get(practiceId);
  if (!entry) return undefined;
  store.delete(practiceId);
  if (entry.expiresAt < Date.now()) return undefined;
  if (entry.studentId !== studentId) return undefined;
  return entry;
}

/** Test-only: clears in-memory store state between test cases. */
export function __resetPracticeStoreForTests(): void {
  store.clear();
}
