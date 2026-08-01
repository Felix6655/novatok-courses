import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(error: ZodError, message = "Invalid query parameters") {
  return NextResponse.json(
    {
      error: message,
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

/** The configured AI provider could not be reached or isn't configured. */
export function serviceUnavailable(message: string) {
  return NextResponse.json({ error: message }, { status: 503 });
}

/** The AI provider responded, but its content couldn't be used. */
export function badGateway(message: string) {
  return NextResponse.json({ error: message }, { status: 502 });
}

export function internalError() {
  return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
}
