import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

const GOAL_ALIASES: Record<string, string[]> = {
  ai: ["artificial intelligence"],
  ml: ["machine learning"],
  llm: ["large language models"],
  llms: ["large language models"],
  genai: ["generative ai"],
  "gen-ai": ["generative ai"],
};

const GENERIC_MATCH_TOKENS = new Set([
  "learn","learning","course","courses","beginner","intermediate","advanced",
  "free","practice","study","training","basics","basic","from","with","want",
  "module","modules","path","paths",
]);

function expandGoalAliases(goal: string): string {
  const normalized = normalize(goal);
  const tokens = normalized.split(/\s+/);
  const expansions = tokens.flatMap((token) => GOAL_ALIASES[token] ?? []);
  return [normalized, ...expansions].join(" ");
}

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

export function findMatchingVerifiedResources(
  resources: VerifiedLearningResource[],
  input: {
    goal: string;
    resourceQueries?: string[];
    currentLevel: string;
    locale?: string;
    limit?: number;
  },
): VerifiedLearningResource[] {
  const resourceQueries = input.resourceQueries ?? [];
  const locale = input.locale ?? "en";

  return resources
    .map((resource) => {
      const relevance = topicRelevance(resource, input.goal);
      if (relevance <= 0) return { resource, score: -1 };

      const haystack = normalize(
        [resource.title, resource.description, ...resource.topics].join(" "),
      );
      let score = relevance;

      for (const query of resourceQueries) {
        const normalized = normalize(query);
        for (const token of normalized
          .split(/\s+/)
          .filter((token) => token.length >= 3 && !GENERIC_MATCH_TOKENS.has(token))) {
          if (haystack.includes(token)) score += 1;
        }
      }

      if (resource.levels.includes(input.currentLevel as never)) score += 2;
      if (resource.locales.includes(locale)) score += 1;
      return { resource, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))
    .slice(0, input.limit ?? 8)
    .map((entry) => entry.resource);
}
