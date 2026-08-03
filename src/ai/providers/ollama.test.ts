import { describe, expect, it, vi } from "vitest";
import { AIProviderUnavailableError } from "@/ai/errors";
import { OllamaProvider } from "@/ai/providers/ollama";

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("OllamaProvider", () => {
  it("sends the model, messages, and stream:false to /api/chat and returns the content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: { content: "hello there" } }));
    const provider = new OllamaProvider({
      baseUrl: "http://localhost:11434",
      model: "llama3.2",
      fetchImpl,
    });

    const result = await provider.generateCompletion({
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result).toBe("hello there");
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:11434/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body).toMatchObject({
      model: "llama3.2",
      messages: [{ role: "user", content: "hi" }],
      stream: false,
    });
  });

  it("passes temperature through options when provided", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: { content: "ok" } }));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await provider.generateCompletion({ messages: [{ role: "user", content: "hi" }], temperature: 0.2 });

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.options).toEqual({ temperature: 0.2 });
  });

  it("passes maxTokens through as options.num_predict", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: { content: "ok" } }));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await provider.generateCompletion({
      messages: [{ role: "user", content: "hi" }],
      temperature: 0.2,
      maxTokens: 100,
    });

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.options).toEqual({ temperature: 0.2, num_predict: 100 });
  });

  it("always disables thinking mode so reasoning models return real content quickly", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: { content: "ok" } }));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "qwen3.6:latest", fetchImpl });

    await provider.generateCompletion({ messages: [{ role: "user", content: "hi" }] });

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.think).toBe(false);
  });

  it("records latency metadata after a successful completion", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: { content: "ok" } }));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await provider.generateCompletion({ messages: [{ role: "user", content: "hi" }] });

    expect(provider.lastRequestMetadata).toMatchObject({ provider: "ollama", model: "m" });
    expect(provider.lastRequestMetadata?.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("throws AIProviderUnavailableError when fetch rejects (connection refused)", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await expect(
      provider.generateCompletion({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AIProviderUnavailableError);
  });

  it("throws AIProviderUnavailableError on a non-2xx response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse("model not found", { ok: false, status: 404 }));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await expect(
      provider.generateCompletion({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AIProviderUnavailableError);
  });

  it("throws AIProviderUnavailableError when message.content is missing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: {} }));
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await expect(
      provider.generateCompletion({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AIProviderUnavailableError);
  });

  it("throws AIProviderUnavailableError when the response body isn't JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);
    const provider = new OllamaProvider({ baseUrl: "http://localhost:11434", model: "m", fetchImpl });

    await expect(
      provider.generateCompletion({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(AIProviderUnavailableError);
  });
});
