import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetAIRequestGuardStateForTests, guardAIRequest } from "@/lib/ai-request-guard";

function request(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/ai/test-endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: text,
  });
}

beforeEach(() => {
  __resetAIRequestGuardStateForTests();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("guardAIRequest", () => {
  it("allows a small, well-formed request and returns its parsed body", async () => {
    const result = await guardAIRequest(request({ message: "hi" }), "test-endpoint");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toEqual({ message: "hi" });
      result.release();
    }
  });

  it("rejects malformed JSON with 400", async () => {
    const result = await guardAIRequest(request("not json"), "test-endpoint");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });

  it("rejects an oversized body based on Content-Length with 413", async () => {
    const result = await guardAIRequest(
      request({ message: "hi" }, { "Content-Length": "999999" }),
      "test-endpoint",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("rejects an oversized body based on actual length even without a Content-Length header", async () => {
    const result = await guardAIRequest(
      request({ message: "a".repeat(30_000) }),
      "test-endpoint",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("allows up to the per-client request limit, then rejects with 429", async () => {
    let lastResult: Awaited<ReturnType<typeof guardAIRequest>> | undefined;
    for (let i = 0; i < 11; i++) {
      lastResult = await guardAIRequest(request({ message: "hi" }), "rate-limit-endpoint");
      if (lastResult.ok) lastResult.release();
    }
    expect(lastResult?.ok).toBe(false);
    if (lastResult && !lastResult.ok) {
      expect(lastResult.response.status).toBe(429);
      expect(lastResult.response.headers.get("Retry-After")).toBeTruthy();
    }
  });

  it("resets the rate limit after the window elapses", async () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 10; i++) {
        const result = await guardAIRequest(request({ message: "hi" }), "window-endpoint");
        expect(result.ok).toBe(true);
        if (result.ok) result.release();
      }

      const blocked = await guardAIRequest(request({ message: "hi" }), "window-endpoint");
      expect(blocked.ok).toBe(false);

      vi.advanceTimersByTime(61_000);

      const afterWindow = await guardAIRequest(request({ message: "hi" }), "window-endpoint");
      expect(afterWindow.ok).toBe(true);
      if (afterWindow.ok) afterWindow.release();
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks rate limits independently per client key", async () => {
    for (let i = 0; i < 10; i++) {
      const result = await guardAIRequest(
        request({ message: "hi" }, { "x-forwarded-for": "1.1.1.1" }),
        "per-client-endpoint",
      );
      expect(result.ok).toBe(true);
      if (result.ok) result.release();
    }

    const otherClient = await guardAIRequest(
      request({ message: "hi" }, { "x-forwarded-for": "2.2.2.2" }),
      "per-client-endpoint",
    );
    expect(otherClient.ok).toBe(true);
  });

  it("caps concurrent in-flight requests and releases the slot on release()", async () => {
    const first = await guardAIRequest(request({ message: "hi" }), "concurrency-endpoint");
    const second = await guardAIRequest(request({ message: "hi" }), "concurrency-endpoint");
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    const third = await guardAIRequest(request({ message: "hi" }), "concurrency-endpoint");
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.response.status).toBe(429);

    if (first.ok) first.release();

    const fourth = await guardAIRequest(request({ message: "hi" }), "concurrency-endpoint");
    expect(fourth.ok).toBe(true);

    if (second.ok) second.release();
    if (fourth.ok) fourth.release();
  });

  it("tracks concurrency independently per endpoint", async () => {
    const a1 = await guardAIRequest(request({ message: "hi" }), "endpoint-a");
    const a2 = await guardAIRequest(request({ message: "hi" }), "endpoint-a");
    expect(a1.ok && a2.ok).toBe(true);

    const b1 = await guardAIRequest(request({ message: "hi" }), "endpoint-b");
    expect(b1.ok).toBe(true);

    if (a1.ok) a1.release();
    if (a2.ok) a2.release();
    if (b1.ok) b1.release();
  });
});
