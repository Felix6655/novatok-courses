import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetLearningMutationGuardStateForTests,
  guardLearningMutation,
} from "@/lib/learning-mutation-guard";

function request(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/learning/test-endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: text,
  });
}

beforeEach(() => {
  __resetLearningMutationGuardStateForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("guardLearningMutation", () => {
  it("allows a small, well-formed request and returns its parsed body", async () => {
    const result = await guardLearningMutation(request({ courseSlug: "javascript-fundamentals" }), "enroll");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toEqual({ courseSlug: "javascript-fundamentals" });
    }
  });

  it("rejects malformed JSON with 400", async () => {
    const result = await guardLearningMutation(request("not json"), "enroll");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });

  it("rejects an oversized body based on Content-Length with 413", async () => {
    const result = await guardLearningMutation(
      request({ courseSlug: "x" }, { "Content-Length": "999999" }),
      "enroll",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("rejects an oversized body based on actual length even without a Content-Length header", async () => {
    const result = await guardLearningMutation(
      request({ courseSlug: "a".repeat(10_000) }),
      "enroll",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("allows more requests than the AI guard before rate-limiting (proportionate to a non-AI operation)", async () => {
    let lastResult: Awaited<ReturnType<typeof guardLearningMutation>> | undefined;
    for (let i = 0; i < 30; i++) {
      lastResult = await guardLearningMutation(request({ courseSlug: "x" }), "rate-limit-endpoint");
      expect(lastResult.ok).toBe(true);
    }
    // the 31st request in the same window should be rejected
    lastResult = await guardLearningMutation(request({ courseSlug: "x" }), "rate-limit-endpoint");
    expect(lastResult.ok).toBe(false);
    if (!lastResult.ok) {
      expect(lastResult.response.status).toBe(429);
      expect(lastResult.response.headers.get("Retry-After")).toBeTruthy();
    }
  });

  it("resets the rate limit after the window elapses", async () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 30; i++) {
        const result = await guardLearningMutation(request({ courseSlug: "x" }), "window-endpoint");
        expect(result.ok).toBe(true);
      }

      const blocked = await guardLearningMutation(request({ courseSlug: "x" }), "window-endpoint");
      expect(blocked.ok).toBe(false);

      vi.advanceTimersByTime(61_000);

      const afterWindow = await guardLearningMutation(request({ courseSlug: "x" }), "window-endpoint");
      expect(afterWindow.ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks rate limits independently per client key", async () => {
    for (let i = 0; i < 30; i++) {
      const result = await guardLearningMutation(
        request({ courseSlug: "x" }, { "x-forwarded-for": "1.1.1.1" }),
        "per-client-endpoint",
      );
      expect(result.ok).toBe(true);
    }

    const otherClient = await guardLearningMutation(
      request({ courseSlug: "x" }, { "x-forwarded-for": "2.2.2.2" }),
      "per-client-endpoint",
    );
    expect(otherClient.ok).toBe(true);
  });

  it("tracks rate limits independently per endpoint name", async () => {
    for (let i = 0; i < 30; i++) {
      const result = await guardLearningMutation(request({ courseSlug: "x" }), "enroll");
      expect(result.ok).toBe(true);
    }

    const otherEndpoint = await guardLearningMutation(request({ courseSlug: "x" }), "progress");
    expect(otherEndpoint.ok).toBe(true);
  });
});
