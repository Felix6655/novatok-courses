import { findMatchingVerifiedResources } from "@/server/guided-learning/providers/matcher";
import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";

const VERIFIED_AT = "2026-10-01";

export const AWS_VERIFIED_RESOURCES: VerifiedLearningResource[] = [
  {
    id: "aws-skill-builder",
    provider: "aws",
    title: "AWS Skill Builder",
    description:
      "AWS's official digital training platform with 1,000+ free learning resources across cloud and AI.",
    url: "https://aws.amazon.com/training/digital/",
    kind: "CATALOG",
    topics: ["aws", "cloud", "artificial intelligence", "machine learning", "generative ai", "amazon bedrock", "sagemaker"],
    levels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    locales: ["en"],
    freeAccess: false,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "aws-learn-about-ai",
    provider: "aws",
    title: "AWS Learn about AI",
    description:
      "AWS-curated AI training for beginners through experienced builders, including generative AI and machine learning paths.",
    url: "https://aws.amazon.com/training/learn-about/ai/",
    kind: "LEARNING_PATH",
    topics: ["artificial intelligence", "machine learning", "generative ai", "agentic ai", "amazon bedrock", "sagemaker"],
    levels: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    locales: ["en"],
    freeAccess: false,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
  {
    id: "aws-new-to-ai",
    provider: "aws",
    title: "AWS New to AI",
    description:
      "Beginner-friendly AWS resources for AI, machine learning, and generative AI fundamentals.",
    url: "https://aws.amazon.com/ai/learn/new-to-ai/",
    kind: "LEARNING_PATH",
    topics: ["artificial intelligence", "machine learning", "generative ai", "prompt engineering"],
    levels: ["BEGINNER"],
    locales: ["en"],
    freeAccess: false,
    verification: { source: "official-provider", verifiedAt: VERIFIED_AT },
  },
];

export function findAwsVerifiedResources(input: {
  goal: string;
  resourceQueries?: string[];
  currentLevel: string;
  locale?: string;
  limit?: number;
}) {
  return findMatchingVerifiedResources(AWS_VERIFIED_RESOURCES, input);
}
