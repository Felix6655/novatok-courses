export class GuidedLearningPlanNotFoundError extends Error {
  constructor(planId: string) {
    super(`Guided Learning plan "${planId}" was not found.`);
    this.name = "GuidedLearningPlanNotFoundError";
  }
}
