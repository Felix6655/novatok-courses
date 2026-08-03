export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}
export interface CompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}
export interface AIRequestMetadata {
  provider: string;
  model: string;
  task?: string;
  locale?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  attempts?: number;
  languageAdherence?: "pass" | "fail" | "unknown";
}
export interface AIProvider {
  readonly name: string;
  readonly model?: string;
  readonly lastRequestMetadata?: AIRequestMetadata;
  generateCompletion(request: CompletionRequest): Promise<string>;
}
