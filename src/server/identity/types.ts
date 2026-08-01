/**
 * A trusted student identity, as established by the identity boundary
 * (src/server/identity/dev-identity.ts today, a real NovaTok Social
 * session later). Learning services (enrollment, progress, resume,
 * Learning Coach) accept this as an explicit parameter and never derive
 * it from a request body — see docs/student-identity.md.
 */
export interface StudentIdentity {
  studentId: string;
}
