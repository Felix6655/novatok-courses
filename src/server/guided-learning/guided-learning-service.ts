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
  verifiedResources: VerifiedLearningResource[];
}

export interface GuidedLearningDeps {
  provider?: AIProvider;
}

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
  const provider =
    deps.provider ??
    getAIProvider(process.env, {
      task: "guided-learning",
      locale,
    });

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

  const completion = await provider.generateCompletion({
    messages,
    temperature: 0.25,
    maxTokens: 1800,
  });

  const parsed = parseJsonLoosely(completion);
  const validated =
    parsed === undefined ? undefined : guidedLearningModelResponseSchema.safeParse(parsed);

  const plan = validated && validated.success ? validated.data : fallbackPlan(request);

  const verifiedResources = findVerifiedLearningResources({
    goal: request.goal,
    resourceQueries: plan.resourceQueries,
    currentLevel: request.currentLevel,
    locale,
  });

  return {
    ...plan,
    source: validated && validated.success ? "ai" : "fallback",
    verifiedResources,
  };
}
