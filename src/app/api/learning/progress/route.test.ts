import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetLearningMutationGuardStateForTests } from "@/lib/learning-mutation-guard";

const getStudentIdentity = vi.fn();
const markLessonComplete = vi.fn();

vi.mock("@/server/identity/dev-identity", () => ({
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/learning/progress", () => ({
  markLessonComplete: (...args: unknown[]) => markLessonComplete(...args),
}));

const { POST } = await import("@/app/api/learning/progress/route");
const { EnrollmentCourseNotFoundError, LearningLessonNotFoundError, NotEnrolledError } = await import(
  "@/server/learning/errors"
);

function request(body: unknown) {
  return new Request("http://localhost/api/learning/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  getStudentIdentity.mockReset();
  markLessonComplete.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "dev-student-1" });
  __resetLearningMutationGuardStateForTests();
});

describe("POST /api/learning/progress", () => {
  it("returns 200 with the progress result for a valid request", async () => {
    markLessonComplete.mockResolvedValue({
      progress: { id: "prog-1" },
      courseProgress: { totalLessons: 4, completedLessons: 1, percentage: 25, isComplete: false, completedLessonSlugs: ["a"] },
    });

    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.courseProgress.percentage).toBe(25);
    expect(markLessonComplete).toHaveBeenCalledWith(
      "dev-student-1",
      "javascript-fundamentals",
      "variables-and-data-types",
    );
  });

  it("returns 400 for a missing lessonSlug", async () => {
    const response = await POST(request({ courseSlug: "javascript-fundamentals" }));
    expect(response.status).toBe(400);
    expect(markLessonComplete).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown course", async () => {
    markLessonComplete.mockRejectedValue(new EnrollmentCourseNotFoundError("not-a-real-course"));
    const response = await POST(
      request({ courseSlug: "not-a-real-course", lessonSlug: "some-lesson" }),
    );
    expect(response.status).toBe(404);
  });

  it("returns 404 for a lesson that doesn't belong to the course", async () => {
    markLessonComplete.mockRejectedValue(
      new LearningLessonNotFoundError("javascript-fundamentals", "a-lesson-from-another-course"),
    );
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "a-lesson-from-another-course" }),
    );
    expect(response.status).toBe(404);
  });

  it("returns 403 when the student isn't enrolled", async () => {
    markLessonComplete.mockRejectedValue(new NotEnrolledError("javascript-fundamentals"));
    const response = await POST(
      request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
    );
    expect(response.status).toBe(403);
  });

  it("returns 429 after exceeding the mutation rate limit for a client", async () => {
    markLessonComplete.mockResolvedValue({
      progress: { id: "prog-1" },
      courseProgress: { totalLessons: 4, completedLessons: 1, percentage: 25, isComplete: false, completedLessonSlugs: ["a"] },
    });
    let lastStatus = 0;
    for (let i = 0; i < 31; i++) {
      const response = await POST(
        request({ courseSlug: "javascript-fundamentals", lessonSlug: "variables-and-data-types" }),
      );
      lastStatus = response.status;
    }
    expect(lastStatus).toBe(429);
  });
});
