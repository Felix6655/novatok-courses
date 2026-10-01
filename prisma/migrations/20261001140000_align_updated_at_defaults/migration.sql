-- Align @updatedAt columns with the Prisma schema.
-- This migration intentionally runs after GuidedLearningPlan is created.

ALTER TABLE "CourseModuleTranslation" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "CourseTranslation" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "GuidedLearningPlan" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "LessonTranslation" ALTER COLUMN "updatedAt" DROP DEFAULT;
