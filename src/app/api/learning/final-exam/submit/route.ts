import { NextResponse } from "next/server";
import { z } from "zod";
import { internalError, notFound, unauthorized } from "@/lib/api-response";
import { guardLearningMutation } from "@/lib/learning-mutation-guard";
import { getStudentIdentity, MissingStudentIdentityError } from "@/server/identity/dev-identity";
import { InvalidSocialSessionError } from "@/server/identity/novatok-social-identity";
import { FinalExamAttemptNotFoundError } from "@/server/learning/errors";
import { submitFinalExam } from "@/server/learning/final-exam";

const schema = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(z.number().int().min(0).max(3)).min(1).max(10),
});

export async function POST(request: Request) {
  const guard = await guardLearningMutation(request, "final-exam-submit");
  if (!guard.ok) return guard.response;
  const parsed = schema.safeParse(guard.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  try {
    const identity = await getStudentIdentity();
    return NextResponse.json(await submitFinalExam(identity.studentId, parsed.data.attemptId, parsed.data.answers));
  } catch (error) {
    if (error instanceof MissingStudentIdentityError || error instanceof InvalidSocialSessionError) return unauthorized();
    if (error instanceof FinalExamAttemptNotFoundError) return notFound(error.message);
    console.error(error);
    return internalError();
  }
}
