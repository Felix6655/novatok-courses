import { findMatchingVerifiedResources } from "@/server/guided-learning/providers/matcher";
import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";

const VERIFIED_AT = "2026-10-01";

export const MICROSOFT_VERIFIED_RESOURCES: VerifiedLearningResource[] = [
  {
    id: "microsoft-learn-training",
    provider: "microsoft",
    title: "Microsoft Learn Training",
    description:
      "Microsoft's official catalog of free, self-paced modules and learning paths.",
    url: "https://learn.microsoft.com/training/",
    kind: "CATALOG",
    topics: ["artificial intelligence", "machine learning", "generative ai", "cloud", "azure", "copilot"],
    levels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    locales: ["en", "es"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "microsoft-ai-concepts",
    provider: "microsoft",
    title: "Introduction to AI concepts",
    description:
      "A beginner Microsoft Learn module covering AI workloads and responsible AI concepts.",
    url: "https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/",
    kind: "MODULE",
    topics: ["artificial intelligence", "responsible ai", "generative ai", "computer vision", "natural language processing"],
    levels: ["BEGINNER"],
    locales: ["en"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "microsoft-machine-learning-concepts",
    provider: "microsoft",
    title: "Introduction to machine learning concepts",
    description:
      "A beginner Microsoft Learn module on regression, classification, clustering, deep learning, and model evaluation.",
    url: "https://learn.microsoft.com/en-us/training/modules/fundamentals-machine-learning/",
    kind: "MODULE",
    topics: ["machine learning", "regression", "classification", "clustering", "deep learning", "model evaluation"],
    levels: ["BEGINNER"],
    locales: ["en"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "microsoft-generative-ai-basics",
    provider: "microsoft",
    title: "What is generative AI?",
    description:
      "A Microsoft Learn module introducing generative AI, responsible AI, and Copilot workflows.",
    url: "https://learn.microsoft.com/en-us/training/modules/what-generative-ai/",
    kind: "MODULE",
    topics: ["generative ai", "artificial intelligence", "copilot", "responsible ai", "large language models"],
    levels: ["BEGINNER"],
    locales: ["en"],
    freeAccess: true,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
];

export function findMicrosoftVerifiedResources(input: {
  goal: string;
  resourceQueries?: string[];
  currentLevel: string;
  locale?: string;
  limit?: number;
}) {
  return findMatchingVerifiedResources(MICROSOFT_VERIFIED_RESOURCES, input);
}
