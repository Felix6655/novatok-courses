import { describe, expect, it } from "vitest";
import type { AIProvider } from "@/ai/provider";
import { buildTutorPromptMessages, generateTutorAnswer } from "@/server/tutor/tutor-response";
import type { SerializedLesson, SerializedModuleWithLessons } from "@/types/course";

function lesson(overrides: Partial<SerializedLesson> = {}): SerializedLesson {
  return {
    id: "l1",
    courseId: "course-1",
    moduleId: "m1",
    slug: "variables-and-data-types",
    title: "Variables and Data Types",
    summary: "How to declare variables.",
    content: "A variable is a named container for a value.",
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as unknown as SerializedLesson;
}

const syllabus: SerializedModuleWithLessons[] = [
  {
    id: "m1",
    courseId: "course-1",
    title: "JavaScript Basics",
    description: "",
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    lessons: [lesson()],
  } as unknown as SerializedModuleWithLessons,
];

function fakeProvider(response: string): AIProvider {
  return { name: "fake", generateCompletion: async () => response };
}

describe("buildTutorPromptMessages", () => {
  it("includes the course title, syllabus, candidate lessons, and question", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "JavaScript Fundamentals",
      syllabus,
      candidateLessons: [lesson()],
      question: "Explain variables",
      responseMode: "NORMAL",
    });

    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userMessage).toContain("JavaScript Fundamentals");
    expect(userMessage).toContain("Variables and Data Types");
    expect(userMessage).toContain("Explain variables");
  });

  it("includes mode-specific instructions", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus: [],
      candidateLessons: [],
      question: "hi",
      responseMode: "PRACTICE",
    });
    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userMessage.toLowerCase()).toContain("practice question");
  });
});

describe("generateTutorAnswer", () => {
  const baseParams = {
    courseTitle: "JavaScript Fundamentals",
    syllabus,
    candidateLessons: [lesson()],
    question: "Explain variables",
    responseMode: "NORMAL" as const,
  };

  it("grounds relevantLessonSlugs against the real candidate set", async () => {
    const provider = fakeProvider(
      JSON.stringify({
        answer: "A variable stores a value.",
        relevantLessonSlugs: ["variables-and-data-types", "made-up-lesson"],
        outOfScope: false,
        practiceQuestion: null,
      }),
    );

    const result = await generateTutorAnswer(baseParams, provider);

    expect(result.answerSource).toBe("ai");
    expect(result.relevantLessons).toHaveLength(1);
    expect(result.relevantLessons[0].slug).toBe("variables-and-data-types");
    expect(result.relevantLessons[0].moduleTitle).toBe("JavaScript Basics");
  });

  it("respects outOfScope from the model and clears relevantLessons", async () => {
    const provider = fakeProvider(
      JSON.stringify({
        answer: "That's outside this course.",
        relevantLessonSlugs: ["variables-and-data-types"],
        outOfScope: true,
        practiceQuestion: null,
      }),
    );

    const result = await generateTutorAnswer(baseParams, provider);

    expect(result.outOfScope).toBe(true);
    expect(result.relevantLessons).toEqual([]);
  });

  it("passes through a valid practice question", async () => {
    const provider = fakeProvider(
      JSON.stringify({
        answer: "Here's a practice question.",
        relevantLessonSlugs: ["variables-and-data-types"],
        outOfScope: false,
        practiceQuestion: {
          question: "What keyword declares a constant?",
          answer: "const",
          explanation: "const bindings can't be reassigned.",
        },
      }),
    );

    const result = await generateTutorAnswer(baseParams, provider);
    expect(result.practiceQuestion?.answer).toBe("const");
  });

  it("falls back to surfacing real lesson content when the model output isn't valid JSON", async () => {
    const provider = fakeProvider("Sure, variables are like boxes!");
    const result = await generateTutorAnswer(baseParams, provider);

    expect(result.answerSource).toBe("fallback");
    expect(result.relevantLessons).toHaveLength(1);
    expect(result.answer).toContain("Variables and Data Types");
  });

  it("falls back when the JSON is well-formed but fails schema validation", async () => {
    const provider = fakeProvider(JSON.stringify({ answer: "" }));
    const result = await generateTutorAnswer(baseParams, provider);
    expect(result.answerSource).toBe("fallback");
  });

  it("falls back to the candidate set when the model cites no real lessons", async () => {
    const provider = fakeProvider(
      JSON.stringify({
        answer: "General explanation.",
        relevantLessonSlugs: ["totally-made-up"],
        outOfScope: false,
        practiceQuestion: null,
      }),
    );

    const result = await generateTutorAnswer(baseParams, provider);
    // answer text is still AI-authored; only the citation list defaults to the real candidates
    expect(result.answerSource).toBe("ai");
    expect(result.relevantLessons.map((l) => l.slug)).toEqual(["variables-and-data-types"]);
  });

  it("propagates provider failures instead of masking them as a fallback", async () => {
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async () => {
        throw new Error("connection refused");
      },
    };
    await expect(generateTutorAnswer(baseParams, provider)).rejects.toThrow("connection refused");
  });
});
