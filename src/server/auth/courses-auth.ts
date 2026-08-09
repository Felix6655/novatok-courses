import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { StudentIdentity } from "@/server/identity/types";

export const AUTH_TRANSACTION_LIFETIME_SECONDS = 5 * 60;
export const COURSES_SESSION_LIFETIME_SECONDS = 15 * 60;

const transactionSchema = z.object({
  kind: z.literal("auth-transaction"), state: z.string().min(32).max(256),
  verifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/), returnTo: z.string().startsWith("/"),
  iat: z.number().int(), exp: z.number().int(),
});
const sessionSchema = z.object({ kind: z.literal("courses-session"), sub: z.string().uuid(), iat: z.number().int(), exp: z.number().int() });
export type AuthTransaction = z.infer<typeof transactionSchema>;

function signature(payload: string, secret: string, purpose: string): string {
  return createHmac("sha256", secret).update(`${purpose}.${payload}`).digest("base64url");
}
function sign(payload: object, secret: string, purpose: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded, secret, purpose)}`;
}
function verify<T extends { iat: number; exp: number }>(token: string | undefined, secret: string, purpose: string, schema: z.ZodType<T>, now: number): T | null {
  if (!token) return null;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra) return null;
  const expected = signature(payload, secret, purpose);
  const suppliedBytes = Buffer.from(supplied); const expectedBytes = Buffer.from(expected);
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (!parsed.success || parsed.data.exp <= now || parsed.data.iat > now + 30) return null;
    return parsed.data;
  } catch { return null; }
}

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier, "ascii").digest("base64url") };
}
export function createState(): string { return randomBytes(32).toString("base64url"); }
export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function validateInternalReturnTo(value: string | null | undefined, fallback = "/learn"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const parsed = new URL(value, "https://courses.invalid");
    if (parsed.origin !== "https://courses.invalid") return fallback;
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return normalized.startsWith("/api/auth/") ? fallback : normalized;
  } catch { return fallback; }
}
export function validateLogoutReturnTo(value: string | null | undefined): string {
  const candidate = validateInternalReturnTo(value, "/courses");
  return candidate === "/learn" || candidate === "/courses" ? candidate : "/courses";
}
export function createAuthTransactionToken(input: { state: string; verifier: string; returnTo: string }, secret: string, now = Math.floor(Date.now() / 1000)): string {
  return sign({ kind: "auth-transaction", ...input, iat: now, exp: now + AUTH_TRANSACTION_LIFETIME_SECONDS }, secret, "auth-transaction");
}
export function verifyAuthTransactionToken(token: string | undefined, secret: string, now = Math.floor(Date.now() / 1000)): AuthTransaction | null {
  return verify(token, secret, "auth-transaction", transactionSchema, now);
}
export function createCoursesSessionToken(studentId: string, secret: string, now = Math.floor(Date.now() / 1000)): string {
  const sub = z.string().uuid().parse(studentId);
  return sign({ kind: "courses-session", sub, iat: now, exp: now + COURSES_SESSION_LIFETIME_SECONDS }, secret, "courses-session");
}
export function verifyCoursesSessionToken(token: string | undefined, secret: string, now = Math.floor(Date.now() / 1000)): StudentIdentity | null {
  const payload = verify(token, secret, "courses-session", sessionSchema, now);
  return payload ? { studentId: payload.sub } : null;
}
export function authCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}
