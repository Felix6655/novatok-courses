import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetPracticeStoreForTests,
  storePendingPractice,
  takePendingPractice,
  type PendingPractice,
} from "@/server/learning/practice-store";

function pendingData(overrides: Partial<Omit<PendingPractice, "expiresAt">> = {}) {
  return {
    studentId: "student-1",
    courseId: "course-1",
    courseSlug: "javascript-fundamentals",
    lessonId: "lesson-1",
    lessonSlug: "variables-and-data-types",
    lessonTitle: "Variables and Data Types",
    questionType: "MULTIPLE_CHOICE" as const,
    question: "What keyword declares a constant?",
    choices: ["var", "let", "const"],
    correctChoiceIndex: 2,
    modelAnswer: null,
    explanation: "const declares a binding that can't be reassigned.",
    ...overrides,
  };
}

beforeEach(() => {
  __resetPracticeStoreForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("practice-store", () => {
  it("returns the stored data for the correct student", () => {
    const practiceId = storePendingPractice(pendingData());
    const result = takePendingPractice(practiceId, "student-1");
    expect(result?.question).toBe("What keyword declares a constant?");
    expect(result?.correctChoiceIndex).toBe(2);
  });

  it("is one-shot: a second take of the same practiceId returns undefined", () => {
    const practiceId = storePendingPractice(pendingData());
    takePendingPractice(practiceId, "student-1");
    const second = takePendingPractice(practiceId, "student-1");
    expect(second).toBeUndefined();
  });

  it("returns undefined for an unknown practiceId", () => {
    expect(takePendingPractice("not-a-real-id", "student-1")).toBeUndefined();
  });

  it("returns undefined when a different student attempts to take it (cross-student protection)", () => {
    const practiceId = storePendingPractice(pendingData({ studentId: "student-1" }));
    const result = takePendingPractice(practiceId, "student-2");
    expect(result).toBeUndefined();
  });

  it("a wrong-student guess also consumes the entry (one-shot regardless of caller, since ids are unguessable UUIDs)", () => {
    const practiceId = storePendingPractice(pendingData({ studentId: "student-1" }));
    const wrongStudentAttempt = takePendingPractice(practiceId, "student-2");
    expect(wrongStudentAttempt).toBeUndefined();

    const ownerAttempt = takePendingPractice(practiceId, "student-1");
    expect(ownerAttempt).toBeUndefined();
  });

  it("returns undefined once the entry has expired", () => {
    vi.useFakeTimers();
    const practiceId = storePendingPractice(pendingData());
    vi.advanceTimersByTime(16 * 60 * 1000);
    const result = takePendingPractice(practiceId, "student-1");
    expect(result).toBeUndefined();
  });
});
