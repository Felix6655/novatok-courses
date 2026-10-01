import { NextResponse } from "next/server";
import { InMemoryRateLimitAdapter } from "@/lib/rate-limit/in-memory-adapter";

const MAX_BODY_BYTES = 25_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitAdapter = new InMemoryRateLimitAdapter();

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type GuidedLearningMutationGuardResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse };

export async function guardGuidedLearningMutation(
  request: Request,
  endpoint: string,
): Promise<GuidedLearningMutationGuardResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body too large" }, { status: 413 }),
    };
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body too large" }, { status: 413 }),
    };
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }),
    };
  }

  const key = `${endpoint}:${getClientKey(request)}`;
  const rate = await rateLimitAdapter.consume(key, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
  if (!rate.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      ),
    };
  }

  return { ok: true, body };
}

export function __resetGuidedLearningMutationGuardForTests(): void {
  rateLimitAdapter.reset();
}
