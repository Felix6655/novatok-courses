import { InvalidModelOutputError } from "@/ai/errors";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider } from "@/ai/provider";
import { learningIntentSchema, type LearningIntent } from "@/lib/validation/learning-intent";
import { LANGUAGE_INSTRUCTIONS, type Locale } from "@/i18n/config";

const SYSTEM_PROMPT = `You are a learning-intent extraction engine for NovaTok Courses.
Read the student's message and output ONLY a single JSON object (no prose, no markdown fences) with this exact shape:

{
  "goal": string,                          // one sentence summarizing what they want to achieve
  "currentSkillLevel": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "topics": string[],                      // 1 to 8 short topic/subject keywords, e.g. ["Python", "AI"]
  "availableHoursPerWeek": number | null,   // if mentioned, otherwise null
  "budgetPreference": "FREE" | "ANY",       // "FREE" only if they explicitly want free/no-cost courses
  "constraints": string[]                   // other short notes (experience, format, time pressure), [] if none
}

If the student gives no explicit skill level, infer BEGINNER for phrases like "never coded before" or
"new to this", otherwise infer it from context. Always return valid JSON matching this shape exactly,
with no surrounding text.`;

/**
 * Converts a free-text learning goal into validated structured intent.
 * Never trusts the raw model string: it's parsed as JSON and then run
 * through learningIntentSchema, so a model that returns garbage or an
 * off-shape object surfaces as InvalidModelOutputError rather than
 * corrupting downstream catalog queries.
 */
export async function extractLearningIntent(
  message: string,
  provider: AIProvider,
  locale: Locale = "en",
): Promise<LearningIntent> {
  const completion = await provider.generateCompletion({
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nUnderstand input in any supported language. The topics array MUST use concise English catalog keywords even when the input is not English; this is an internal retrieval contract. The goal may remain in the student's language. ${LANGUAGE_INSTRUCTIONS[locale]}` },
      { role: "user", content: message },
    ],
    temperature: 0,
  });

  const parsed = parseJsonLoosely(completion);
  if (parsed === undefined) {
    throw new InvalidModelOutputError(
      "Could not parse a JSON object from the model's learning-intent response",
      completion,
    );
  }

  const result = learningIntentSchema.safeParse(parsed);
  if (!result.success) {
    throw new InvalidModelOutputError(
      `Model's learning-intent JSON failed validation: ${result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
      completion,
    );
  }

  return result.data;
}
