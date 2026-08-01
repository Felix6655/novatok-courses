/**
 * Isolated from dev-identity.ts so src/middleware.ts (which runs in the
 * Edge runtime) can import just this constant without pulling in
 * next/headers or any Node-specific module transitively.
 */
export const DEV_STUDENT_COOKIE = "novatok_dev_student_id";
