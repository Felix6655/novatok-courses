/**
 * Attempts strict JSON.parse first, then falls back to slicing out the
 * first {...} block. Local models frequently wrap JSON in a sentence or a
 * markdown fence even when explicitly told not to; this is a pragmatic
 * repair attempt, not a substitute for schema validation of the result.
 */
export function parseJsonLoosely(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // fall through to repair attempt below
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return undefined;
  }

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return undefined;
  }
}
