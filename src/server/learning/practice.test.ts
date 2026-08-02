import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIProvider } from "@/ai/provider";

const getCourseBySlug = vi.fn();
const getLessonByCourseAndSlug = vi.fn();
const findEnrollment = vi.fn();
const recordLearningActivity = vi.fn();
const storePendingPractice = vi.fn();
const takePendingPractice = vi.fn();
const getAIProvider = vi.fn();

vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
}));
vi.mock("@/server/course-content", () => ({
  getLessonByCourseAndSlug: (...args: unknown[]) => getLessonByCourseAndSlug(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
}));
vi.mock("@/server/learning/activity", () => ({
  recordLearningActivity: (...args: unknown[]) => recordLearningActivity(...args),
}));
vi.mock("@/server/learning/practice-store", () => ({
  storePendingPractice: (...args: unknown[]) => storePendingPractice(...args),
  takePendingPractice: (...args: unknown[]) => takePendingPractice(...args),
}));
vi.mock("@/ai/get-ai-provider", () => ({
  getAIProvider: (...args: unknown[]) => getAIProvider(...args),
}));

const { evaluatePracticeAttempt, generatePracticeQuestion } = await import("@/server/learning/practice");
const {
  EnrollmentCourseNotFoundError,
  LearningLessonNotFoundError,
  NotEnrolledError,
  PracticeNotFoundError,
} = await import("@/server/learning/errors");
const { InvalidModelOutputError } = await import("@/ai/errors");

const course = { id: "course-1", slug: "javascript-fundamentals", title: "JavaScript Fundamentals" };
const lesson = {
  id: "lesson-1",
  slug: "variables-and-data-types",
  title: "Variables and Data Types",
  content: "A variable is a named container for a value.",
};

function fakeProvider(response: string): AIProvider {
  return { name: "fake", generateCompletion: async () => response };
}

beforeEach(() => {
  getCourseBySlug.mockReset();
  getLessonByCourseAndSlug.mockReset();
  findEnrollment.mockReset();
  recordLearningActivity.mockReset();
  storePendingPractice.mockReset();
  takePendingPractice.mockReset();
  getAIProvider.mockReset();
});

describe("generatePracticeQuestion", () => {
  it("throws EnrollmentCourseNotFoundError for an unknown/unpublished course", async () => {
    getCourseBySlug.mockResolvedValue(null);
    await expect(
      generatePracticeQuestion("student-1", "not-a-real-course", "some-lesson", {
        provider: fakeProvider("{}"),
      }),
    ).rejects.toBeInstanceOf(EnrollmentCourseNotFoundError);
  });

  it("throws NotEnrolledError when the student isn't enrolled", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue(null);
    await expect(
      generatePracticeQuestion("student-1", "javascript-fundamentals", "variables-and-data-types", {
        provider: fakeProvider("{}"),
      }),
    ).rejects.toBeInstanceOf(NotEnrolledError);
  });

  it("throws LearningLessonNotFoundError for a lesson that doesn't belong to the course", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(null);
    await expect(
      generatePracticeQuestion("student-1", "javascript-fundamentals", "not-a-real-lesson", {
        provider: fakeProvider("{}"),
      }),
    ).rejects.toBeInstanceOf(LearningLessonNotFoundError);
  });

  it("throws InvalidModelOutputError when the AI response fails schema validation", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(lesson);

    await expect(
      generatePracticeQuestion("student-1", "javascript-fundamentals", "variables-and-data-types", {
        provider: fakeProvider("not valid json"),
      }),
    ).rejects.toBeInstanceOf(InvalidModelOutputError);
    expect(storePendingPractice).not.toHaveBeenCalled();
  });

  it("stores the full answer key server-side but never returns it to the caller", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findEnrollment.mockResolvedValue({ id: "enr-1" });
    getLessonByCourseAndSlug.mockResolvedValue(lesson);
    storePendingPractice.mockResolvedValue("practice-abc");

    const provider = fakeProvider(
      JSON.stringify({
        questionType: "MULTIPLE_CHOICE",
        question: "What keyword declares a constant?",
        choices: ["var", "let", "const"],
        correctChoiceIndex: 2,
        modelAnswer: null,
        explanation: "const can't be reassigned.",
      }),
    );

    const result = await generatePracticeQuestion(
      "student-1",
      "javascript-fundamentals",
      "variables-and-data-types",
      { provider },
    );

    expect(result).toEqual({
      practiceId: "practice-abc",
      courseSlug: "javascript-fundamentals",
      lessonSlug: "variables-and-data-types",
      lessonTitle: "Variables and Data Types",
      questionType: "MULTIPLE_CHOICE",
      question: "What keyword declares a constant?",
      choices: ["var", "let", "const"],
    });
    expect(result).not.toHaveProperty("correctChoiceIndex");
    expect(result).not.toHaveProperty("modelAnswer");

    expect(storePendingPractice).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: "student-1",
        courseId: "course-1",
        lessonId: "lesson-1",
        correctChoiceIndex: 2,
        modelAnswer: null,
      }),
    );
  });
});

