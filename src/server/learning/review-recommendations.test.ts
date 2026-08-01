import { beforeEach, describe, expect, it, vi } from "vitest";

const activityFindMany = vi.fn();
const activityGroupBy = vi.fn();
const getCourseModulesWithLessons = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    learningActivity: {
      findMany: (...args: unknown[]) => activityFindMany(...args),
      groupBy: (...args: unknown[]) => activityGroupBy(...args),
    },
  },
}));
vi.mock("@/server/course-content", () => ({
  getCourseModulesWithLessons: (...args: unknown[]) => getCourseModulesWithLessons(...args),
}));

const { getReviewCandidates } = await import("@/server/learning/review-recommendations");

const syllabus = [
  {
    id: "m1",
    title: "JavaScript Basics",
    lessons: [
      { id: "l1", slug: "variables-and-data-types", title: "Variables and Data Types" },
      { id: "l2", slug: "functions-and-control-flow", title: "Functions and Control Flow" },
    ],
  },
];

beforeEach(() => {
  activityFindMany.mockReset();
  activityGroupBy.mockReset();
  getCourseModulesWithLessons.mockReset();
  getCourseModulesWithLessons.mockResolvedValue(syllabus);
});

describe("getReviewCandidates", () => {
  it("returns no candidates when there's no signal at all", async () => {
    activityFindMany.mockResolvedValue([]);
    activityGroupBy.mockResolvedValue([]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toEqual([]);
  });

  it("flags a lesson with fewer than half of at least 2 practice attempts correct", async () => {
    activityFindMany.mockResolvedValue([
      { lessonId: "l1", metadata: { correct: false } },
      { lessonId: "l1", metadata: { correct: false } },
      { lessonId: "l1", metadata: { correct: true } },
    ]);
    activityGroupBy.mockResolvedValue([]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toHaveLength(1);
    expect(result[0].lessonSlug).toBe("variables-and-data-types");
    expect(result[0].reason).toContain("33%");
  });

  it("does not flag a lesson with only 1 practice attempt (below the minimum signal threshold)", async () => {
    activityFindMany.mockResolvedValue([{ lessonId: "l1", metadata: { correct: false } }]);
    activityGroupBy.mockResolvedValue([]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toEqual([]);
  });

  it("does not flag a lesson with good practice accuracy", async () => {
    activityFindMany.mockResolvedValue([
      { lessonId: "l1", metadata: { correct: true } },
      { lessonId: "l1", metadata: { correct: true } },
    ]);
    activityGroupBy.mockResolvedValue([]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toEqual([]);
  });

  it("flags a lesson asked about via the Tutor at least 3 times", async () => {
    activityFindMany.mockResolvedValue([]);
    activityGroupBy.mockResolvedValue([{ lessonId: "l2", _count: { _all: 3 } }]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toHaveLength(1);
    expect(result[0].lessonSlug).toBe("functions-and-control-flow");
    expect(result[0].reason).toContain("3 times");
  });

  it("does not flag a lesson asked about via the Tutor fewer than 3 times", async () => {
    activityFindMany.mockResolvedValue([]);
    activityGroupBy.mockResolvedValue([{ lessonId: "l2", _count: { _all: 2 } }]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toEqual([]);
  });

  it("combines both reasons when both trigger for the same lesson", async () => {
    activityFindMany.mockResolvedValue([
      { lessonId: "l1", metadata: { correct: false } },
      { lessonId: "l1", metadata: { correct: false } },
    ]);
    activityGroupBy.mockResolvedValue([{ lessonId: "l1", _count: { _all: 4 } }]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result).toHaveLength(1);
    expect(result[0].reason).toContain("practice attempts");
    expect(result[0].reason).toContain("4 times");
  });

  it("caps the result at 5 candidates", async () => {
    const manyLessons = Array.from({ length: 8 }, (_, i) => ({
      id: `l${i}`,
      slug: `lesson-${i}`,
      title: `Lesson ${i}`,
    }));
    getCourseModulesWithLessons.mockResolvedValue([{ id: "m1", title: "M", lessons: manyLessons }]);
    activityGroupBy.mockResolvedValue(manyLessons.map((l) => ({ lessonId: l.id, _count: { _all: 5 } })));
    activityFindMany.mockResolvedValue([]);

    const result = await getReviewCandidates("student-1", "course-1");
    expect(result.length).toBeLessThanOrEqual(5);
  });
});
