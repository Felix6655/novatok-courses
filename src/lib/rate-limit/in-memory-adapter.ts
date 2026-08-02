import type { RateLimitAdapter, RateLimitResult } from "@/lib/rate-limit/types";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * The smallest thing that fits a single dev/local/single-instance
 * deployment — an in-process `Map`, not a distributed rate limiter. This
 * is the default (and, as of Sprint 7, only implemented) `RateLimitAdapter`.
 * Swap for a shared-store-backed adapter implementing the same interface
 * before running more than one instance in production; nothing in the
 * guards that consume `RateLimitAdapter` needs to change to do that.
 */
export class InMemoryRateLimitAdapter implements RateLimitAdapter {
  private buckets = new Map<string, Bucket>();

  consume(key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.count >= max) {
      return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
    }

    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  reset(): void {
    this.buckets.clear();
  }
}
