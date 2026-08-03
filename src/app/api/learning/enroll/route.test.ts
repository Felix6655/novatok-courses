import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetLearningMutationGuardStateForTests } from "@/lib/learning-mutation-guard";

const getStudentIdentity = vi.fn();
const enrollInCourse = vi.fn();

vi.mock("@/server/identity/dev-identity", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/identity/dev-identity")>()),
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/learning/enrollment", () => ({
  enrollInCourse: (...args: unknown[]) => enrollInCourse(...args),
}));

const { POST } = await import("@/app/api/learning/enroll/route");
const { EnrollmentCourseNotFoundError } = await import("@/server/learning/errors");
const { MissingStudentIdentityError } = await import("@/server/identity/dev-identity");

function request(body: unknown) {
  return new Request("http://localhost/api/learning/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getStudentIdentity.mockReset();
  enrollInCourse.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "dev-student-1" });
  __resetLearningMutationGuardStateForTests();
});

describe("POST /api/learning/enroll", () => {
  it("returns 200 with the enrollment for a valid request", async () => {
    enrollInCourse.mockResolvedValue({ id: "enr-1", studentId: "dev-student-1", courseId: "course-1" });

    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.enrollment.id).toBe("enr-1");
    expect(enrollInCourse).toHaveBeenCalledWith("dev-student-1", "javascript-fundamentals");
  });

  it("returns 400 when the request body isn't valid JSON", async () => {
    const response = await POST(request("not json"));
    expect(response.status).toBe(400);
    expect(enrollInCourse).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing courseSlug", async () => {
    const response = await POST(request({}));
    expect(response.status).toBe(400);
  });

  it("returns 404 when the course doesn't exist or isn't published", async () => {
    enrollInCourse.mockRejectedValue(new EnrollmentCourseNotFoundError("draft-course"));
    const response = await POST(request({ courseSlug: "draft-course" }));
    expect(response.status).toBe(404);
  });

  it("returns 401 instead of an unhandled error when no student identity can be resolved", async () => {
    getStudentIdentity.mockRejectedValue(new MissingStudentIdentityError());
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(enrollInCourse).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain("development proxy");
  });

  it("logs and returns 500 with no stack trace for an unexpected error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    enrollInCourse.mockRejectedValue(new Error("something exploded with a secret path"));

    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Unexpected server error");
    expect(JSON.stringify(body)).not.toContain("secret path");
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(String(consoleError.mock.calls[0][0])).toContain("secret path");

    consoleError.mockRestore();
  });

  it("never trusts a client-supplied studentId in the body", async () => {
    enrollInCourse.mockResolvedValue({ id: "enr-1" });
    await POST(request({ courseSlug: "javascript-fundamentals", studentId: "someone-elses-id" }));
    expect(enrollInCourse).toHaveBeenCalledWith("dev-student-1", "javascript-fundamentals");
  });

  it("returns 413 when the request body is too large", async () => {
    const response = await POST(request({ courseSlug: "javascript-fundamentals", junk: "a".repeat(10_000) }));
    expect(response.status).toBe(413);
    expect(enrollInCourse).not.toHaveBeenCalled();
  });

  it("returns 429 after exceeding the mutation rate limit for a client", async () => {
    enrollInCourse.mockResolvedValue({ id: "enr-1" });
    let lastStatus = 0;
    for (let i = 0; i < 31; i++) {
      const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
