import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(error: ZodError) {
  return NextResponse.json(
    {
      error: "Invalid query parameters",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}
