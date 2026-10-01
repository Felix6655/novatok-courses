import { getAIProvider } from "@/ai/get-ai-provider";
import { parseJsonLoosely } from "@/ai/parse-json-loosely";
import type { AIProvider, ChatMessage } from "@/ai/provider";
import { findVerifiedLearningResources } from "@/server/guided-learning/providers/registry";
import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";
import { LANGUAGE_INSTRUCTIONS } from "@/i18n/config";
import {
  guidedLearningModelResponseSchema,
  type GuidedLearningModelResponse,
  type GuidedLearningRequest,
} from "@/lib/validation/guided-learning";

export interface GuidedLearningResult extends GuidedLearningModelResponse {
  source: "ai" | "fallback";
  fallbackReason?: "timeout" | "provider-unavailable" | "invalid-output";
  verifiedResources: VerifiedLearningResource[];
}

export interface GuidedLearningDeps {
  provider?: AIProvider;
  timeoutMs?: number;
}

const DEFAULT_GUIDED_LEARNING_TIMEOUT_MS = 8_000;

const SYSTEM_PROMPT = `You are NovaTok Guided Learning, an educational planning assistant.

Your job is to turn one learner goal into a realistic learning path. Build a sequence from prerequisites
to practical application, adapting depth to the learner's current level and weekly study time.

Important:
- Do not claim that any external course, certificate, provider, price, badge, or URL exists.
- Do not invent links.
- "resourceQueries" are search phrases only, intended for a separate verified-resource discovery layer.
- Keep the plan educational and concrete.
- Prefer progressive practice over passive reading.
- Return ONLY JSON with this exact shape:

{
  "goalSummary": string,
  "estimatedWeeks": integer,
  "steps": [
    {
      "title": string,
      "outcome": string,
      "topics": string[],
      "practice": string[]
    }
  ],
  "studyTips": string[],
  "resourceQueries": string[]
}`;

function fallbackPlan(request: GuidedLearningRequest): GuidedLearningModelResponse {
  const goal = request.goal.trim();
  return {
    goalSummary: goal,
    estimatedWeeks: Math.max(2, Math.min(12, Math.ceil(20 / request.weeklyHours))),
    steps: [
      {
        title: "Foundations",
        outcome: `Understand the core vocabulary and prerequisites needed for: ${goal}.`,
        topics: ["Core concepts", "Essential terminology", "Prerequisites"],
        practice: ["Write a one-page summary in your own words."],
      },
      {
        title: "Guided practice",
        outcome: `Apply the main concepts behind: ${goal}.`,
        topics: ["Worked examples", "Common mistakes", "Practice exercises"],
        practice: ["Complete a small guided exercise and explain each step."],
      },
      {
        title: "Independent project",
        outcome: `Demonstrate practical ability related to: ${goal}.`,
        topics: ["Project planning", "Independent execution", "Self-review"],
        practice: ["Build one small project and document what you learned."],
      },
    ],
    studyTips: [
      "Study in short, regular sessions.",
      "Test yourself before rereading explanations.",
      "Keep a list of concepts you still cannot explain clearly.",
    ],
    resourceQueries: [`${goal} beginner course`, `${goal} practice exercises`],
  };
}

export async function buildGuidedLearningPlan(
  request: GuidedLearningRequest,
  deps: GuidedLearningDeps = {},
): Promise<GuidedLearningResult> {
  const locale = request.locale ?? "en";
  let provider: AIProvider | null = null;
  let fallbackReason: GuidedLearningResult["fallbackReason"];

  try {
    provider =
      deps.provider ??
      getAIProvider(process.env, {
        task: "guided-learning",
        locale,
      });
  } catch {
    fallbackReason = "provider-unavailable";
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n${LANGUAGE_INSTRUCTIONS[locale]}`,
    },
    {
      role: "user",
      content:
        `Learning goal: ${request.goal}\n` +
        `Current level: ${request.currentLevel}\n` +
        `Weekly study time: ${request.weeklyHours} hours\n\n` +
        "Create the learning path now.",
    },
  ];

  let validated:
    | ReturnType<typeof guidedLearningModelResponseSchema.safeParse>
    | undefined;

  if (provider) {
    const timeoutMs = deps.timeoutMs ?? DEFAULT_GUIDED_LEARNING_TIMEOUT_MS;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeout = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error("guided-learning-timeout")),
          timeoutMs,
        );
      });

      const completion = await Promise.race([
        provider.generateCompletion({
          messages,
          temperature: 0.2,
          maxTokens: 900,
        }),
        timeout,
      ]);

      const parsed = parseJsonLoosely(completion);
      validated =
        parsed === undefined
          ? undefined
          : guidedLearningModelResponseSchema.safeParse(parsed);

      if (!validated?.success) fallbackReason = "invalid-output";
    } catch (error) {
      fallbackReason =
        error instanceof Error && error.message === "guided-learning-timeout"
          ? "timeout"
          : "provider-unavailable";
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  }

  const plan = validated?.success ? validated.data : fallbackPlan(request);

  const verifiedResources = findVerifiedLearningResources({
    goal: request.goal,
    resourceQueries: plan.resourceQueries,
    currentLevel: request.currentLevel,
    locale,
  });

  return {
    ...plan,
    source: validated?.success ? "ai" : "fallback",
    ...(validated?.success ? {} : { fallbackReason: fallbackReason ?? "invalid-output" }),
    verifiedResources,
  };
}
