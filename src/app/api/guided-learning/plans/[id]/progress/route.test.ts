import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetGuidedLearningMutationGuardForTests } from "@/lib/guided-learning-mutation-guard";

const getStudentIdentity = vi.fn();
const updateGuidedLearningStepProgress = vi.fn();

vi.mock("@/server/identity/dev-identity", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/identity/dev-identity")>()),
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/guided-learning/saved-plan-service", () => ({
  updateGuidedLearningStepProgress: (...args: unknown[]) =>
    updateGuidedLearningStepProgress(...args),
}));

const { PATCH } = await import("@/app/api/guided-learning/plans/[id]/progress/route");
const { GuidedLearningPlanNotFoundError } = await import(
  "@/server/guided-learning/saved-plan-errors"
);

function request(body: unknown) {
  return new Request("http://localhost/api/guided-learning/plans/plan-1/progress", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getStudentIdentity.mockReset();
  updateGuidedLearningStepProgress.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "student-1" });
  __resetGuidedLearningMutationGuardForTests();
});

describe("PATCH /api/guided-learning/plans/[id]/progress", () => {
  it("updates one step using trusted ownership", async () => {
    updateGuidedLearningStepProgress.mockResolvedValue({
      id: "plan-1",
      completedStepIndexes: [1],
    });
    const response = await PATCH(request({ stepIndex: 1, completed: true }), {
      params: Promise.resolve({ id: "plan-1" }),
    });
    expect(response.status).toBe(200);
    expect(updateGuidedLearningStepProgress).toHaveBeenCalledWith(
      "student-1",
      "plan-1",
      1,
      true,
    );
  });

  it("returns 404 when the plan is not owned by the student", async () => {
    updateGuidedLearningStepProgress.mockRejectedValue(
      new GuidedLearningPlanNotFoundError("plan-1"),
    );
    const response = await PATCH(request({ stepIndex: 0, completed: true }), {
      params: Promise.resolve({ id: "plan-1" }),
    });
    expect(response.status).toBe(404);
  });

  it("rejects an invalid step index", async () => {
    const response = await PATCH(request({ stepIndex: 99, completed: true }), {
      params: Promise.resolve({ id: "plan-1" }),
    });
    expect(response.status).toBe(400);
    expect(updateGuidedLearningStepProgress).not.toHaveBeenCalled();
  });
});
