import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryRateLimitAdapter } from "@/lib/rate-limit/in-memory-adapter";

let adapter: InMemoryRateLimitAdapter;

beforeEach(() => {
  adapter = new InMemoryRateLimitAdapter();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("InMemoryRateLimitAdapter", () => {
  it("allows requests up to the max within a window", () => {
    for (let i = 0; i < 5; i++) {
      expect(adapter.consume("key", 5, 60_000).allowed).toBe(true);
    }
  });

  it("rejects the request that exceeds max, with a positive retryAfterSeconds", () => {
    for (let i = 0; i < 5; i++) adapter.consume("key", 5, 60_000);
    const result = adapter.consume("key", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the count after the window elapses", () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) adapter.consume("key", 5, 60_000);
    expect(adapter.consume("key", 5, 60_000).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(adapter.consume("key", 5, 60_000).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    for (let i = 0; i < 5; i++) adapter.consume("key-a", 5, 60_000);
    expect(adapter.consume("key-a", 5, 60_000).allowed).toBe(false);
    expect(adapter.consume("key-b", 5, 60_000).allowed).toBe(true);
  });

  it("reset() clears all tracked state", () => {
    for (let i = 0; i < 5; i++) adapter.consume("key", 5, 60_000);
    expect(adapter.consume("key", 5, 60_000).allowed).toBe(false);

    adapter.reset();

    expect(adapter.consume("key", 5, 60_000).allowed).toBe(true);
  });
});
