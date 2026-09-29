import { beforeEach, describe, expect, it, vi } from "vitest";

const getCourseBySlug = vi.fn();
const findEnrollment = vi.fn();
const calculateCourseProgress = vi.fn();
const upsert = vi.fn();
const findUnique = vi.fn();

vi.mock("@/server/courses", () => ({ getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args) }));
vi.mock("@/server/learning/enrollment", () => ({ findEnrollment: (...args: unknown[]) => findEnrollment(...args) }));
vi.mock("@/server/learning/progress", () => ({ calculateCourseProgress: (...args: unknown[]) => calculateCourseProgress(...args) }));
vi.mock("@/lib/prisma", () => ({
  prisma: { courseCertificate: {
    upsert: (...args: unknown[]) => upsert(...args),
    findUnique: (...args: unknown[]) => findUnique(...args),
  } },
}));

const { issueCourseCertificate, getCertificateByCredentialId } = await import("@/server/learning/certificate");
const {
  CertificateUnavailableError,
  CourseNotCompleteError,
  EnrollmentCourseNotFoundError,
  NotEnrolledError,
} = await import("@/server/learning/errors");

const course = {
  id: "course-1",
  slug: "javascript-fundamentals",
  title: "JavaScript Fundamentals",
  instructorName: "NovaTok Academy",
  certificateAvailable: true,
};

beforeEach(() => {
  getCourseBySlug.mockReset();
  findEnrollment.mockReset();
  calculateCourseProgress.mockReset();
  upsert.mockReset();
  findUnique.mockReset();
  getCourseBySlug.mockResolvedValue(course);
  findEnrollment.mockResolvedValue({ id: "enrollment-1" });
  calculateCourseProgress.mockResolvedValue({ isComplete: true });
});

describe("issueCourseCertificate", () => {
  it("rejects unknown, unavailable, unenrolled, and incomplete courses", async () => {
    getCourseBySlug.mockResolvedValueOnce(null);
    await expect(issueCourseCertificate("student-1", "missing")).rejects.toBeInstanceOf(EnrollmentCourseNotFoundError);

    getCourseBySlug.mockResolvedValueOnce({ ...course, certificateAvailable: false });
    await expect(issueCourseCertificate("student-1", course.slug)).rejects.toBeInstanceOf(CertificateUnavailableError);

    findEnrollment.mockResolvedValueOnce(null);
    await expect(issueCourseCertificate("student-1", course.slug)).rejects.toBeInstanceOf(NotEnrolledError);

    calculateCourseProgress.mockResolvedValueOnce({ isComplete: false });
    await expect(issueCourseCertificate("student-1", course.slug)).rejects.toBeInstanceOf(CourseNotCompleteError);
  });

  it("upserts one permanent certificate per student and course", async () => {
    const issuedAt = new Date("2026-09-29T12:00:00Z");
    upsert.mockResolvedValue({
      credentialId: "11111111-1111-4111-8111-111111111111",
      issuedAt,
      course,
    });

    const result = await issueCourseCertificate("student-1", course.slug);

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { studentId_courseId: { studentId: "student-1", courseId: "course-1" } },
      update: {},
      create: expect.objectContaining({ studentId: "student-1", courseId: "course-1" }),
    }));
    expect(result.verificationPath).toBe("/certificates/11111111-1111-4111-8111-111111111111");
  });
});

describe("getCertificateByCredentialId", () => {
  it("returns null for an unknown credential", async () => {
    findUnique.mockResolvedValue(null);
    await expect(getCertificateByCredentialId("missing")).resolves.toBeNull();
  });
});
