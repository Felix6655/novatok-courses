import { findMatchingVerifiedResources } from "@/server/guided-learning/providers/matcher";
import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";

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

export function findGoogleVerifiedResources(input: {
  goal: string;
  resourceQueries?: string[];
  currentLevel: string;
  locale?: string;
  limit?: number;
}) {
  return findMatchingVerifiedResources(GOOGLE_VERIFIED_RESOURCES, input);
}
