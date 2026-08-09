# Production hardening

Sprint 7 moved practice sessions to PostgreSQL, added atomic ownership/expiry/replay protection, introduced the rate-limit adapter boundary, and added environment safety rails. The Social handoff resolves the production identity blocker while keeping NovaTok Social authoritative.

## Identity and authorization

Production requires `STUDENT_IDENTITY_MODE=novatok-social`, exact Social/Courses origins, confidential client credentials, and a Courses session secret. Courses redirects through Social's authorize endpoint, exchanges the one-time code server-to-server, and puts only Social's verified UUID into its own signed 15-minute host-only session. `getStudentIdentity()` validates that local session. No Social cookie or client-supplied student ID is trusted.

Development identity remains available only outside production. `src/proxy.ts` provisions its test cookie; production rejects development mode. The proxy migration replaces the deprecated Next.js middleware convention without changing route matching.

## Session and CSRF contract

Social owns login and identity authority. Courses owns its separate transaction and session cookies; both are HttpOnly, host-only, Secure in production, SameSite=Lax, and Path=/. Courses logout clears only the Courses session and does not alter Social's session.

Social and Courses enforce the same CSRF rule for cookie-authenticated mutations: SameSite=Lax plus a required Origin matching the service origin or `NOVATOK_ALLOWED_ORIGINS`. Courses applies it to learning, Tutor, and Learning Coach mutations in `src/proxy.ts`.

## Practice persistence

`PracticeSession` stores the bounded server-only answer key in PostgreSQL. Evaluation uses one conditional update matching id, owner, unconsumed state, and unexpired state before setting `consumedAt`, so cross-user attempts and concurrent replays cannot consume twice. Expired rows are cleaned opportunistically and smoke scripts clean their own rows.

## Rate limits and deployment

Both request guards depend on `RateLimitAdapter` and currently use in-memory implementations. Add a shared adapter before horizontal scaling; Redis remains intentionally absent. PostgreSQL is the only Courses database and Ollama is the only configured AI provider.

Required production variables are `DATABASE_URL`, Ollama provider settings, `STUDENT_IDENTITY_MODE=novatok-social`, `NOVATOK_SOCIAL_ORIGIN`, `NOVATOK_SOCIAL_CLIENT_ID`, `NOVATOK_SOCIAL_CLIENT_SECRET`, `NOVATOK_COURSES_ORIGIN`, and `NOVATOK_COURSES_SESSION_SECRET`. Apply Prisma migrations only to the isolated Courses database.

## Remaining deployment prerequisites

- Configure matching Social confidential-client settings and perform a two-origin integration test.
- Use host-only cookies for both services; never configure a shared parent-domain bearer cookie.
- Add a shared rate-limit adapter before running multiple Courses instances.
