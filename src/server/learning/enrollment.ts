import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { EnrollmentCourseNotFoundError } from "@/server/learning/errors";
import { getCourseBySlug } from "@/server/courses";
import type { SerializedEnrollment } from "@/types/learning";

function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * Raw (unserialized) lookup for internal use by other learning services
 * (progress, resume) that need the enrollment row itself, not an API
 * response shape.
 */
export async function findEnrollment(studentId: string, courseId: string) {
  return prisma.studentEnrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
}

/**
 * Enrolls a student in a PUBLISHED course. Idempotent: calling this again
 * for an already-enrolled student returns the existing enrollment
 * unchanged (does not bump lastAccessedAt — that's a separate concern,
 * see touchEnrollmentAccess). Guards against a create/create race with a
 * unique-constraint retry rather than assuming the findUnique-then-create
 * sequence is atomic.
 */
export async function enrollInCourse(
  studentId: string,
  courseSlug: string,
): Promise<SerializedEnrollment> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new EnrollmentCourseNotFoundError(courseSlug);
  }

  const existing = await findEnrollment(studentId, course.id);
  if (existing) {
    return toJSONSafe(existing);
  }

  try {
    const created = await prisma.studentEnrollment.create({
      data: { studentId, courseId: course.id },
    });
    return toJSONSafe(created);
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      const raceWinner = await prisma.studentEnrollment.findUniqueOrThrow({
        where: { studentId_courseId: { studentId, courseId: course.id } },
      });
      return toJSONSafe(raceWinner);
    }
    throw error;
  }
}

export async function listEnrollments(studentId: string): Promise<SerializedEnrollment[]> {
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId },
    orderBy: { lastAccessedAt: "desc" },
  });
  return toJSONSafe(enrollments);
}

/**
 * Records that a student accessed a course (viewed the learning page),
 * optionally updating which lesson is "current" for resume purposes.
 * Separate from enrollInCourse so re-enrolling never silently resets
 * access bookkeeping.
 */
export async function touchEnrollmentAccess(
  studentId: string,
  courseId: string,
  currentLessonId?: string,
): Promise<SerializedEnrollment> {
  const updated = await prisma.studentEnrollment.update({
    where: { studentId_courseId: { studentId, courseId } },
    data: {
      lastAccessedAt: new Date(),
      ...(currentLessonId ? { currentLessonId } : {}),
    },
  });
  return toJSONSafe(updated);
}
