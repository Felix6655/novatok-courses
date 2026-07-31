import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("env schema", () => {
  it("accepts a valid postgres connection string", () => {
    const schema = z.object({ DATABASE_URL: z.url() });
    const result = schema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing DATABASE_URL", () => {
    const schema = z.object({ DATABASE_URL: z.url() });
    const result = schema.safeParse({ DATABASE_URL: "" });
    expect(result.success).toBe(false);
  });
});
