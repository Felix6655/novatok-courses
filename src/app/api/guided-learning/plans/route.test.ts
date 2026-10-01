import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetGuidedLearningMutationGuardForTests } from "@/lib/guided-learning-mutation-guard";

const getStudentIdentity = vi.fn();
const listGuidedLearningPlans = vi.fn();
const saveGuidedLearningPlan = vi.fn();

vi.mock("@/server/identity/dev-identity", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/identity/dev-identity")>()),
  getStudentIdentity: (...args: unknown[]) => getStudentIdentity(...args),
}));
vi.mock("@/server/guided-learning/saved-plan-service", () => ({
  listGuidedLearningPlans: (...args: unknown[]) => listGuidedLearningPlans(...args),
  saveGuidedLearningPlan: (...args: unknown[]) => saveGuidedLearningPlan(...args),
}));

const { GET, POST } = await import("@/app/api/guided-learning/plans/route");

function request(body: unknown) {
  return new Request("http://localhost/api/guided-learning/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPlan = {
  goal: "Learn AI",
  currentLevel: "BEGINNER",
  weeklyHours: 5,
  locale: "en",
  source: "ai",
  plan: {
    goalSummary: "Learn AI",
    estimatedWeeks: 4,
    steps: [
      { title: "Foundations", outcome: "Understand AI", topics: ["AI"], practice: [] },
      { title: "Practice", outcome: "Build something", topics: ["Projects"], practice: [] },
    ],
    studyTips: [],
    resourceQueries: ["AI beginner course"],
  },
};

beforeEach(() => {
  getStudentIdentity.mockReset();
  listGuidedLearningPlans.mockReset();
  saveGuidedLearningPlan.mockReset();
  getStudentIdentity.mockResolvedValue({ studentId: "student-1" });
  __resetGuidedLearningMutationGuardForTests();
});

describe("/api/guided-learning/plans", () => {
  it("lists only the trusted student's plans", async () => {
    listGuidedLearningPlans.mockResolvedValue([{ id: "plan-1" }]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(listGuidedLearningPlans).toHaveBeenCalledWith("student-1");
  });

  it("saves a validated plan for the trusted student", async () => {
    saveGuidedLearningPlan.mockResolvedValue({ id: "plan-1", ...validPlan });
    const response = await POST(request({ ...validPlan, studentId: "attacker-controlled" }));
    expect(response.status).toBe(201);
    expect(saveGuidedLearningPlan).toHaveBeenCalledWith(
      "student-1",
      expect.objectContaining({ goal: "Learn AI" }),
    );
  });

  it("rejects an invalid plan snapshot", async () => {
    const response = await POST(request({ goal: "x" }));
    expect(response.status).toBe(400);
    expect(saveGuidedLearningPlan).not.toHaveBeenCalled();
  });
});
