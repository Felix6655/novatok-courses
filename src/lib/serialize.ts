import { Prisma } from "@/generated/prisma/client";

export type Serialized<T> = T extends Prisma.Decimal
  ? string
  : T extends Date
    ? string
    : T extends (infer U)[]
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

/**
 * Recursively converts Prisma Decimal instances (and Date instances) into
 * plain JSON-safe values so API route handlers can pass results straight to
 * NextResponse.json without "Do not know how to serialize a Decimal" errors.
 */
export function toJSONSafe<T>(value: T): Serialized<T> {
  if (value instanceof Prisma.Decimal) {
    return value.toFixed(2) as unknown as Serialized<T>;
  }
  if (value instanceof Date) {
    return value.toISOString() as unknown as Serialized<T>;
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJSONSafe(item)) as unknown as Serialized<T>;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toJSONSafe(val);
    }
    return result as Serialized<T>;
  }
  return value as Serialized<T>;
}
