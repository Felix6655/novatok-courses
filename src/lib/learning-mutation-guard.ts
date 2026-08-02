import { NextResponse } from "next/server";
import { InMemoryRateLimitAdapter } from "@/lib/rate-limit/in-memory-adapter";
import type { RateLimitAdapter } from "@/lib/rate-limit/types";

const MAX_BODY_BYTES = 5_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
/** More generous than the AI guard's 10/min — these are cheap DB writes, not AI calls. */
const RATE_LIMIT_MAX_REQUESTS = 30;

/**
 * Same RateLimitAdapter boundary as src/lib/ai-request-guard.ts, but its
 * own instance/namespace — this guard has no concurrency-cap concept at
 * all (see the module doc comment below), only a rate limit.
 */
const rateLimitAdapter: RateLimitAdapter = new InMemoryRateLimitAdapter();

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export type LearningMutationGuardResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse };

/**
 * Lightweight, proportionate protection for plain (non-AI) learning
 * mutation endpoints (enroll, mark-complete) against obvious rapid/repeated
 * abuse from one client — a per-IP rate limit only, deliberately without
 * the AI guard's concurrency cap (src/lib/ai-request-guard.ts), since these
 * are fast DB writes, not calls to a single local Ollama instance that
 * needs protecting from pile-ups. Same in-memory, single-process trade-off
 * as the AI guard, for the same reason: swap the internals for a shared
 * store before running more than one instance in production.
 */
export async function guardLearningMutation(
  request: Request,
  endpoint: string,
): Promise<LearningMutationGuardResult> {
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

  const rateLimitKey = `${endpoint}:${getClientKey(request)}`;
  const rate = await rateLimitAdapter.consume(rateLimitKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
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

/** Test-only: clears in-memory guard state between test cases. */
export function __resetLearningMutationGuardStateForTests(): void {
  rateLimitAdapter.reset();
}
