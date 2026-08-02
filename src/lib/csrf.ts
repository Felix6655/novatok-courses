const PROTECTED_MUTATION_PATHS = [
  "/api/learning/",
  "/api/ai/tutor",
  "/api/ai/learning-coach",
];

export function requiresTrustedOrigin(pathname: string, method: string): boolean {
  if (method.toUpperCase() === "GET" || method.toUpperCase() === "HEAD" || method.toUpperCase() === "OPTIONS") return false;
  return PROTECTED_MUTATION_PATHS.some((path) => pathname === path || pathname.startsWith(path));
}

export function isTrustedOrigin(requestUrl: string, origin: string | null, configured = process.env.NOVATOK_ALLOWED_ORIGINS): boolean {
  if (!origin) return false;
  const allowed = new Set([new URL(requestUrl).origin, ...(configured ?? "").split(",").map((value) => value.trim()).filter(Boolean)]);
  return allowed.has(origin);
}