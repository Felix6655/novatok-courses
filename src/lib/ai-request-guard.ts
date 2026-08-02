import { NextResponse } from "next/server";
import { InMemoryRateLimitAdapter } from "@/lib/rate-limit/in-memory-adapter";
import type { RateLimitAdapter } from "@/lib/rate-limit/types";

const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_CONCURRENT_AI_CALLS = 2;

/**
 * Rate limiting goes through the RateLimitAdapter boundary (see
 * src/lib/rate-limit/types.ts) so this file no longer manipulates
 * in-memory state directly — swap `rateLimitAdapter` for a shared-store
 * implementation before running more than one instance in production.
 *
 * The concurrency cap below is deliberately NOT part of that
 * abstraction: it caps how many calls THIS process has in flight against
 * a single local Ollama instance, which is inherently a per-process
 * concern (coordinating it across instances would mean a distributed
 * work queue, a materially different and heavier problem than rate
 * limiting, and out of scope until there's an actual need to run more
 * than one instance against one Ollama).
 */
const rateLimitAdapter: RateLimitAdapter = new InMemoryRateLimitAdapter();
const concurrencyByEndpoint = new Map<string, number>();

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function acquireConcurrencySlot(endpoint: string): boolean {
  const current = concurrencyByEndpoint.get(endpoint) ?? 0;
  if (current >= MAX_CONCURRENT_AI_CALLS) return false;
  concurrencyByEndpoint.set(endpoint, current + 1);
  return true;
}

function releaseConcurrencySlot(endpoint: string): void {
  const current = concurrencyByEndpoint.get(endpoint) ?? 0;
  concurrencyByEndpoint.set(endpoint, Math.max(0, current - 1));
}

export type AIRequestGuardResult =
  | { ok: true; body: unknown; release: () => void }
  | { ok: false; response: NextResponse };

/**
 * Lightweight, single-instance protection for AI endpoints: rejects
 * oversized bodies, rate-limits by client IP, and caps how many AI calls
 * can be in flight at once so a burst of requests can't pile up against
 * one local Ollama instance. Deliberately in-memory and per-process — the
 * smallest thing that fits a single dev/local instance, not a
 * distributed rate limiter. Swap the internals for a shared store (e.g.
 * Redis) behind this same function signature before running more than
 * one instance in production; nothing above this function needs to
 * change.
 *
 * Note: reading the full body before checking its length means an
 * attacker who omits Content-Length can still force a full read before
 * rejection. That's an acceptable trade-off for guarding against
 * accidental/local abuse, not a hardened defense against a malicious
 * network attacker.
 */
export async function guardAIRequest(
  request: Request,
  endpoint: string,
): Promise<AIRequestGuardResult> {
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

  if (!acquireConcurrencySlot(endpoint)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "The AI provider is busy handling other requests right now. Please try again shortly." },
        { status: 429 },
      ),
    };
  }

  return { ok: true, body, release: () => releaseConcurrencySlot(endpoint) };
}

/** Test-only: clears in-memory guard state between test cases. */
export function __resetAIRequestGuardStateForTests(): void {
  rateLimitAdapter.reset();
  concurrencyByEndpoint.clear();
}
