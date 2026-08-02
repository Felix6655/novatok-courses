export interface RateLimitResult {
  allowed: boolean;
  /** 0 when allowed; seconds until the caller may retry when not allowed. */
  retryAfterSeconds: number;
}

/**
 * Provider-neutral rate-limiting boundary. Request guards
 * (src/lib/ai-request-guard.ts, src/lib/learning-mutation-guard.ts)
 * depend only on this interface, never on a concrete storage mechanism —
 * swapping the in-memory adapter (in-memory-adapter.ts) for a shared one
 * before running more than one instance in production is an adapter
 * change, not a rewrite of guard logic. See docs/production-hardening.md
 * for the production adapter boundary this is designed against.
 */
export interface RateLimitAdapter {
  /**
   * Records one request against `key` within a sliding window of
   * `windowMs` milliseconds, returning whether this request is allowed
   * under `max` requests per window.
   */
  consume(key: string, max: number, windowMs: number): Promise<RateLimitResult> | RateLimitResult;

  /** Clears all tracked state. Intended for tests, not production traffic. */
  reset(): void;
}
