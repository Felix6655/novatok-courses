import { z } from "zod";
import type { Locale } from "@/i18n/config";
import type {
  AIProvider,
  AIRequestMetadata,
  CompletionRequest,
} from "@/ai/provider";
import { AIProviderConfigError, AIProviderUnavailableError } from "@/ai/errors";
import { OllamaProvider } from "@/ai/providers/ollama";
import { OpenAICompatibleProvider } from "@/ai/providers/openai-compatible";
export const AI_TASKS = ["advisor", "tutor", "coach", "practice", "creator-coach"] as const;
export type AITask = (typeof AI_TASKS)[number];
const specSchema = z
  .string()
  .trim()
  .regex(/^(ollama|omniroute):.+$/, "Model route must be provider:model");
const configSchema = z.object({
  default: specSchema.optional(),
  fallbacks: z.array(specSchema).max(3).default([]),
  routes: z.record(z.string(), specSchema).default({}),
});
export interface ModelRoutingConfig {
  default?: string;
  fallbacks: string[];
  routes: Record<string, string>;
}
export function parseModelRoutingConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): ModelRoutingConfig {
  if (!env.AI_MODEL_ROUTES_JSON?.trim()) return { fallbacks: [], routes: {} };
  try {
    return configSchema.parse(JSON.parse(env.AI_MODEL_ROUTES_JSON));
  } catch {
    throw new AIProviderConfigError(
      "AI_MODEL_ROUTES_JSON is invalid; expected provider:model routes with no credentials",
    );
  }
}
export function selectModelRoute(
  config: ModelRoutingConfig,
  task: AITask,
  locale: Locale,
  legacy: string,
): { primary: string; fallbacks: string[] } {
  const primary =
    config.routes[`${task}.${locale}`] ??
    config.routes[locale] ??
    config.routes[task] ??
    config.default ??
    legacy;
  return {
    primary,
    fallbacks: config.fallbacks.filter((item) => item !== primary).slice(0, 1),
  };
}
export interface LanguageSignal {
  status: "pass" | "fail" | "unknown";
  englishHits: number;
  targetHits: number;
}
const WORDS: Record<Locale, string[]> = {
  en: ["the", "and", "you", "is", "to", "this"],
  es: ["el", "la", "que", "y", "para", "una", "es"],
  pt: ["que", "e", "para", "uma", "você", "é"],
  fr: ["le", "la", "et", "pour", "une", "est", "vous"],
  de: ["der", "die", "und", "für", "ist", "sie", "das"],
};
export function detectLanguageAdherence(
  text: string,
  locale: Locale,
): LanguageSignal {
  if (locale === "en") return { status: "pass", englishHits: 0, targetHits: 0 };
  let prose = text;
  try {
    const parsed = JSON.parse(text);
    const values: string[] = [];
    const walk = (value: unknown) => {
      if (typeof value === "string") values.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object")
        Object.values(value).forEach(walk);
    };
    walk(parsed);
    prose = values.join(" ");
  } catch {}
  const normalized = ` ${prose.toLocaleLowerCase()} `;
  const hits = (words: string[]) =>
    words.reduce(
      (count, word) =>
        count +
        (normalized.match(new RegExp(`\\b${word}\\b`, "gu"))?.length ?? 0),
      0,
    );
  const englishHits = hits(WORDS.en),
    targetHits = hits(WORDS[locale]);
  if (targetHits >= 2) return { status: "pass", englishHits, targetHits };
  if (englishHits >= 4 && targetHits === 0)
    return { status: "fail", englishHits, targetHits };
  return { status: "unknown", englishHits, targetHits };
}
function splitSpec(spec: string) {
  const index = spec.indexOf(":");
  return { provider: spec.slice(0, index), model: spec.slice(index + 1) };
}
export function createProviderForSpec(
  spec: string,
  context: { task: AITask; locale: Locale },
  env: Partial<NodeJS.ProcessEnv> = process.env,
): AIProvider {
  const { provider, model } = splitSpec(spec);
  if (provider === "ollama") {
    const timeoutMs = Number(env.OLLAMA_TIMEOUT_MS);
    return new OllamaProvider({
      baseUrl: env.OLLAMA_BASE_URL?.trim() || "http://localhost:11434",
      model,
      ...(Number.isFinite(timeoutMs) && timeoutMs > 0 ? { timeoutMs } : {}),
    });
  }
  if (provider === "omniroute")
    return new OpenAICompatibleProvider({
      baseUrl: env.OMNIROUTE_BASE_URL?.trim() || "http://localhost:20128/v1",
      apiKey: env.OMNIROUTE_API_KEY?.trim(),
      model,
      providerName: "omniroute",
      task: context.task,
      locale: context.locale,
    });
  throw new AIProviderConfigError(`Unsupported routed provider "${provider}"`);
}
export class RoutedAIProvider implements AIProvider {
  readonly name = "model-router";
  readonly model: string;
  lastRequestMetadata?: AIRequestMetadata;
  constructor(
    private readonly providers: AIProvider[],
    private readonly context: { task: AITask; locale: Locale },
  ) {
    if (!providers.length)
      throw new AIProviderConfigError(
        "Model router requires at least one provider",
      );
    this.model = providers
      .map((p) => `${p.name}:${p.model ?? "unknown"}`)
      .join(" -> ");
  }
  async generateCompletion(request: CompletionRequest) {
    let lastError: unknown;
    for (let index = 0; index < this.providers.length; index++) {
      const provider = this.providers[index];
      try {
        const content = await provider.generateCompletion(request);
        const signal = detectLanguageAdherence(content, this.context.locale);
        this.lastRequestMetadata = {
          ...(provider.lastRequestMetadata ?? {
            provider: provider.name,
            model: provider.model ?? "unknown",
          }),
          task: this.context.task,
          locale: this.context.locale,
          attempts: index + 1,
          languageAdherence: signal.status,
        };
        if (signal.status === "fail" && index < this.providers.length - 1) {
          lastError = new AIProviderUnavailableError(
            provider.name,
            `model ${provider.model ?? "unknown"} failed conservative ${this.context.locale} language adherence`,
          );
          continue;
        }
        return content;
      } catch (error) {
        lastError = error;
        if (index === this.providers.length - 1) throw error;
      }
    }
    throw lastError;
  }
}
export function getRoutedAIProvider(
  context: { task: AITask; locale: Locale },
  env: Partial<NodeJS.ProcessEnv> = process.env,
) {
  const legacyProvider = env.AI_PROVIDER?.trim() || "ollama";
  const legacyModel = env.OLLAMA_MODEL?.trim();
  if (!legacyModel)
    throw new AIProviderConfigError(
      "OLLAMA_MODEL is required as the model-routing fallback",
    );
  const config = parseModelRoutingConfig(env);
  const selection = selectModelRoute(
    config,
    context.task,
    context.locale,
    `${legacyProvider}:${legacyModel}`,
  );
  return new RoutedAIProvider(
    [selection.primary, ...selection.fallbacks].map((spec) =>
      createProviderForSpec(spec, context, env),
    ),
    context,
  );
}
