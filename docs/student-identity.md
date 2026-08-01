# Student Identity

## This is NOT production authentication

Sprint 5 needs a real, stable, per-browser identifier to build and test
enrollment/progress/Learning Coach against — but NovaTok Courses will
eventually live inside novatoksocial.com and share its real session
system. Building a second permanent auth system now would just be thrown
away later, so Sprint 5 uses the smallest thing that can stand in for it:

**Any browser that accepts cookies is automatically assigned a random
`studentId`, with zero credential of any kind checked or verified.**
There is no login, no password, no way to prove you are a specific
person — the cookie is trusted purely because we set it ourselves,
server-side, on that visitor's first request. This is explicitly a
development/testing convenience, not a security boundary.

## How it works

```text
Request (any page or API route)
        |
        v
src/middleware.ts
        |
   cookie present? ----no----> set novatok_dev_student_id = "dev-<uuid>"
        |
       yes
        |
        v
src/server/identity/dev-identity.ts
   getStudentIdentity() reads the cookie
        |
        v
{ studentId: string }
        |
        v
Learning services (enrollment, progress, resume, Learning Coach) —
always receive studentId as an explicit parameter, never read it
themselves from a cookie/header/body.
```

Middleware exists for one reason: **Server Components cannot set cookies
during render** — only Middleware and Route Handlers can. Since `/learn`
and `/learn/[courseSlug]` are Server Components that need an identity
before they render anything (including on a visitor's very first
request), middleware is the only place that can guarantee the cookie
exists before any page or API route runs.

## The trust boundary

- `src/server/identity/dev-identity.ts` is the **only** file that reads
  the identity cookie. Nothing else in the codebase touches
  `novatok_dev_student_id` directly.
- Every learning service (`src/server/learning/*.ts`) takes `studentId`
  as a plain function argument supplied by the caller (a page or API
  route that already called `getStudentIdentity()`) — services never
  derive it from a request body, a query param, or anything else a
  client could forge. `POST /api/learning/enroll` and `POST
  /api/learning/progress` both ignore any `studentId` field a client
  might include in the request body; see
  `src/app/api/learning/enroll/route.test.ts`'s "never trusts a
  client-supplied studentId" test.
- Because `studentId` is just an opaque string end-to-end, **cross-student
  protection falls out of the data model automatically**: every query is
  scoped to the caller's own `studentId` (e.g.
  `@@unique([studentId, courseId])` on `StudentEnrollment`), so there is
  no code path where one student's request can read or write another
  student's `StudentEnrollment`/`LessonProgress` rows.

## Replacing this with real NovaTok Social auth later

When NovaTok Courses moves into novatoksocial.com, replace **only**
`src/server/identity/dev-identity.ts`'s `getStudentIdentity()`:

```ts
// Sprint 5 (today):
export async function getStudentIdentity(): Promise<StudentIdentity> {
  const cookieStore = await cookies();
  const studentId = cookieStore.get(DEV_STUDENT_COOKIE)?.value;
  if (!studentId) throw new MissingStudentIdentityError();
  return { studentId };
}

// Future (sketch):
export async function getStudentIdentity(): Promise<StudentIdentity> {
  const session = await getNovaTokSocialSession(); // real, verified
  if (!session) redirect("/login");                // or throw a real 401
  return { studentId: session.userId };
}
```

Nothing else changes. Every learning service, every API route, every
page already depends only on the `StudentIdentity` shape (`{ studentId:
string }`), not on how it was obtained — that's the entire point of
routing everything through this one function. `src/middleware.ts`'s
cookie-provisioning logic gets deleted at that point (real sessions are
established by NovaTok Social's own login flow, not auto-assigned).

## Known limitations before production auth

- **No real security today.** Anyone can clear cookies to get a fresh
  identity, or manually set the cookie to a value they choose, and there
  is no way to distinguish "identities" beyond that. This is acceptable
  only because Sprint 5 has no payments, no private data of consequence,
  and no cross-user visibility of any kind — do not treat
  `novatok_dev_student_id` as a security control.
- **No account recovery / no persistence across browsers or devices.**
  Clearing cookies or switching browsers starts a new, disconnected
  "student."
- **Enrollment is free** — Sprint 5 has no payment gate of any kind, by
  design (out of scope; see CLAUDE.md).
- `MissingStudentIdentityError` (thrown if `getStudentIdentity()` is
  somehow called without middleware having run first) is a genuine bug
  signal, not a normal user-facing error — it should be treated as a
  500-level failure if it's ever actually reachable in practice.
