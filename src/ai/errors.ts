/**
 * Thrown when the configured AI provider cannot produce a completion —
 * connection refused, timeout, non-2xx response, or a malformed response
 * envelope. Callers treat this as "the provider is down right now", never
 * as a reason to silently retry against a different (e.g. paid cloud)
 * provider.
 */
export class AIProviderUnavailableError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`AI provider "${provider}" is unavailable: ${message}`);
    this.name = "AIProviderUnavailableError";
  }
}

/** Thrown when AI_PROVIDER / provider-specific env vars are missing or invalid. */
export class AIProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderConfigError";
  }
}

/**
 * Thrown when a provider did respond, but its content could not be parsed
 * into the structure the caller required (invalid JSON, or JSON that
 * fails schema validation) even after a repair attempt.
 */
export class InvalidModelOutputError extends Error {
  constructor(
    message: string,
    public readonly rawOutput?: string,
  ) {
    super(message);
    this.name = "InvalidModelOutputError";
  }
}
