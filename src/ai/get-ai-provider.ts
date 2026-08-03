import { AIProviderConfigError } from "@/ai/errors";
import type { AIProvider } from "@/ai/provider";
import { getRoutedAIProvider, type AITask } from "@/ai/model-routing";
import { OllamaProvider } from "@/ai/providers/ollama";
import type { Locale } from "@/i18n/config";

const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";

/**
 * Reads AI_PROVIDER (and provider-specific env vars) and returns the
 * configured provider behind the AIProvider interface. This is the only
 * place in the codebase that knows which concrete provider is active —
 * everything else depends on AIProvider.
 */
export function getAIProvider(
  env: Partial<NodeJS.ProcessEnv> = process.env,
  context?: { task: AITask; locale: Locale },
): AIProvider {
  if (context) {
    return getRoutedAIProvider(context, env);
  }
  const providerName = env.AI_PROVIDER?.trim() || "ollama";

  switch (providerName) {
    case "ollama": {
      const model = env.OLLAMA_MODEL?.trim();
      if (!model) {
        throw new AIProviderConfigError(
          "OLLAMA_MODEL is required when AI_PROVIDER=ollama (e.g. OLLAMA_MODEL=llama3.2)",
        );
      }
      return new OllamaProvider({
        baseUrl: env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE_URL,
        model,
      });
    }
    default:
      throw new AIProviderConfigError(
        `Unsupported AI_PROVIDER "${providerName}". Supported providers: ollama`,
      );
  }
}
