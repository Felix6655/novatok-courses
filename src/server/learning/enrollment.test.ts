import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const findUnique = vi.fn();
const findUniqueOrThrow = vi.fn();
const create = vi.fn();
const update = vi.fn();
const findMany = vi.fn();
const getCourseBySlug = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    studentEnrollment: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      findUniqueOrThrow: (...args: unknown[]) => findUniqueOrThrow(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
      findMany: (...args: unknown[]) => findMany(...args),
    },
  },
}));

vi.mock("@/server/courses", () => ({
  getCourseBySlug: (...args: unknown[]) => getCourseBySlug(...args),
}));

const { enrollInCourse, listEnrollments, touchEnrollmentAccess, findEnrollment } = await import(
  "@/server/learning/enrollment"
);
const { EnrollmentCourseNotFoundError } = await import("@/server/learning/errors");

const course = { id: "course-1", slug: "javascript-fundamentals", title: "JavaScript Fundamentals" };

beforeEach(() => {
  findUnique.mockReset();
  findUniqueOrThrow.mockReset();
  create.mockReset();
  update.mockReset();
  findMany.mockReset();
  getCourseBySlug.mockReset();
});

describe("enrollInCourse", () => {
  it("throws EnrollmentCourseNotFoundError when the course doesn't exist or isn't published", async () => {
    getCourseBySlug.mockResolvedValue(null);
    await expect(enrollInCourse("student-1", "not-a-real-course")).rejects.toBeInstanceOf(
      EnrollmentCourseNotFoundError,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("returns the existing enrollment unchanged when already enrolled (idempotent)", async () => {
    getCourseBySlug.mockResolvedValue(course);
    const existing = { id: "enr-1", studentId: "student-1", courseId: "course-1" };
    findUnique.mockResolvedValue(existing);

    const result = await enrollInCourse("student-1", "javascript-fundamentals");

    expect(result).toEqual(existing);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates a new enrollment when none exists", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findUnique.mockResolvedValue(null);
    const created = { id: "enr-2", studentId: "student-1", courseId: "course-1" };
    create.mockResolvedValue(created);

    const result = await enrollInCourse("student-1", "javascript-fundamentals");

    expect(create).toHaveBeenCalledWith({ data: { studentId: "student-1", courseId: "course-1" } });
    expect(result).toEqual(created);
  });

  it("recovers from a unique-constraint race by fetching the winning row", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findUnique.mockResolvedValue(null);
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    const raceWinner = { id: "enr-3", studentId: "student-1", courseId: "course-1" };
    findUniqueOrThrow.mockResolvedValue(raceWinner);

    const result = await enrollInCourse("student-1", "javascript-fundamentals");
    expect(result).toEqual(raceWinner);
  });

  it("propagates non-unique-constraint errors from create", async () => {
    getCourseBySlug.mockResolvedValue(course);
    findUnique.mockResolvedValue(null);
    create.mockRejectedValue(new Error("connection lost"));

    await expect(enrollInCourse("student-1", "javascript-fundamentals")).rejects.toThrow(
      "connection lost",
    );
  });
});

describe("findEnrollment", () => {
  it("looks up by the compound (studentId, courseId) key", async () => {
    findUnique.mockResolvedValue(null);
    await findEnrollment("student-1", "course-1");
    expect(findUnique).toHaveBeenCalledWith({
      where: { studentId_courseId: { studentId: "student-1", courseId: "course-1" } },
    });
  });
});

describe("listEnrollments", () => {
  it("scopes to the given studentId, ordered by lastAccessedAt desc", async () => {
    findMany.mockResolvedValue([]);
    await listEnrollments("student-1");
    expect(findMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      orderBy: { lastAccessedAt: "desc" },
    });
  });
});

describe("touchEnrollmentAccess", () => {
  it("updates lastAccessedAt and optionally currentLessonId", async () => {
    update.mockResolvedValue({});
    await touchEnrollmentAccess("student-1", "course-1", "lesson-1");
    const call = update.mock.calls[0][0];
    expect(call.where).toEqual({ studentId_courseId: { studentId: "student-1", courseId: "course-1" } });
    expect(call.data.currentLessonId).toBe("lesson-1");
    expect(call.data.lastAccessedAt).toBeInstanceOf(Date);
  });

  it("omits currentLessonId when not provided", async () => {
    update.mockResolvedValue({});
    await touchEnrollmentAccess("student-1", "course-1");
    const call = update.mock.calls[0][0];
    expect(call.data).not.toHaveProperty("currentLessonId");
  });
});
