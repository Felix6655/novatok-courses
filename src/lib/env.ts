import { z } from "zod";

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .url({
      message:
        "DATABASE_URL must be a valid PostgreSQL connection string, e.g. " +
        "postgresql://user:pass@host:5432/db?schema=public",
    })
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL must use the postgresql:// or postgres:// protocol",
    ),
});

/**
 * Validates DATABASE_URL is present and well-formed, with a clear error
 * instead of letting a missing/malformed value surface as an opaque
 * failure deep inside the Postgres driver. Called once from
 * src/lib/prisma.ts at client-creation time — never during tests, since
 * @/lib/prisma is always mocked there.
 */
export function getDatabaseUrl(): string {
  const parsed = databaseEnvSchema.safeParse({ DATABASE_URL: process.env.DATABASE_URL });
  if (!parsed.success) {
    throw new EnvValidationError(
      `Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`,
    );
  }
  return parsed.data.DATABASE_URL;
}

/** Production requires the authoritative NovaTok Social session adapter.
 * Development/test default to the isolated dev cookie unless social mode
 * is explicitly selected. There is never a production fallback. */
export function assertIdentityModeIsSafe(): void {
  const mode = process.env.STUDENT_IDENTITY_MODE;
  if (process.env.NODE_ENV === "production" && mode !== "novatok-social") {
    throw new EnvValidationError(
      "Production identity requires STUDENT_IDENTITY_MODE=novatok-social; development identity is forbidden.",
    );
  }
  if (mode && mode !== "development" && mode !== "novatok-social") {
    throw new EnvValidationError("STUDENT_IDENTITY_MODE must be development or novatok-social.");
  }
}
