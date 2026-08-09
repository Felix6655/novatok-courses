import { InvalidModelOutputError } from "@/ai/errors";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider } from "@/ai/provider";
import { creatorProfileSchema, type CreatorProfile } from "@/lib/validation/creator-coach";
import { LANGUAGE_INSTRUCTIONS, type Locale } from "@/i18n/config";

const SYSTEM_PROMPT = `You are a creator-profile extraction engine for the NovaTok Creator Coach.
Read the creator's message describing their business, audience, and goals, and output ONLY a single JSON
object (no prose, no markdown fences) with this exact shape:

{
  "businessSummary": string,               // one sentence: what they sell or create, and for whom
  "platforms": string[],                    // social platforms they mentioned (e.g. ["Instagram", "TikTok"]), [] if none mentioned
  "experienceLevel": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "primaryGoal": string,                    // one sentence: what they want to achieve
  "focusAreas": string[],                   // 1 to 8 short topic keywords for retrieval, e.g. ["audience growth", "social commerce"]
  "constraints": string[]                   // other short notes (follower counts, average views, time, income target), [] if none
}

Infer experienceLevel from context: very low follower counts or phrases like "just starting" suggest
BEGINNER; an existing following with inconsistent results suggests INTERMEDIATE; someone already earning
consistently and looking to scale suggests ADVANCED. If unclear, use BEGINNER. Always return valid JSON
matching this shape exactly, with no surrounding text.`;

/**
 * Converts a free-text creator business/goal description into validated
 * structured profile. Mirrors src/server/advisor/extract-intent.ts:
 * never trusts the raw model string, parses it as JSON, and runs it
 * through creatorProfileSchema so a model that returns garbage or an
 * off-shape object surfaces as InvalidModelOutputError rather than
 * corrupting downstream retrieval.
 */
export async function extractCreatorProfile(
  message: string,
  provider: AIProvider,
  locale: Locale = "en",
): Promise<CreatorProfile> {
  const completion = await provider.generateCompletion({
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUnderstand input in any supported language. The focusAreas and platforms arrays MUST use concise English keywords even when the input is not English; this is an internal retrieval contract. businessSummary and primaryGoal may remain in the creator's language. ${LANGUAGE_INSTRUCTIONS[locale]}`,
      },
      { role: "user", content: message },
    ],
    temperature: 0,
  });

  const parsed = parseJsonLoosely(completion);
  if (parsed === undefined) {
    throw new InvalidModelOutputError(
      "Could not parse a JSON object from the model's creator-profile response",
      completion,
    );
  }

  const result = creatorProfileSchema.safeParse(parsed);
  if (!result.success) {
    throw new InvalidModelOutputError(
      `Model's creator-profile JSON failed validation: ${result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
      completion,
    );
  }

  return result.data;
}
