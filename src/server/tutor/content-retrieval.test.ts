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

vi.mock("@/lib/prisma", () => ({
  prisma: { lesson: { findMany: (...args: unknown[]) => findMany(...args) } },
}));

const { getRelevantLessons } = await import("@/server/tutor/content-retrieval");

beforeEach(() => {
  findMany.mockReset();
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
