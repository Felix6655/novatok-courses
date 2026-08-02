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

/**
 * The production identity safety rail. NovaTok Courses does not yet have
 * a production identity adapter (see docs/student-identity.md) —
 * src/server/identity/dev-identity.ts's auto-assigned cookie is
 * explicitly a development/testing convenience, never a security
 * boundary. Without this check, deploying with NODE_ENV=production and
 * simply forgetting to wire up real identity would silently give every
 * visitor a forgeable fake account instead of failing loudly.
 *
 * Production requires explicitly opting into the dev identity via
 * STUDENT_IDENTITY_MODE=development; any other value (or NODE_ENV values
 * other than "production", e.g. local dev or the test runner) is
 * unaffected. Called from getStudentIdentity() itself, the one place
 * every learning route/page already goes through to resolve identity.
 */
export function assertIdentityModeIsSafe(): void {
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.STUDENT_IDENTITY_MODE !== "development") {
    throw new EnvValidationError(
      "Refusing to resolve a student identity in production without explicit configuration. " +
        "NovaTok Courses does not yet have a production identity adapter (see docs/student-identity.md). " +
        "Set STUDENT_IDENTITY_MODE=development to explicitly opt into the development-only cookie " +
        "identity for this deployment, or implement a production identity adapter first.",
    );
  }
}
