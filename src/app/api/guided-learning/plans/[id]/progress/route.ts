import { NextResponse } from "next/server";
import { badRequest, internalError, notFound, unauthorized } from "@/lib/api-response";
import { guardGuidedLearningMutation } from "@/lib/guided-learning-mutation-guard";
import { updateGuidedLearningProgressSchema } from "@/lib/validation/guided-learning";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import { GuidedLearningPlanNotFoundError } from "@/server/guided-learning/saved-plan-errors";
import { updateGuidedLearningStepProgress } from "@/server/guided-learning/saved-plan-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await guardGuidedLearningMutation(request, "guided-learning-progress");
  if (!guard.ok) return guard.response;

  const parsed = updateGuidedLearningProgressSchema.safeParse(guard.body);
  if (!parsed.success) return badRequest(parsed.error, "Invalid progress update");

  try {
    const [{ id }, identity] = await Promise.all([context.params, getStudentIdentity()]);
    const plan = await updateGuidedLearningStepProgress(
      identity.studentId,
      id,
      parsed.data.stepIndex,
      parsed.data.completed,
    );
    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) {
      return unauthorized();
    }
    if (error instanceof GuidedLearningPlanNotFoundError) return notFound(error.message);
    console.error(error);
    return internalError();
  }
}
