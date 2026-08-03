import { describe, expect, it, vi } from "vitest";
import { AIProviderConfigError, AIProviderUnavailableError } from "@/ai/errors";
import {
  RoutedAIProvider,
  createProviderForSpec,
  detectLanguageAdherence,
  parseModelRoutingConfig,
  selectModelRoute,
} from "@/ai/model-routing";
import { OllamaProvider } from "@/ai/providers/ollama";
import type { AIProvider } from "@/ai/provider";

function fakeProvider(
  name: string,
  model: string,
  result: string | Error,
): AIProvider {
  return {
    name,
    model,
    lastRequestMetadata: { provider: name, model, latencyMs: 12 },
    generateCompletion: vi.fn(async () => {
      if (result instanceof Error) throw result;
      return result;
    }),
  };
}

describe("model routing", () => {
  it("selects the most specific task and locale route", () => {
    const config = parseModelRoutingConfig({
      AI_MODEL_ROUTES_JSON: JSON.stringify({
        default: "ollama:default",
        routes: {
          advisor: "ollama:advisor",
          es: "ollama:spanish",
          "advisor.es": "omniroute:advisor-es",
        },
        fallbacks: ["ollama:fallback"],
      }),
    });
    expect(selectModelRoute(config, "advisor", "es", "ollama:legacy")).toEqual({
      primary: "omniroute:advisor-es",
      fallbacks: ["ollama:fallback"],
    });
    expect(
      selectModelRoute(config, "tutor", "es", "ollama:legacy").primary,
    ).toBe("ollama:spanish");
    expect(
      selectModelRoute(config, "coach", "de", "ollama:legacy").primary,
    ).toBe("ollama:default");
  });

  it("rejects invalid config without echoing its content", () => {
    expect(() =>
      parseModelRoutingConfig({ AI_MODEL_ROUTES_JSON: '{"default":"secret"}' }),
    ).toThrow(AIProviderConfigError);
    try {
      parseModelRoutingConfig({ AI_MODEL_ROUTES_JSON: '{"default":"secret"}' });
    } catch (error) {
      expect(String(error)).not.toContain("secret");
    }
  });

  it("falls back once when the preferred provider is unavailable", async () => {
    const preferred = fakeProvider(
      "ollama",
      "preferred",
      new AIProviderUnavailableError("ollama", "offline"),
    );
    const fallback = fakeProvider(
      "omniroute",
      "fallback",
      '{"answer":"La respuesta es correcta para ti."}',
    );
    const router = new RoutedAIProvider([preferred, fallback], {
      task: "tutor",
      locale: "es",
    });
    await expect(
      router.generateCompletion({ messages: [] }),
    ).resolves.toContain("respuesta");
    expect(preferred.generateCompletion).toHaveBeenCalledTimes(1);
    expect(fallback.generateCompletion).toHaveBeenCalledTimes(1);
    expect(router.lastRequestMetadata).toMatchObject({
      provider: "omniroute",
      model: "fallback",
      attempts: 2,
      task: "tutor",
      locale: "es",
    });
  });

  it("rejects a clear English response for Spanish and uses only one fallback", async () => {
    const preferred = fakeProvider(
      "ollama",
      "preferred",
      '{"answer":"The lesson is the next thing and this is for you."}',
    );
    const fallback = fakeProvider(
      "ollama",
      "fallback",
      '{"answer":"La lección es útil y es para ti."}',
    );
    const third = fakeProvider("ollama", "third", "unused");
    const router = new RoutedAIProvider([preferred, fallback, third], {
      task: "coach",
      locale: "es",
    });
    await router.generateCompletion({ messages: [] });
    expect(fallback.generateCompletion).toHaveBeenCalledTimes(1);
    expect(third.generateCompletion).not.toHaveBeenCalled();
    expect(router.lastRequestMetadata?.languageAdherence).toBe("pass");
  });
});

describe("createProviderForSpec", () => {
  it("uses the default Ollama timeout when OLLAMA_TIMEOUT_MS is unset", () => {
    const provider = createProviderForSpec(
      "ollama:llama3:latest",
      { task: "tutor", locale: "en" },
      {},
    ) as OllamaProvider;
    expect((provider as unknown as { config: { timeoutMs?: number } }).config.timeoutMs).toBeUndefined();
  });

  it("honors OLLAMA_TIMEOUT_MS so slow-loading models get a longer request window", () => {
    const provider = createProviderForSpec(
      "ollama:qwen3.6:latest",
      { task: "tutor", locale: "es" },
      { OLLAMA_TIMEOUT_MS: "90000" },
    ) as OllamaProvider;
    expect((provider as unknown as { config: { timeoutMs?: number } }).config.timeoutMs).toBe(90000);
  });

  it("ignores an invalid OLLAMA_TIMEOUT_MS and falls back to the default", () => {
    const provider = createProviderForSpec(
      "ollama:llama3:latest",
      { task: "tutor", locale: "en" },
      { OLLAMA_TIMEOUT_MS: "not-a-number" },
    ) as OllamaProvider;
    expect((provider as unknown as { config: { timeoutMs?: number } }).config.timeoutMs).toBeUndefined();
  });
});

describe("language adherence signal", () => {
  it("flags obvious English and accepts obvious target-language prose", () => {
    expect(
      detectLanguageAdherence(
        "The answer is the best thing and this is for you.",
        "fr",
      ).status,
    ).toBe("fail");
    expect(
      detectLanguageAdherence(
        "Voici la réponse et elle est utile pour vous.",
        "fr",
      ).status,
    ).toBe("pass");
  });
  it("stays unknown when evidence is weak", () => {
    expect(
      detectLanguageAdherence('{"answer":"TypeScript"}', "de").status,
    ).toBe("unknown");
  });
});
