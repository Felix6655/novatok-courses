CREATE TABLE "GuidedLearningPlan" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "currentLevel" "CourseLevel" NOT NULL,
  "weeklyHours" INTEGER NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "source" TEXT NOT NULL,
  "goalSummary" TEXT NOT NULL,
  "estimatedWeeks" INTEGER NOT NULL,
  "steps" JSONB NOT NULL,
  "studyTips" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "resourceQueries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "verifiedResources" JSONB NOT NULL,
  "completedStepIndexes" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GuidedLearningPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GuidedLearningPlan_studentId_updatedAt_idx"
ON "GuidedLearningPlan"("studentId", "updatedAt");
