# Production hardening

Sprint 7 moved practice sessions to PostgreSQL, added atomic ownership/expiry/replay protection, introduced the rate-limit adapter boundary, and added environment safety rails. Sprint 8 resolves the production identity blocker through NovaTok Social's authoritative server session contract.

## Identity and authorization

Production requires `STUDENT_IDENTITY_MODE=novatok-social` and `NOVATOK_SOCIAL_ORIGIN`. `getStudentIdentity()` forwards the incoming Cookie header to Social's `GET /api/auth/session`; Social validates the access token server-side and returns a stable opaque `userId`. Courses maps that to `StudentIdentity.studentId`. No learning service changed and no client-supplied student ID is trusted.

Development identity remains available only outside production. `src/proxy.ts` provisions its test cookie; production rejects development mode. The proxy migration replaces the deprecated Next.js middleware convention without changing route matching.

## Session and CSRF contract

Social owns login, session validation, expiry, and logout. Its cookies are HttpOnly, Secure in production, SameSite=Lax, Path=/, and optionally scoped to `.novatoksocial.com`. Courses does not import an auth SDK or store credentials.

Social and Courses enforce the same CSRF rule for cookie-authenticated mutations: SameSite=Lax plus a required Origin matching the service origin or `NOVATOK_ALLOWED_ORIGINS`. Courses applies it to learning, Tutor, and Learning Coach mutations in `src/proxy.ts`.

## Practice persistence

`PracticeSession` stores the bounded server-only answer key in PostgreSQL. Evaluation uses one conditional update matching id, owner, unconsumed state, and unexpired state before setting `consumedAt`, so cross-user attempts and concurrent replays cannot consume twice. Expired rows are cleaned opportunistically and smoke scripts clean their own rows.

## Rate limits and deployment

Both request guards depend on `RateLimitAdapter` and currently use in-memory implementations. Add a shared adapter before horizontal scaling; Redis remains intentionally absent. PostgreSQL is the only Courses database and Ollama is the only configured AI provider.

Required production variables are `DATABASE_URL`, Ollama provider settings, `STUDENT_IDENTITY_MODE=novatok-social`, and `NOVATOK_SOCIAL_ORIGIN`. Apply Prisma migrations only to the isolated Courses database.

## Remaining deployment prerequisites

- Configure real Social Supabase credentials and an authenticated test user.
- Choose same-origin mounting or set the shared cookie Domain and trusted origins for sibling services.
- Add a shared rate-limit adapter before running multiple Courses instances.