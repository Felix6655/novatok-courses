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

function scoreResource(
  resource: VerifiedLearningResource,
  terms: string[],
  currentLevel: string,
  locale: string,
): number {
  const haystack = normalize(
    [resource.title, resource.description, ...resource.topics].join(" "),
  );
  let score = 0;
  for (const term of terms) {
    const normalized = normalize(term);
    if (!normalized) continue;
    if (haystack.includes(normalized)) score += 3;
    for (const token of normalized.split(/\s+/).filter((token) => token.length >= 3)) {
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
  const terms = [input.goal, ...(input.resourceQueries ?? [])];
  const locale = input.locale ?? "en";
  return GOOGLE_VERIFIED_RESOURCES
    .map((resource) => ({
      resource,
      score: scoreResource(resource, terms, input.currentLevel, locale),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))
    .slice(0, input.limit ?? 5)
    .map((entry) => entry.resource);
}
