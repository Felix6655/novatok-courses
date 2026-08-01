import { describe, expect, it } from "vitest";
import { AIProviderConfigError } from "@/ai/errors";
import { getAIProvider } from "@/ai/get-ai-provider";
import { OllamaProvider } from "@/ai/providers/ollama";

describe("getAIProvider", () => {
  it("defaults to ollama with the default base URL when AI_PROVIDER is unset", () => {
    const provider = getAIProvider({ OLLAMA_MODEL: "llama3.2" });
    expect(provider).toBeInstanceOf(OllamaProvider);
    expect(provider.name).toBe("ollama");
  });

  it("uses OLLAMA_BASE_URL when provided", () => {
    const provider = getAIProvider({
      AI_PROVIDER: "ollama",
      OLLAMA_MODEL: "llama3.2",
      OLLAMA_BASE_URL: "http://ollama.internal:11434",
    });
    expect(provider).toBeInstanceOf(OllamaProvider);
  });

  it("throws AIProviderConfigError when OLLAMA_MODEL is missing", () => {
    expect(() => getAIProvider({ AI_PROVIDER: "ollama" })).toThrow(AIProviderConfigError);
  });

  it("throws AIProviderConfigError for an unsupported provider", () => {
    expect(() => getAIProvider({ AI_PROVIDER: "openai" })).toThrow(AIProviderConfigError);
  });
});
