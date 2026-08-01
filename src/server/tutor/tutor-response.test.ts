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

  it("frames the first candidate lesson as the current lesson when pinnedLessonSlug matches it", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [lesson()],
      question: "Explain this",
      responseMode: "NORMAL",
      pinnedLessonSlug: "variables-and-data-types",
    });
    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userMessage).toContain("Current lesson (the student is asking from this lesson");
  });

  it("uses the generic relevant-material framing when no lesson is pinned", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [lesson()],
      question: "Explain this",
      responseMode: "NORMAL",
    });
    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userMessage).not.toContain("Current lesson");
    expect(userMessage).toContain("Relevant lesson material:");
  });

  it("inserts bounded history between the system message and the final question", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [lesson()],
      question: "Give me another example",
      responseMode: "NORMAL",
      history: [
        { role: "user", content: "Explain variables" },
        { role: "assistant", content: "A variable stores a value." },
      ],
    });

    expect(messages).toHaveLength(4);
    expect(messages[0].role).toBe("system");
    expect(messages[1]).toEqual({ role: "user", content: "Explain variables" });
    expect(messages[2]).toEqual({ role: "assistant", content: "A variable stores a value." });
    expect(messages[3].role).toBe("user");
    expect(messages[3].content).toContain("Give me another example");
  });

  it("mentions that prior conversation isn't an authoritative course source", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [],
      question: "hi",
      responseMode: "NORMAL",
    });
    const systemMessage = messages.find((m) => m.role === "system")?.content.toLowerCase() ?? "";
    expect(systemMessage).toContain("prior conversation");
    expect(systemMessage).toContain("source of course facts");
  });

  it("omits the learning-context section entirely when none is given", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [],
      question: "hi",
      responseMode: "NORMAL",
    });
    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userMessage).not.toContain("learning context");
  });

  it("includes a bounded learning-context summary when given, framed as guidance not authoritative", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [],
      question: "Am I ready for the next lesson?",
      responseMode: "NORMAL",
      learningContext: {
        completedLessonCount: 3,
        totalLessons: 10,
        recentPracticeAccuracy: 0.75,
        reviewLessonTitles: ["Variables and Data Types"],
      },
    });
    const userMessage = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userMessage).toContain("3/10 lessons completed");
    expect(userMessage).toContain("75%");
    expect(userMessage).toContain("Variables and Data Types");
    expect(userMessage).toContain("guidance only, not authoritative");
  });

  it("mentions the learning-context boundary in the system prompt", () => {
    const messages = buildTutorPromptMessages({
      courseTitle: "Course",
      syllabus,
      candidateLessons: [],
      question: "hi",
      responseMode: "NORMAL",
    });
    const systemMessage = messages.find((m) => m.role === "system")?.content.toLowerCase() ?? "";
    expect(systemMessage).toContain("never as an authoritative record");
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

  it("forwards history to the provider as prior chat turns", async () => {
    let capturedMessageCount = 0;
    const provider: AIProvider = {
      name: "fake",
      generateCompletion: async (request) => {
        capturedMessageCount = request.messages.length;
        return JSON.stringify({ answer: "ok", relevantLessonSlugs: [], outOfScope: false, practiceQuestion: null });
      },
    };

    await generateTutorAnswer(
      {
        ...baseParams,
        history: [
          { role: "user", content: "Explain variables" },
          { role: "assistant", content: "A variable stores a value." },
        ],
      },
      provider,
    );

    // system + 2 history turns + final user question
    expect(capturedMessageCount).toBe(4);
  });
});
