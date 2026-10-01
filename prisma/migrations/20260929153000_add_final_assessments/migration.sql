CREATE TABLE "CourseExamAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "score" INTEGER,
    "passed" BOOLEAN,
    "submittedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseExamAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseExamQuestion" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "choices" TEXT[],
    "correctChoiceIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    CONSTRAINT "CourseExamQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseExamAttempt_studentId_courseId_idx" ON "CourseExamAttempt"("studentId", "courseId");
CREATE INDEX "CourseExamAttempt_expiresAt_idx" ON "CourseExamAttempt"("expiresAt");
CREATE UNIQUE INDEX "CourseExamQuestion_attemptId_displayOrder_key" ON "CourseExamQuestion"("attemptId", "displayOrder");
CREATE INDEX "CourseExamQuestion_attemptId_idx" ON "CourseExamQuestion"("attemptId");
CREATE INDEX "CourseExamQuestion_lessonId_idx" ON "CourseExamQuestion"("lessonId");

ALTER TABLE "CourseExamAttempt" ADD CONSTRAINT "CourseExamAttempt_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseExamQuestion" ADD CONSTRAINT "CourseExamQuestion_attemptId_fkey"
FOREIGN KEY ("attemptId") REFERENCES "CourseExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseExamQuestion" ADD CONSTRAINT "CourseExamQuestion_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
