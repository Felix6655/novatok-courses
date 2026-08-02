import { z } from "zod";
import { EnvValidationError } from "@/lib/env";
import type { StudentIdentity } from "@/server/identity/types";

const sessionResponseSchema = z.object({ user: z.object({ userId: z.string().min(1) }) });

export class InvalidSocialSessionError extends Error {
  constructor() {
    super("A valid NovaTok Social session is required.");
    this.name = "InvalidSocialSessionError";
  }
}

export async function getNovaTokSocialIdentity(
  cookieHeader: string,
  fetchImpl: typeof fetch = fetch,
): Promise<StudentIdentity> {
  const origin = process.env.NOVATOK_SOCIAL_ORIGIN;
  if (!origin) throw new EnvValidationError("NOVATOK_SOCIAL_ORIGIN is required in novatok-social identity mode.");

  let sessionUrl: URL;
  try { sessionUrl = new URL("/api/auth/session", origin); } catch {
    throw new EnvValidationError("NOVATOK_SOCIAL_ORIGIN must be a valid absolute URL.");
  }

  const response = await fetchImpl(sessionUrl, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new InvalidSocialSessionError();
  const parsed = sessionResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new InvalidSocialSessionError();
  return { studentId: parsed.data.user.userId };
}