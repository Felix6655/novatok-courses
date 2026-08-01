import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { learningActivity: { create: (...args: unknown[]) => create(...args) } },
}));

const { recordLearningActivity } = await import("@/server/learning/activity");

beforeEach(() => {
  create.mockReset();
});

describe("recordLearningActivity", () => {
  it("writes studentId, courseId, type, and null lessonId when none is given", async () => {
    await recordLearningActivity({ studentId: "student-1", courseId: "course-1", type: "COACH_REQUEST" });

    expect(create).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        courseId: "course-1",
        lessonId: null,
        type: "COACH_REQUEST",
        metadata: undefined,
      },
    });
  });

  it("writes a lessonId and bounded metadata when given", async () => {
    await recordLearningActivity({
      studentId: "student-1",
      courseId: "course-1",
      lessonId: "lesson-1",
      type: "PRACTICE_ATTEMPT",
      metadata: { correct: true, questionType: "MULTIPLE_CHOICE" },
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        courseId: "course-1",
        lessonId: "lesson-1",
        type: "PRACTICE_ATTEMPT",
        metadata: { correct: true, questionType: "MULTIPLE_CHOICE" },
      },
    });
  });
});
