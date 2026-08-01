export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  /** Lower is more deterministic. Providers that ignore this may no-op it. */
  temperature?: number;
}

/**
 * Provider-agnostic chat completion contract. Business logic (intent
 * extraction, recommendation reasoning) depends only on this interface,
 * never on a concrete provider SDK, so swapping Ollama for another
 * provider later is an adapter change, not a rewrite of the agent logic.
 */
export interface AIProvider {
  readonly name: string;
  generateCompletion(request: CompletionRequest): Promise<string>;
}
