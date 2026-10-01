import { NextResponse } from "next/server";
import { badRequest, internalError, unauthorized } from "@/lib/api-response";
import { guardGuidedLearningMutation } from "@/lib/guided-learning-mutation-guard";
import { saveGuidedLearningPlanSchema } from "@/lib/validation/guided-learning";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import {
  listGuidedLearningPlans,
  saveGuidedLearningPlan,
} from "@/server/guided-learning/saved-plan-service";

export async function GET() {
  try {
    const identity = await getStudentIdentity();
    const plans = await listGuidedLearningPlans(identity.studentId);
    return NextResponse.json({ plans });
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    console.error(error);
    return internalError();
  }
}

export async function POST(request: Request) {
  const guard = await guardGuidedLearningMutation(request, "guided-learning-save");
  if (!guard.ok) return guard.response;

  const parsed = saveGuidedLearningPlanSchema.safeParse(guard.body);
  if (!parsed.success) return badRequest(parsed.error, "Invalid Guided Learning plan");

  try {
    const identity = await getStudentIdentity();
    const plan = await saveGuidedLearningPlan(identity.studentId, parsed.data);
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    console.error(error);
    return internalError();
  }
}
