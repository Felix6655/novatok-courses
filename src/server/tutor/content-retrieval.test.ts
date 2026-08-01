import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractKeywords, scoreLessonAgainstKeywords } from "@/server/tutor/content-retrieval";

describe("extractKeywords", () => {
  it("extracts significant words, lowercased", () => {
    expect(extractKeywords("Explain Variables in JavaScript")).toEqual(
      expect.arrayContaining(["variables", "javascript"]),
    );
  });

  it("drops stopwords and short words", () => {
    const keywords = extractKeywords("What can you do for me");
    expect(keywords).toEqual([]);
  });

  it("drops Tutor-interaction meta words like explain/practice/next/study", () => {
    const keywords = extractKeywords("Please explain and give me practice questions for next study");
    expect(keywords).toEqual([]);
  });

  it("returns an empty array for a purely meta question", () => {
    expect(extractKeywords("What should I study next?")).toEqual([]);
  });

  it("deduplicates repeated keywords", () => {
    expect(extractKeywords("python python python")).toEqual(["python"]);
  });
});

describe("scoreLessonAgainstKeywords", () => {
  const lesson = {
    title: "Variables and Data Types",
    summary: "How to declare variables in JavaScript.",
    content: "A variable is a named container for a value.",
  };

  it("scores 0 when no keyword matches anywhere", () => {
    expect(scoreLessonAgainstKeywords(lesson, ["plumbing"])).toBe(0);
  });

  it("scores higher for a title match than a content-only match", () => {
    const titleMatch = scoreLessonAgainstKeywords(lesson, ["variables"]);
    const contentOnlyMatch = scoreLessonAgainstKeywords(
      { title: "Something Else", summary: "Nothing relevant.", content: "Mentions container briefly." },
      ["container"],
    );
    expect(titleMatch).toBeGreaterThan(contentOnlyMatch);
  });

  it("matches case-insensitively", () => {
    expect(scoreLessonAgainstKeywords(lesson, ["VARIABLES"])).toBeGreaterThan(0);
  });

  it("accumulates score across multiple matching keywords", () => {
    const oneKeyword = scoreLessonAgainstKeywords(lesson, ["variables"]);
    const twoKeywords = scoreLessonAgainstKeywords(lesson, ["variables", "container"]);
    expect(twoKeywords).toBeGreaterThan(oneKeyword);
  });
});

const findMany = vi.fn();
const findUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: {
      findMany: (...args: unknown[]) => findMany(...args),
      findUnique: (...args: unknown[]) => findUnique(...args),
    },
  },
}));

const { getRelevantLessons, getPinnedLessonContext } = await import("@/server/tutor/content-retrieval");

beforeEach(() => {
  findMany.mockReset();
  findUnique.mockReset();
});

function lessonRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "l1",
    courseId: "course-1",
    moduleId: "m1",
    slug: "variables-and-data-types",
    title: "Variables and Data Types",
    summary: "How to declare variables.",
    content: "A variable is a named container for a value.",
    displayOrder: 1,
    ...overrides,
  };
}

describe("getRelevantLessons", () => {
  it("returns no lessons and outOfScope:false when the course has no content at all", async () => {
    findMany.mockResolvedValue([]);
    const result = await getRelevantLessons("course-1", "Explain variables");
    expect(result).toEqual({ lessons: [], outOfScope: false, isMetaQuestion: false });
  });

  it("flags a question as out of scope when keywords exist but nothing matches", async () => {
    findMany.mockResolvedValue([lessonRow()]);
    const result = await getRelevantLessons("course-1", "Tell me about plumbing permits");
    expect(result.outOfScope).toBe(true);
    expect(result.lessons).toEqual([]);
  });

  it("returns the matching lesson for a keyword-relevant question", async () => {
    findMany.mockResolvedValue([lessonRow()]);
    const result = await getRelevantLessons("course-1", "Explain variables to me");
    expect(result.outOfScope).toBe(false);
    expect(result.lessons).toHaveLength(1);
    expect(result.lessons[0].slug).toBe("variables-and-data-types");
  });

  it("treats a purely meta question as in-scope and returns default lessons", async () => {
    findMany.mockResolvedValue([lessonRow()]);
    const result = await getRelevantLessons("course-1", "What should I study next?");
    expect(result.outOfScope).toBe(false);
    expect(result.isMetaQuestion).toBe(true);
    expect(result.lessons.length).toBeGreaterThan(0);
  });

  it("respects the limit parameter", async () => {
    findMany.mockResolvedValue([
      lessonRow({ id: "l1", slug: "a", title: "Variables one" }),
      lessonRow({ id: "l2", slug: "b", title: "Variables two" }),
      lessonRow({ id: "l3", slug: "c", title: "Variables three" }),
    ]);
    const result = await getRelevantLessons("course-1", "Explain variables", 2);
    expect(result.lessons).toHaveLength(2);
  });
});

describe("getPinnedLessonContext", () => {
  it("returns null when the lesson slug doesn't exist for this course", async () => {
    findUnique.mockResolvedValue(null);
    const result = await getPinnedLessonContext("course-1", "not-a-real-lesson");
    expect(result).toBeNull();
  });

  it("returns null when the lesson belongs to a different course", async () => {
    // getLessonByCourseAndSlug queries by the compound (courseId, slug) key,
    // so a lesson belonging to another course simply doesn't match — Prisma
    // returns null, which is exactly what we simulate here.
    findUnique.mockResolvedValue(null);
    const result = await getPinnedLessonContext("course-1", "a-lesson-from-another-course");
    expect(result).toBeNull();
    expect(findUnique).toHaveBeenCalledWith({
      where: { courseId_slug: { courseId: "course-1", slug: "a-lesson-from-another-course" } },
    });
  });

  it("returns the pinned lesson plus nearby lessons from the same module", async () => {
    const pinned = lessonRow({ id: "l1", slug: "variables-and-data-types", moduleId: "m1" });
    findUnique.mockResolvedValue(pinned);
    findMany.mockResolvedValue([
      pinned,
      lessonRow({ id: "l2", slug: "functions-and-control-flow", moduleId: "m1" }),
      lessonRow({ id: "l3", slug: "arrays-and-objects", moduleId: "m2" }),
    ]);

    const result = await getPinnedLessonContext("course-1", "variables-and-data-types");

    expect(result?.pinnedLesson.slug).toBe("variables-and-data-types");
    expect(result?.nearbyLessons.map((l) => l.slug)).toEqual(["functions-and-control-flow"]);
  });

  it("excludes the pinned lesson itself from nearbyLessons", async () => {
    const pinned = lessonRow({ id: "l1", slug: "variables-and-data-types", moduleId: "m1" });
    findUnique.mockResolvedValue(pinned);
    findMany.mockResolvedValue([pinned]);

    const result = await getPinnedLessonContext("course-1", "variables-and-data-types");
    expect(result?.nearbyLessons).toEqual([]);
  });

  it("respects the limit parameter for nearby lessons", async () => {
    const pinned = lessonRow({ id: "l1", slug: "a", moduleId: "m1" });
    findUnique.mockResolvedValue(pinned);
    findMany.mockResolvedValue([
      pinned,
      lessonRow({ id: "l2", slug: "b", moduleId: "m1" }),
      lessonRow({ id: "l3", slug: "c", moduleId: "m1" }),
      lessonRow({ id: "l4", slug: "d", moduleId: "m1" }),
    ]);

    const result = await getPinnedLessonContext("course-1", "a", 2);
    expect(result?.nearbyLessons).toHaveLength(1);
  });
});
