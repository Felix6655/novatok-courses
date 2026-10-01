CREATE TABLE "CourseCertificate" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseCertificate_credentialId_key" ON "CourseCertificate"("credentialId");
CREATE UNIQUE INDEX "CourseCertificate_studentId_courseId_key" ON "CourseCertificate"("studentId", "courseId");
CREATE INDEX "CourseCertificate_studentId_idx" ON "CourseCertificate"("studentId");
CREATE INDEX "CourseCertificate_courseId_idx" ON "CourseCertificate"("courseId");

ALTER TABLE "CourseCertificate"
ADD CONSTRAINT "CourseCertificate_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
