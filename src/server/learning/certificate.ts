import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCourseBySlug } from "@/server/courses";
import { findEnrollment } from "@/server/learning/enrollment";
import {
  CertificateUnavailableError,
  CourseNotCompleteError,
  EnrollmentCourseNotFoundError,
  NotEnrolledError,
} from "@/server/learning/errors";
import { calculateCourseProgress } from "@/server/learning/progress";

export interface CourseCertificateView {
  credentialId: string;
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  verificationPath: string;
}

function toView(certificate: {
  credentialId: string;
  issuedAt: Date;
  course: { slug: string; title: string; instructorName: string };
}): CourseCertificateView {
  return {
    credentialId: certificate.credentialId,
    courseSlug: certificate.course.slug,
    courseTitle: certificate.course.title,
    instructorName: certificate.course.instructorName,
    issuedAt: certificate.issuedAt.toISOString(),
    verificationPath: `/certificates/${certificate.credentialId}`,
  };
}

export async function issueCourseCertificate(
  studentId: string,
  courseSlug: string,
): Promise<CourseCertificateView> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) throw new EnrollmentCourseNotFoundError(courseSlug);
  if (!course.certificateAvailable) throw new CertificateUnavailableError(courseSlug);

  const enrollment = await findEnrollment(studentId, course.id);
  if (!enrollment) throw new NotEnrolledError(courseSlug);

  const progress = await calculateCourseProgress(studentId, course.id);
  if (!progress.isComplete) throw new CourseNotCompleteError(courseSlug);

  const certificate = await prisma.courseCertificate.upsert({
    where: { studentId_courseId: { studentId, courseId: course.id } },
    update: {},
    create: {
      credentialId: randomUUID(),
      studentId,
      courseId: course.id,
    },
    include: {
      course: { select: { slug: true, title: true, instructorName: true } },
    },
  });

  return toView(certificate);
}

export async function getCertificateByCredentialId(
  credentialId: string,
): Promise<CourseCertificateView | null> {
  const certificate = await prisma.courseCertificate.findUnique({
    where: { credentialId },
    include: {
      course: { select: { slug: true, title: true, instructorName: true } },
    },
  });
  return certificate ? toView(certificate) : null;
}
