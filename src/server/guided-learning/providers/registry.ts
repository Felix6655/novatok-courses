import { AWS_VERIFIED_RESOURCES } from "@/server/guided-learning/providers/aws";
import { GOOGLE_VERIFIED_RESOURCES } from "@/server/guided-learning/providers/google";
import { findMatchingVerifiedResources } from "@/server/guided-learning/providers/matcher";
import { MICROSOFT_VERIFIED_RESOURCES } from "@/server/guided-learning/providers/microsoft";
import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";

export const VERIFIED_LEARNING_RESOURCES: VerifiedLearningResource[] = [
  ...GOOGLE_VERIFIED_RESOURCES,
  ...MICROSOFT_VERIFIED_RESOURCES,
  ...AWS_VERIFIED_RESOURCES,
];

export function findVerifiedLearningResources(input: {
  goal: string;
  resourceQueries?: string[];
  currentLevel: string;
  locale?: string;
  limit?: number;
}) {
  return findMatchingVerifiedResources(VERIFIED_LEARNING_RESOURCES, input);
}
