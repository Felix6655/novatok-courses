import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const findVerifiedLearningResources = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
  },
}));

vi.mock("@/server/guided-learning/providers/registry", () => ({
  findVerifiedLearningResources: (...args: unknown[]) =>
    findVerifiedLearningResources(...args),
}));

const {
  listGuidedLearningPlans,
  saveGuidedLearningPlan,
  updateGuidedLearningStepProgress,
} = await import("@/server/guided-learning/saved-plan-service");
const { GuidedLearningPlanNotFoundError } = await import(
  "@/server/guided-learning/saved-plan-errors"
);

const planSnapshot = {
  goalSummary: "Learn AI",
  estimatedWeeks: 4,
  steps: [
    { title: "Foundations", outcome: "Understand AI", topics: ["AI"], practice: [] },
    { title: "Project", outcome: "Build something", topics: ["Project"], practice: [] },
  ],
  studyTips: [],
  resourceQueries: ["AI beginner course"],
};

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: "plan-1",
    studentId: "student-1",
    goal: "Learn AI",
    currentLevel: "BEGINNER",
    weeklyHours: 5,
    locale: "en",
    source: "ai",
    plan: planSnapshot,
    verifiedResources: [],
    completedStepIndexes: [],
    createdAt: new Date("2026-10-01T12:00:00Z"),
    updatedAt: new Date("2026-10-01T12:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  queryRaw.mockReset();
  findVerifiedLearningResources.mockReset();
});

describe("saved Guided Learning plan service", () => {
  it("recomputes verified resources server-side when saving", async () => {
    const verified = [{ id: "google-ml", provider: "google" }];
    findVerifiedLearningResources.mockReturnValue(verified);
    queryRaw.mockResolvedValue([row({ verifiedResources: verified })]);

    const result = await saveGuidedLearningPlan("student-1", {
      goal: "Learn AI",
      currentLevel: "BEGINNER",
      weeklyHours: 5,
      locale: "en",
      source: "ai",
      plan: planSnapshot,
    });

    expect(findVerifiedLearningResources).toHaveBeenCalledWith(
      expect.objectContaining({
        goal: "Learn AI",
        currentLevel: "BEGINNER",
        resourceQueries: ["AI beginner course"],
      }),
    );
    expect(result.verifiedResources).toEqual(verified);
  });

  it("lists serialized plans for only the supplied student query", async () => {
    queryRaw.mockResolvedValue([row()]);
    const result = await listGuidedLearningPlans("student-1");
    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toBe("2026-10-01T12:00:00.000Z");
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("rejects progress updates for a missing or unowned plan", async () => {
    queryRaw.mockResolvedValueOnce([]);
    await expect(
      updateGuidedLearningStepProgress("student-1", "other-plan", 0, true),
    ).rejects.toBeInstanceOf(GuidedLearningPlanNotFoundError);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("rejects a step outside the saved snapshot", async () => {
    queryRaw.mockResolvedValueOnce([row()]);
    await expect(
      updateGuidedLearningStepProgress("student-1", "plan-1", 5, true),
    ).rejects.toBeInstanceOf(GuidedLearningPlanNotFoundError);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns the updated completed-step indexes", async () => {
    queryRaw
      .mockResolvedValueOnce([row()])
      .mockResolvedValueOnce([row({ completedStepIndexes: [1] })]);

    const result = await updateGuidedLearningStepProgress(
      "student-1",
      "plan-1",
      1,
      true,
    );

    expect(result.completedStepIndexes).toEqual([1]);
    expect(queryRaw).toHaveBeenCalledTimes(2);
  });
});
