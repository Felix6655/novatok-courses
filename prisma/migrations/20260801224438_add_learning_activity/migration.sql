-- CreateEnum
CREATE TYPE "LearningActivityType" AS ENUM ('LESSON_STARTED', 'LESSON_COMPLETED', 'TUTOR_QUESTION', 'PRACTICE_ATTEMPT', 'COACH_REQUEST');

-- CreateTable
CREATE TABLE "LearningActivity" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "type" "LearningActivityType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningActivity_studentId_courseId_idx" ON "LearningActivity"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "LearningActivity_studentId_lessonId_idx" ON "LearningActivity"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "LearningActivity_courseId_type_idx" ON "LearningActivity"("courseId", "type");

-- AddForeignKey
ALTER TABLE "LearningActivity" ADD CONSTRAINT "LearningActivity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningActivity" ADD CONSTRAINT "LearningActivity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
