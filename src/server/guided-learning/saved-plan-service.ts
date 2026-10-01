import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  guidedLearningModelResponseSchema,
  type GuidedLearningLevel,
  type SaveGuidedLearningPlanRequest,
} from "@/lib/validation/guided-learning";
import { findVerifiedLearningResources } from "@/server/guided-learning/providers/registry";
import type { VerifiedLearningResource } from "@/server/guided-learning/providers/types";
import { GuidedLearningPlanNotFoundError } from "@/server/guided-learning/saved-plan-errors";

interface GuidedLearningPlanRow {
  id: string;
  studentId: string;
  goal: string;
  currentLevel: GuidedLearningLevel;
  weeklyHours: number;
  locale: string;
  source: "ai" | "fallback";
  plan: unknown;
  verifiedResources: unknown;
  completedStepIndexes: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedGuidedLearningPlan {
  id: string;
  goal: string;
  currentLevel: GuidedLearningLevel;
  weeklyHours: number;
  locale: string;
  source: "ai" | "fallback";
  plan: ReturnType<typeof guidedLearningModelResponseSchema.parse>;
  verifiedResources: VerifiedLearningResource[];
  completedStepIndexes: number[];
  createdAt: string;
  updatedAt: string;
}

function serializeRow(row: GuidedLearningPlanRow): SavedGuidedLearningPlan {
  return {
    id: row.id,
    goal: row.goal,
    currentLevel: row.currentLevel,
    weeklyHours: row.weeklyHours,
    locale: row.locale,
    source: row.source,
    plan: guidedLearningModelResponseSchema.parse(row.plan),
    verifiedResources: row.verifiedResources as VerifiedLearningResource[],
    completedStepIndexes: row.completedStepIndexes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveGuidedLearningPlan(
  studentId: string,
  input: SaveGuidedLearningPlanRequest,
): Promise<SavedGuidedLearningPlan> {
  const id = randomUUID();
  const locale = input.locale ?? "en";

  const verifiedResources = findVerifiedLearningResources({
    goal: input.goal,
    resourceQueries: input.plan.resourceQueries,
    currentLevel: input.currentLevel,
    locale,
    limit: 20,
  });

  const rows = await prisma.$queryRaw<GuidedLearningPlanRow[]>`
    INSERT INTO "GuidedLearningPlan" (
      "id", "studentId", "goal", "currentLevel", "weeklyHours",
      "locale", "source", "plan", "verifiedResources", "completedStepIndexes"
    )
    VALUES (
      ${id},
      ${studentId},
      ${input.goal},
      CAST(${input.currentLevel} AS "CourseLevel"),
      ${input.weeklyHours},
      ${locale},
      ${input.source},
      CAST(${JSON.stringify(input.plan)} AS JSONB),
      CAST(${JSON.stringify(verifiedResources)} AS JSONB),
      ARRAY[]::INTEGER[]
    )
    RETURNING *
  `;

  return serializeRow(rows[0]);
}

export async function listGuidedLearningPlans(
  studentId: string,
): Promise<SavedGuidedLearningPlan[]> {
  const rows = await prisma.$queryRaw<GuidedLearningPlanRow[]>`
    SELECT *
    FROM "GuidedLearningPlan"
    WHERE "studentId" = ${studentId}
    ORDER BY "updatedAt" DESC
    LIMIT 20
  `;

  return rows.map(serializeRow);
}

export async function updateGuidedLearningStepProgress(
  studentId: string,
  planId: string,
  stepIndex: number,
  completed: boolean,
): Promise<SavedGuidedLearningPlan> {
  const existingRows = await prisma.$queryRaw<GuidedLearningPlanRow[]>`
    SELECT *
    FROM "GuidedLearningPlan"
    WHERE "id" = ${planId} AND "studentId" = ${studentId}
    LIMIT 1
  `;

  const existing = existingRows[0];
  if (!existing) throw new GuidedLearningPlanNotFoundError(planId);

  const plan = guidedLearningModelResponseSchema.parse(existing.plan);
  if (stepIndex < 0 || stepIndex >= plan.steps.length) {
    throw new GuidedLearningPlanNotFoundError(planId);
  }

  const updatedRows = completed
    ? await prisma.$queryRaw<GuidedLearningPlanRow[]>`
        UPDATE "GuidedLearningPlan"
        SET
          "completedStepIndexes" = CASE
            WHEN ${stepIndex} = ANY("completedStepIndexes") THEN "completedStepIndexes"
            ELSE array_append("completedStepIndexes", ${stepIndex})
          END,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${planId} AND "studentId" = ${studentId}
        RETURNING *
      `
    : await prisma.$queryRaw<GuidedLearningPlanRow[]>`
        UPDATE "GuidedLearningPlan"
        SET
          "completedStepIndexes" = array_remove("completedStepIndexes", ${stepIndex}),
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${planId} AND "studentId" = ${studentId}
        RETURNING *
      `;

  return serializeRow(updatedRows[0]);
}
