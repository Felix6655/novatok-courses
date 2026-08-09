# Student identity

## Production contract

NovaTok Social is the identity authority, while Courses is a confidential first-party client with its own short-lived session:

```text
Courses login start -> signed host-only transaction cookie -> Social authorize
-> one-time code callback -> server-to-server exchange -> verified Social UUID
-> 15-minute host-only Courses session -> StudentIdentity -> unchanged learning services
```

Production requires `STUDENT_IDENTITY_MODE=novatok-social` plus the Social/Courses origins, confidential client credentials, and a Courses session secret. Every other mode is rejected, so production never falls back to development identity. Courses never forwards browser cookies to Social and never accepts a client-provided student ID. Only the verified UUID returned by Social's one-time code exchange becomes the local session subject.

## Isolated development mode

Outside production, omitted `STUDENT_IDENTITY_MODE` or `development` uses the forgeable `novatok_dev_student_id` test cookie. `src/proxy.ts` provisions it as HttpOnly, SameSite=Lax, Path=/. It is impossible to activate when `NODE_ENV=production`.

## Cookies, CSRF, and deployment

The transaction and Courses session cookies are HttpOnly, host-only, SameSite=Lax, Secure in production, and Path=/. The transaction lasts five minutes and the Courses session lasts fifteen minutes. Logout clears only the Courses session. State-changing requests still require a trusted `Origin`; `NOVATOK_ALLOWED_ORIGINS` adds legitimate origins.

Social and Courses may run on separate localhost origins during integration. Production sessions must not use a shared parent-domain cookie. The confidential client secret and Courses signing secret are server-only and never use a `NEXT_PUBLIC_` prefix.