const pendingMultipleChoice = {
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
  explanation: "const can't be reassigned.",
};

const pendingShortAnswer = {
  ...pendingMultipleChoice,
  questionType: "SHORT_ANSWER" as const,
  choices: null,
  correctChoiceIndex: null,
  modelAnswer: "A binding that can't be reassigned.",
};

describe("evaluatePracticeAttempt", () => {
  it("throws PracticeNotFoundError for an unknown/expired/wrong-student practiceId", async () => {
    takePendingPractice.mockResolvedValue(undefined);
    await expect(
      evaluatePracticeAttempt("student-1", "unknown-id", "2"),
    ).rejects.toBeInstanceOf(PracticeNotFoundError);
  });

  it("evaluates a correct MULTIPLE_CHOICE answer deterministically without calling the AI", async () => {
    takePendingPractice.mockResolvedValue(pendingMultipleChoice);

    const result = await evaluatePracticeAttempt("student-1", "practice-abc", "2");

    expect(result.correct).toBe(true);
    expect(result.correctAnswer).toBe("const");
    expect(result.feedback).toBeNull();
    expect(getAIProvider).not.toHaveBeenCalled();
    expect(recordLearningActivity).toHaveBeenCalledWith({
      studentId: "student-1",
      courseId: "course-1",
      lessonId: "lesson-1",
      type: "PRACTICE_ATTEMPT",
      metadata: { correct: true, questionType: "MULTIPLE_CHOICE" },
    });
  });

  it("evaluates an incorrect MULTIPLE_CHOICE answer deterministically", async () => {
    takePendingPractice.mockResolvedValue(pendingMultipleChoice);

    const result = await evaluatePracticeAttempt("student-1", "practice-abc", "0");

    expect(result.correct).toBe(false);
    expect(recordLearningActivity).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { correct: false, questionType: "MULTIPLE_CHOICE" } }),
    );
  });

  it("treats a non-numeric MULTIPLE_CHOICE answer as incorrect rather than throwing", async () => {
    takePendingPractice.mockResolvedValue(pendingMultipleChoice);

    const result = await evaluatePracticeAttempt("student-1", "practice-abc", "not-a-number");
    expect(result.correct).toBe(false);
  });

  it("evaluates a SHORT_ANSWER attempt using the AI provider", async () => {
    takePendingPractice.mockResolvedValue(pendingShortAnswer);
    const provider = fakeProvider(
      JSON.stringify({ correct: true, feedback: "Exactly right." }),
    );

    const result = await evaluatePracticeAttempt("student-1", "practice-abc", "a binding you can't reassign", {
      provider,
    });

    expect(result.correct).toBe(true);
    expect(result.feedback).toBe("Exactly right.");
    expect(result.correctAnswer).toBe("A binding that can't be reassigned.");
    expect(recordLearningActivity).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { correct: true, questionType: "SHORT_ANSWER" } }),
    );
  });

  it("throws InvalidModelOutputError when the SHORT_ANSWER evaluation response is unusable", async () => {
    takePendingPractice.mockResolvedValue(pendingShortAnswer);
    const provider = fakeProvider("not valid json");

    await expect(
      evaluatePracticeAttempt("student-1", "practice-abc", "some answer", { provider }),
    ).rejects.toBeInstanceOf(InvalidModelOutputError);
    expect(recordLearningActivity).not.toHaveBeenCalled();
  });
});
