# Student identity

## Production contract

Sprint 8 integrates the authoritative NovaTok Social server session behind the existing `StudentIdentity` boundary:

```text
Social login -> HttpOnly session cookie -> Courses getStudentIdentity()
-> Social GET /api/auth/session -> verified userId -> StudentIdentity
-> unchanged learning services
```

Production requires `STUDENT_IDENTITY_MODE=novatok-social` and `NOVATOK_SOCIAL_ORIGIN`. Every other mode is rejected, so production never falls back to development identity. Courses forwards the incoming Cookie header server-to-server and consumes only Social's verified opaque `userId`; it does not import Supabase or accept client-provided student IDs.

## Isolated development mode

Outside production, omitted `STUDENT_IDENTITY_MODE` or `development` uses the forgeable `novatok_dev_student_id` test cookie. `src/proxy.ts` provisions it as HttpOnly, SameSite=Lax, Path=/. It is impossible to activate when `NODE_ENV=production`.

## CSRF and deployment

Social and Courses share one cookie-auth CSRF convention: SameSite=Lax plus a required trusted `Origin` on state-changing requests. Courses proxy enforcement covers `/api/learning/*`, Tutor, and Learning Coach; `NOVATOK_ALLOWED_ORIGINS` adds legitimate origins.

For a same-origin mount, Social's Path=/ cookies naturally cover Courses. For sibling subdomains, Social sets `NOVATOK_SESSION_COOKIE_DOMAIN=.novatoksocial.com`; Courses receives the cookie and forwards it to the configured HTTPS/internal Social origin. Validation works from Server Components and Route Handlers and never depends on localStorage.