export type VerifiedResourceKind = "COURSE" | "LEARNING_TOOL" | "CATALOG";

export interface VerifiedLearningResource {
  id: string;
  provider: "google";
  title: string;
  description: string;
  url: string;
  kind: VerifiedResourceKind;
  topics: string[];
  levels: Array<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">;
  locales: string[];
  freeAccess: boolean;
  verification: {
    source: "official-provider";
    verifiedAt: string;
  };
}

const VERIFIED_AT = "2026-10-01";

export const GOOGLE_VERIFIED_RESOURCES: VerifiedLearningResource[] = [
  {
    id: "google-ml-catalog",
    provider: "google",
    title: "Google Machine Learning",
    description:
      "Google for Developers catalog of foundational and advanced machine learning courses.",
    url: "https://developers.google.com/machine-learning/",
    kind: "CATALOG",
    topics: [
      "machine learning",
      "artificial intelligence",
      "ml",
      "recommendation systems",
      "clustering",
      "decision forests",
    ],
    levels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    locales: ["en", "es"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "google-ml-crash-course",
    provider: "google",
    title: "Google Machine Learning Crash Course",
    description:
      "A practical introduction to machine learning with videos, interactive visualizations, quizzes, and hands-on exercises.",
    url: "https://developers.google.com/machine-learning/crash-course/",
    kind: "COURSE",
    topics: [
      "machine learning",
      "artificial intelligence",
      "ml",
      "linear regression",
      "classification",
      "neural networks",
      "embeddings",
      "large language models",
      "llm",
      "production ml",
      "ml fairness",
    ],
    levels: ["BEGINNER", "INTERMEDIATE"],
    locales: ["en", "es"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "google-gemini-guided-learning",
    provider: "google",
    title: "Gemini Guided Learning",
    description:
      "Google's guided learning experience in Gemini, designed to teach step by step with questions, explanations, visuals, and quizzes.",
    url: "https://gemini.google.com/",
    kind: "LEARNING_TOOL",
    topics: [
      "guided learning",
      "learnlm",
      "gemini",
      "study",
      "tutoring",
      "artificial intelligence",
      "learning",
    ],
    levels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    locales: ["en", "es"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
];

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

const GOAL_ALIASES: Record<string, string[]> = {
  ai: ["artificial intelligence"],
  ml: ["machine learning"],
  llm: ["large language models"],
  "llms": ["large language models"],
};

function expandGoalAliases(goal: string): string {
  const normalized = normalize(goal);
  const tokens = normalized.split(/\s+/);
  const expansions = tokens.flatMap((token) => GOAL_ALIASES[token] ?? []);
  return [normalized, ...expansions].join(" ");
}

const GENERIC_MATCH_TOKENS = new Set([
  "learn",
  "learning",
  "course",
  "courses",
  "beginner",
  "intermediate",
  "advanced",
  "free",
  "practice",
  "study",
  "training",
  "basics",
  "basic",
  "from",
  "with",
  "want",
]);

function topicRelevance(resource: VerifiedLearningResource, goal: string): number {
  const normalizedGoal = expandGoalAliases(goal);
  let relevance = 0;

  for (const topic of resource.topics) {
    const normalizedTopic = normalize(topic);
    if (!normalizedTopic) continue;

    if (normalizedGoal.includes(normalizedTopic)) {
      relevance += normalizedTopic.length <= 3 ? 4 : 8;
      continue;
    }

    const topicTokens = normalizedTopic
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !GENERIC_MATCH_TOKENS.has(token));

    for (const token of topicTokens) {
      if (normalizedGoal.includes(token)) relevance += 2;
    }
  }

  return relevance;
}

function scoreResource(
  resource: VerifiedLearningResource,
  goal: string,
  resourceQueries: string[],
  currentLevel: string,
  locale: string,
): number {
  // Eligibility must come from the learner's own goal. Model-generated
  // search queries may improve ranking, but can never make an unrelated
  // provider resource eligible on their own.
  const relevance = topicRelevance(resource, goal);
  if (relevance <= 0) return -1;

  const haystack = normalize(
    [resource.title, resource.description, ...resource.topics].join(" "),
  );
  let score = relevance;

  for (const query of resourceQueries) {
    const normalized = normalize(query);
    if (!normalized) continue;

    for (const token of normalized
      .split(/\s+/)
      .filter(
        (token) =>
          token.length >= 3 &&
          !GENERIC_MATCH_TOKENS.has(token),
      )) {
      if (haystack.includes(token)) score += 1;
    }
  }

  if (resource.levels.includes(currentLevel as never)) score += 2;
  if (resource.locales.includes(locale)) score += 1;
  return score;
}

export function findGoogleVerifiedResources(input: {
  goal: string;
  resourceQueries?: string[];
  currentLevel: string;
  locale?: string;
  limit?: number;
}): VerifiedLearningResource[] {
  const resourceQueries = input.resourceQueries ?? [];
  const locale = input.locale ?? "en";
  return GOOGLE_VERIFIED_RESOURCES
    .map((resource) => ({
      resource,
      score: scoreResource(
        resource,
        input.goal,
        resourceQueries,
        input.currentLevel,
        locale,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))
    .slice(0, input.limit ?? 5)
    .map((entry) => entry.resource);
}
