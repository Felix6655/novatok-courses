import "dotenv/config";
import { prisma } from "@/lib/prisma";
import {
  listGuidedLearningPlans,
  saveGuidedLearningPlan,
  updateGuidedLearningStepProgress,
} from "@/server/guided-learning/saved-plan-service";

const studentId = `guided-learning-smoke-${Date.now()}`;
let createdPlanId: string | null = null;
let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("Guided Learning persistence smoke\n");

  const created = await saveGuidedLearningPlan(studentId, {
    goal: "Learn artificial intelligence and machine learning",
    currentLevel: "BEGINNER",
    weeklyHours: 5,
    locale: "en",
    source: "ai",
    plan: {
      goalSummary: "Learn practical AI and machine learning",
      estimatedWeeks: 6,
      steps: [
        {
          title: "Foundations",
          outcome: "Understand core AI and ML concepts.",
          topics: ["artificial intelligence", "machine learning"],
          practice: ["Explain the difference between AI and ML in your own words."],
        },
        {
          title: "First project",
          outcome: "Build and evaluate one small ML project.",
          topics: ["classification", "model evaluation"],
          practice: ["Train and evaluate a simple classifier."],
        },
      ],
      studyTips: ["Practice every week."],
      resourceQueries: ["machine learning beginner course"],
    },
  });
  createdPlanId = created.id;

  check("plan saved to PostgreSQL", Boolean(created.id));
  check("starts with no completed steps", created.completedStepIndexes.length === 0);
  check(
    "verified resources were recomputed server-side",
    created.verifiedResources.length > 0,
    `got ${created.verifiedResources.length}`,
  );

  const completed = await updateGuidedLearningStepProgress(
    studentId,
    created.id,
    0,
    true,
  );
  check(
    "step 0 marked complete",
    completed.completedStepIndexes.includes(0),
  );

  const listed = await listGuidedLearningPlans(studentId);
  check("saved path can be reloaded", listed.length === 1, `got ${listed.length}`);
  check(
    "reloaded progress persisted",
    listed[0]?.completedStepIndexes.includes(0) === true,
  );
  check(
    "reloaded plan snapshot preserved",
    listed[0]?.plan.goalSummary === "Learn practical AI and machine learning",
  );

  const reopened = await updateGuidedLearningStepProgress(
    studentId,
    created.id,
    0,
    false,
  );
  check(
    "step can be reopened",
    !reopened.completedStepIndexes.includes(0),
  );

  console.log(
    `\n${failures === 0 ? "All Guided Learning persistence checks passed." : `${failures} check(s) FAILED.`}`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error) => {
    failures++;
    console.error("Guided Learning persistence smoke crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (createdPlanId) {
      await prisma.$executeRaw`
        DELETE FROM "GuidedLearningPlan"
        WHERE "id" = ${createdPlanId} AND "studentId" = ${studentId}
      `;
    }
    await prisma.$disconnect();
  });
