import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteMany = vi.fn();
const create = vi.fn();
const updateMany = vi.fn();
const findUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    practiceSession: {
      deleteMany: (...args: unknown[]) => deleteMany(...args),
      create: (...args: unknown[]) => create(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
      findUnique: (...args: unknown[]) => findUnique(...args),
    },
  },
}));

const { storePendingPractice, takePendingPractice } = await import("@/server/learning/practice-store");

function pendingData(overrides: Partial<Parameters<typeof storePendingPractice>[0]> = {}) {
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
  deleteMany.mockReset();
  create.mockReset();
  updateMany.mockReset();
  findUnique.mockReset();
});

describe("storePendingPractice", () => {
  it("opportunistically cleans up this student's own expired sessions before creating a new one", async () => {
    create.mockResolvedValue({ id: "practice-abc" });

    await storePendingPractice(pendingData());

    expect(deleteMany).toHaveBeenCalledWith({
      where: { studentId: "student-1", expiresAt: { lt: expect.any(Date) } },
    });
  });

  it("stores the full answer key and returns the new practiceId", async () => {
    create.mockResolvedValue({ id: "practice-abc" });

    const practiceId = await storePendingPractice(pendingData());

    expect(practiceId).toBe("practice-abc");
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: "student-1",
        courseId: "course-1",
        lessonId: "lesson-1",
        questionType: "MULTIPLE_CHOICE",
        choices: ["var", "let", "const"],
        correctChoiceIndex: 2,
        modelAnswer: null,
        explanation: "const declares a binding that can't be reassigned.",
        expiresAt: expect.any(Date),
      }),
    });
  });

  it("stores an empty choices array (not null) when generating a SHORT_ANSWER question", async () => {
    create.mockResolvedValue({ id: "practice-xyz" });

    await storePendingPractice(pendingData({ questionType: "SHORT_ANSWER", choices: null, correctChoiceIndex: null, modelAnswer: "A binding that can't be reassigned." }));

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ choices: [] }),
    });
  });
});

describe("takePendingPractice", () => {
  it("returns undefined without reading the row when the conditional update matches nothing", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    const result = await takePendingPractice("practice-abc", "student-1");

    expect(result).toBeUndefined();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("scopes the atomic consume to the given student, an unconsumed row, and a non-expired row", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await takePendingPractice("practice-abc", "student-1");

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "practice-abc",
        studentId: "student-1",
        consumedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { consumedAt: expect.any(Date) },
    });
  });

  it("returns the full question data (via course/lesson join) once successfully consumed", async () => {
    updateMany.mockResolvedValue({ count: 1 });
    findUnique.mockResolvedValue({
      studentId: "student-1",
      courseId: "course-1",
      lessonId: "lesson-1",
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: ["var", "let", "const"],
      correctChoiceIndex: 2,
      modelAnswer: null,
      explanation: "const declares a binding that can't be reassigned.",
      course: { slug: "javascript-fundamentals" },
      lesson: { slug: "variables-and-data-types", title: "Variables and Data Types" },
    });

    const result = await takePendingPractice("practice-abc", "student-1");

    expect(result).toEqual({
      studentId: "student-1",
      courseId: "course-1",
      courseSlug: "javascript-fundamentals",
      lessonId: "lesson-1",
      lessonSlug: "variables-and-data-types",
      lessonTitle: "Variables and Data Types",
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: ["var", "let", "const"],
      correctChoiceIndex: 2,
      modelAnswer: null,
      explanation: "const declares a binding that can't be reassigned.",
    });
  });

  it("maps an empty stored choices array back to null (SHORT_ANSWER)", async () => {
    updateMany.mockResolvedValue({ count: 1 });
    findUnique.mockResolvedValue({
      studentId: "student-1",
      courseId: "course-1",
      lessonId: "lesson-1",
      questionType: "SHORT_ANSWER",
      question: "What does const mean?",
      choices: [],
      correctChoiceIndex: null,
      modelAnswer: "A binding that can't be reassigned.",
      explanation: "...",
      course: { slug: "javascript-fundamentals" },
      lesson: { slug: "variables-and-data-types", title: "Variables and Data Types" },
    });

    const result = await takePendingPractice("practice-abc", "student-1");
    expect(result?.choices).toBeNull();
  });

  it("a wrong-student guess does not consume the real owner's row (ownership is enforced inside the atomic WHERE clause)", async () => {
    // studentId is part of the WHERE clause on the same UPDATE that flips consumedAt, so a
    // wrong-student attempt matches zero rows and leaves the real owner's session untouched —
    // stronger than Sprint 6's in-memory version, which consumed on any guess.
    updateMany.mockResolvedValue({ count: 0 });

    const result = await takePendingPractice("practice-abc", "student-2");

    expect(result).toBeUndefined();
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ studentId: "student-2" }) }),
    );
  });
});
