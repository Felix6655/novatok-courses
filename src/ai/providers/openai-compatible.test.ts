import { describe, expect, it, vi } from "vitest";
import { AIProviderUnavailableError } from "@/ai/errors";
import { OpenAICompatibleProvider } from "@/ai/providers/openai-compatible";

function response(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

describe("OpenAICompatibleProvider", () => {
  it("calls chat completions and records safe usage metadata", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response({
        choices: [{ message: { content: '{"answer":"hola"}' } }],
        usage: { prompt_tokens: 10, completion_tokens: 4, cost: 0 },
      }),
    );
    const provider = new OpenAICompatibleProvider({
      baseUrl: "http://localhost:20128/v1/",
      apiKey: "do-not-log",
      model: "auto/best-free",
      providerName: "omniroute",
      task: "advisor",
      locale: "es",
      fetchImpl,
    });
    await expect(
      provider.generateCompletion({
        messages: [{ role: "user", content: "hola" }],
      }),
    ).resolves.toContain("hola");
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:20128/v1/chat/completions",
      expect.objectContaining({ method: "POST" }),
    );
    expect(provider.lastRequestMetadata).toMatchObject({
      provider: "omniroute",
      model: "auto/best-free",
      task: "advisor",
      locale: "es",
      inputTokens: 10,
      outputTokens: 4,
      estimatedCost: 0,
    });
  });

  it("does not expose credentials or response bodies in errors", async () => {
    const provider = new OpenAICompatibleProvider({
      baseUrl: "http://localhost:20128/v1",
      apiKey: "super-secret-token",
      model: "free-model",
      fetchImpl: vi
        .fn()
        .mockResolvedValue(response({ secret: "upstream-body" }, false, 401)),
    });
    const promise = provider.generateCompletion({ messages: [] });
    await expect(promise).rejects.toBeInstanceOf(AIProviderUnavailableError);
    await expect(promise).rejects.not.toThrow(
      /super-secret-token|upstream-body/,
    );
  });
});
