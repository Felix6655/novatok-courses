import { z } from "zod";
import type { NovaTokAuthConfig } from "@/server/auth/novatok-config";

const exchangeResponseSchema = z.object({ user: z.object({ id: z.string().uuid() }) });

export class SocialExchangeError extends Error {
  constructor() { super("NovaTok Social authorization exchange failed."); this.name = "SocialExchangeError"; }
}

export async function exchangeSocialAuthorizationCode(
  config: NovaTokAuthConfig,
  code: string,
  verifier: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  let response: Response;
  try {
    response = await fetchImpl(new URL("/api/integrations/courses/exchange", config.socialOrigin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        code,
        code_verifier: verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch { throw new SocialExchangeError(); }
  if (!response.ok) throw new SocialExchangeError();
  try {
    const parsed = exchangeResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new SocialExchangeError();
    return parsed.data.user.id;
  } catch (error) {
    if (error instanceof SocialExchangeError) throw error;
    throw new SocialExchangeError();
  }
}
