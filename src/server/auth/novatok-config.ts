import { EnvValidationError } from "@/lib/env";

const MIN_SECRET_LENGTH = 32;

export interface NovaTokAuthConfig {
  socialOrigin: string;
  clientId: string;
  clientSecret: string;
  coursesOrigin: string;
  sessionSecret: string;
  callbackUrl: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new EnvValidationError(`${name} is required in novatok-social identity mode.`);
  return value;
}

function exactOrigin(name: string): string {
  const value = required(name);
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new EnvValidationError(`${name} must be a valid absolute origin.`); }
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash || value.replace(/\/$/, "") !== parsed.origin) {
    throw new EnvValidationError(`${name} must contain only an exact origin.`);
  }
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "[::1]";
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && local && parsed.protocol === "http:")) {
    throw new EnvValidationError(`${name} must use HTTPS (HTTP is allowed only for localhost outside production).`);
  }
  return parsed.origin;
}

function secret(name: string): string {
  const value = required(name);
  if (value.length < MIN_SECRET_LENGTH) throw new EnvValidationError(`${name} must be at least ${MIN_SECRET_LENGTH} characters.`);
  return value;
}

export function getNovaTokAuthConfig(): NovaTokAuthConfig {
  const socialOrigin = exactOrigin("NOVATOK_SOCIAL_ORIGIN");
  const coursesOrigin = exactOrigin("NOVATOK_COURSES_ORIGIN");
  const clientId = required("NOVATOK_SOCIAL_CLIENT_ID");
  if (!/^[A-Za-z0-9._~-]{1,128}$/.test(clientId)) throw new EnvValidationError("NOVATOK_SOCIAL_CLIENT_ID is invalid.");
  return {
    socialOrigin,
    clientId,
    clientSecret: secret("NOVATOK_SOCIAL_CLIENT_SECRET"),
    coursesOrigin,
    sessionSecret: secret("NOVATOK_COURSES_SESSION_SECRET"),
    callbackUrl: new URL("/api/auth/novatok/callback", coursesOrigin).toString(),
  };
}
