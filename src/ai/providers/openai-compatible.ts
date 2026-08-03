import { AIProviderUnavailableError } from "@/ai/errors";
import type {
  AIProvider,
  AIRequestMetadata,
  CompletionRequest,
} from "@/ai/provider";
export interface OpenAICompatibleConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
  providerName?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  task?: string;
  locale?: string;
}
interface ResponseBody {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
}
export class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  readonly model: string;
  lastRequestMetadata?: AIRequestMetadata;
  constructor(private readonly config: OpenAICompatibleConfig) {
    this.name = config.providerName ?? "openai-compatible";
    this.model = config.model;
  }
  async generateCompletion(request: CompletionRequest) {
    const started = Date.now();
    let response: Response;
    try {
      response = await (this.config.fetchImpl ?? fetch)(
        `${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(this.config.apiKey
              ? { authorization: `Bearer ${this.config.apiKey}` }
              : {}),
          },
          body: JSON.stringify({
            model: this.model,
            messages: request.messages,
            temperature: request.temperature ?? 0.2,
            ...(request.maxTokens !== undefined
              ? { max_tokens: request.maxTokens }
              : {}),
            stream: false,
          }),
          signal: AbortSignal.timeout(this.config.timeoutMs ?? 60_000),
        },
      );
    } catch (error) {
      throw new AIProviderUnavailableError(
        this.name,
        `could not reach configured endpoint for model ${this.model}`,
        error,
      );
    }
    if (!response.ok)
      throw new AIProviderUnavailableError(
        this.name,
        `model ${this.model} returned HTTP ${response.status}`,
      );
    let data: ResponseBody;
    try {
      data = (await response.json()) as ResponseBody;
    } catch (error) {
      throw new AIProviderUnavailableError(
        this.name,
        `model ${this.model} returned invalid JSON`,
        error,
      );
    }
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string")
      throw new AIProviderUnavailableError(
        this.name,
        `model ${this.model} response omitted choices[0].message.content`,
      );
    this.lastRequestMetadata = {
      provider: this.name,
      model: this.model,
      task: this.config.task,
      locale: this.config.locale,
      latencyMs: Date.now() - started,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
      estimatedCost: data.usage?.cost,
    };
    return content;
  }
}
