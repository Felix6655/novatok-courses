CREATE TYPE "TranslationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'PUBLISHED');
ALTER TABLE "CourseTranslation" ADD COLUMN "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT', ADD COLUMN "reviewedAt" TIMESTAMP(3), ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CourseModuleTranslation" ADD COLUMN "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT', ADD COLUMN "reviewedAt" TIMESTAMP(3), ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "LessonTranslation" ADD COLUMN "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT', ADD COLUMN "reviewedAt" TIMESTAMP(3), ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "CourseTranslation_locale_status_idx" ON "CourseTranslation"("locale", "status");
CREATE INDEX "CourseModuleTranslation_locale_status_idx" ON "CourseModuleTranslation"("locale", "status");
CREATE INDEX "LessonTranslation_locale_status_idx" ON "LessonTranslation"("locale", "status");
