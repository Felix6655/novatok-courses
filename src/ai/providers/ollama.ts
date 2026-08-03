import { AIProviderUnavailableError } from "@/ai/errors";
import type {
  AIProvider,
  AIRequestMetadata,
  CompletionRequest,
} from "@/ai/provider";

export interface OllamaProviderConfig {
  baseUrl: string;
  model: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  /** Request timeout in ms so an unresponsive host fails clearly instead of hanging. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

interface OllamaChatResponse {
  message?: { content?: string };
}

/**
 * Talks to a local (or self-hosted) Ollama instance via its native
 * `/api/chat` HTTP endpoint — no SDK dependency. See
 * https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion
 */
export class OllamaProvider implements AIProvider {
  readonly name = "ollama";
  readonly model: string;
  lastRequestMetadata?: AIRequestMetadata;

  constructor(private readonly config: OllamaProviderConfig) {
    this.model = config.model;
  }

  async generateCompletion({
    messages,
    temperature,
    maxTokens,
  }: CompletionRequest): Promise<string> {
    const started = Date.now();
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const timeoutMs = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const options = {
      ...(temperature !== undefined ? { temperature } : {}),
      ...(maxTokens !== undefined ? { num_predict: maxTokens } : {}),
    };

    let response: Response;
    try {
      response = await fetchImpl(`${this.config.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false,
          // Reasoning models (e.g. qwen3.6) otherwise spend the whole
          // response on hidden "thinking" content and return empty/very
          // slow answers for the short structured completions this app
          // needs; non-reasoning models ignore this field.
          think: false,
          ...(Object.keys(options).length > 0 ? { options } : {}),
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new AIProviderUnavailableError(
        this.name,
        `could not reach Ollama at ${this.config.baseUrl} (is it running?)`,
        error,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new AIProviderUnavailableError(
        this.name,
        `Ollama returned HTTP ${response.status}${body ? `: ${body}` : ""}`,
      );
    }

    let data: OllamaChatResponse;
    try {
      data = (await response.json()) as OllamaChatResponse;
    } catch (error) {
      throw new AIProviderUnavailableError(
        this.name,
        "Ollama returned a non-JSON response",
        error,
      );
    }

    const content = data.message?.content;
    if (typeof content !== "string") {
      throw new AIProviderUnavailableError(
        this.name,
        "Ollama response was missing message.content",
      );
    }

    this.lastRequestMetadata = {
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
    };
    return content;
  }
}
