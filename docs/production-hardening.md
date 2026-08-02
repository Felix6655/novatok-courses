# Production Hardening (Sprint 7)

Sprint 7's focus: get NovaTok Courses closer to a state where it could
actually run in production, without inventing the one piece that
genuinely isn't available yet — real NovaTok Social identity. This
document covers what changed, what's still blocked, and exactly why.

## NovaTok Social auth: investigated, found unusable as-is

Sprint 7 started by checking whether a NovaTok Social repository was
reachable and, if so, auditing its real session contract rather than
guessing. `C:\Users\Luis\Documents\felix-repos\novatok-social-web` is a
real, active git repository (remote `github.com/Felix6655/novatok-social-web`,
matching this project's configured git user) — so it was inspected
directly rather than treated as unavailable.

**Findings:**

- Authentication is **Supabase Auth** (`@supabase/supabase-js`,
  `signInWithPassword`/`signUpWithPassword`/`signInWithMagicLink` in
  `lib/supabase/client.js`), which NovaTok Courses' own rules explicitly
  forbid adopting (see CLAUDE.md and this sprint's instructions: "do NOT
  rely on old Supabase assumptions").
- The login page contains `const allowBypass = true // ← allow dev bypass
  even in production` — a live signal that this auth flow is not itself
  stable/production-hardened.
- **No `middleware.ts`** anywhere in the repository, and no server-side
  session-verification helper was found (`getServerSession`, a
  cookie-based session reader, etc.) — sessions appear to be handled
  entirely client-side via the Supabase JS SDK, with no evidence of a
  documented, verifiable server-side session contract Courses could
  integrate against.

**Conclusion: this is exactly the "old Supabase assumption" this
project's rules say not to build on, and there is no stable, documented,
server-verifiable session contract to adopt.** Per the sprint's explicit
instruction, this is treated the same as "NovaTok Social unavailable":

- No production identity adapter was implemented this sprint.
- No Supabase Auth, Firebase Auth, Google Auth, Clerk, Auth0, or
  NextAuth/Auth.js was added to this repository.
- The Sprint 5 development identity (`src/server/identity/dev-identity.ts`,
  `src/middleware.ts`) remains exactly as it was, functionally — see
  [docs/student-identity.md](./student-identity.md).
- Instead, this sprint added a **safety rail** (below) so that gap can
  never be silently invisible in a real deployment.

## The production identity safety rail

Since no production adapter exists, the risk is a real deployment
starting up with `NODE_ENV=production` and nobody noticing that every
visitor is still getting an auto-assigned, forgeable dev cookie identity.
`src/lib/env.ts`'s `assertIdentityModeIsSafe()` closes that gap:

```text
NODE_ENV !== "production"?
  → no-op (local dev, tests, anything non-production)

NODE_ENV === "production":
  STUDENT_IDENTITY_MODE === "development" (explicit opt-in)?
    → allowed to proceed with the dev cookie identity
  anything else (unset, any other value):
    → throws EnvValidationError, identity resolution fails loudly
```

Called from the one place every learning route/page already goes
through: `getStudentIdentity()` in `dev-identity.ts`. Verified live (see
**Live validation** below) — starting a real production build without
`STUDENT_IDENTITY_MODE` set fails every identity-requiring request with a
clear `EnvValidationError` at request time; setting it explicitly restores normal
operation.

This is deliberately **not** a production identity implementation — it's
a fail-safe that turns "silently insecure" into "loudly broken until
someone fixes it," which is the honest, available option given the
Checkpoint 2 findings above.

## Authorization boundary (audited, unchanged in design)

Every learning mutation and AI/student-specific endpoint was re-audited
this sprint:

| Endpoint | studentId source | Cross-student protection |
| --- | --- | --- |
| `POST /api/learning/enroll` | `getStudentIdentity()` only | `@@unique([studentId, courseId])` |
| `POST /api/learning/progress` | `getStudentIdentity()` only | scoped `LessonProgress` lookups |
| `POST /api/learning/practice` | `getStudentIdentity()` only | enrollment check + `PracticeSession.studentId` |
| `POST /api/learning/practice/evaluate` | `getStudentIdentity()` only | atomic `WHERE studentId = ...` (see below) |
| `POST /api/ai/learning-coach` | `getStudentIdentity()` only | enrollment check |
| `POST /api/ai/tutor` | `getStudentIdentity()` only (optional context) | enrollment check gates context only |
| `/learn`, `/learn/[courseSlug]` | `getStudentIdentity()` only | scoped queries |

No validation schema anywhere accepts a `studentId` field — confirmed by
grepping `src/lib/validation/` — so there is no code path where a client
could supply one even if a route forgot to ignore it. Every route's
"never trusts a client-supplied studentId" behavior now has an explicit
regression test (see **Security regression suite**).

`getCourseBySlug()` filters `status: "PUBLISHED"` everywhere course
resolution happens, so DRAFT/ARCHIVED courses are already unreachable via
slug lookup — confirmed unchanged this sprint.

## CSRF: documented, not solved (per the blocked-auth rule)

Per the sprint's explicit instruction — reuse NovaTok Social's CSRF
convention if one exists and the session model is shared, otherwise
document the requirement rather than inventing a competing system:

- The Sprint 5 dev identity cookie is `httpOnly` + `SameSite=Lax` (see
  `src/middleware.ts`). `SameSite=Lax` is a real, standard baseline
  mitigation: browsers don't attach it to cross-site `POST` requests, only
  top-level navigations, so a naive cross-site form/fetch CSRF attempt
  against `/api/learning/*` already doesn't carry the cookie today.
- This is **not** a dedicated CSRF token system, and it was not one
  before this sprint either — no change was made here, because there is
  no NovaTok Social CSRF convention to reuse (Checkpoint 2 found no
  server-side session handling at all, let alone a CSRF mechanism) and
  inventing a standalone one that will need to be thrown away once real
  auth arrives would be wasted, throwaway work.
- **Remaining requirement, explicitly not solved:** once real NovaTok
  Social identity is integrated, confirm what CSRF convention (if any)
  that integration uses and adopt it here rather than assuming
  `SameSite=Lax` alone remains sufficient — particularly if the real
  session ever carries a bearer token in a header instead of a cookie,
  in which case CSRF risk profile changes entirely.

## PostgreSQL-backed practice state (was in-memory in Sprint 6)

Sprint 6's `practice-store.ts` was an in-memory `Map` — correct for a
single dev process, but wrong for production (state lost on restart, not
shared across instances). Sprint 7 replaces it with a real `PracticeSession`
Prisma model (migration `20260801233639_add_practice_session`):

```prisma
model PracticeSession {
  id                 String
  studentId          String
  courseId           String
  lessonId           String
  questionType       PracticeQuestionType
  question           String
  choices            String[]
  correctChoiceIndex Int?
  modelAnswer        String?
  explanation        String
  createdAt          DateTime
  expiresAt          DateTime
  consumedAt         DateTime?
}
```

Only the minimum state needed to grade one attempt — no prompt/response
history, no conversation log.

**One-shot evaluation and replay protection are now enforced by
PostgreSQL itself, not application logic:** `takePendingPractice()`
issues a single conditional `UPDATE ... SET "consumedAt" = now() WHERE
id = ? AND "studentId" = ? AND "consumedAt" IS NULL AND "expiresAt" > now()`
via `updateMany()`. This is one atomic SQL statement — two concurrent
evaluate requests for the same `practiceId` cannot both succeed, because
only one transaction can win the row-level update; the loser sees
`count: 0` and is rejected. The answer key is only read (via a follow-up
`findUnique`) after successfully winning that update.

**Ownership is enforced inside that same WHERE clause**, which is a real
improvement over Sprint 6: the in-memory version consumed an entry on any
guess of its id regardless of who guessed it (documented as an accepted
trade-off since ids were unguessable UUIDs); the Postgres version's
`studentId` predicate means a wrong-student attempt matches zero rows and
**does not consume the real owner's session at all** — verified live (see
below).

**Expiration** (15-minute TTL) is enforced the same way, via `expiresAt >
now()` in that same WHERE clause. **Cleanup** is opportunistic and
bounded: every time a student generates a new practice question,
`storePendingPractice()` deletes that same student's own expired rows
first — no cron job, no unbounded table growth, no global sweep.

**The generate API still never returns the answer key** —
`correctChoiceIndex`/`modelAnswer` are written to Postgres but never
serialized into the `POST /api/learning/practice` response, unchanged
from Sprint 6's guarantee, now backed by a real database instead of a
Map.

## Rate-limit production abstraction

`src/lib/rate-limit/types.ts` defines a `RateLimitAdapter` interface
(`consume(key, max, windowMs) -> {allowed, retryAfterSeconds}`, `reset()`).
`src/lib/rate-limit/in-memory-adapter.ts` implements it — the same
per-process `Map`-based logic both guards used to have inline, now shared
and swappable. `src/lib/ai-request-guard.ts` and
`src/lib/learning-mutation-guard.ts` each hold their own
`InMemoryRateLimitAdapter` instance and depend only on the interface.

**Concurrency capping (the AI guard's separate 2-in-flight-calls limit)
was deliberately NOT folded into this abstraction.** It's a genuinely
different problem: rate limiting is "how many requests per window," which
generalizes cleanly to a shared store; concurrency capping is "how many
calls THIS process currently has open against one local Ollama instance,"
which doesn't generalize the same way — coordinating it across multiple
instances would mean a distributed work queue, a heavier, different
problem than rate limiting, and there's no evidence yet that more than
one instance will run against one Ollama. Revisit if that changes.

**No Redis adapter was implemented.** A `novatok-redis` container exists
in this development environment from other NovaTok modules, but nothing
in this project's documentation establishes it as a shared, reusable rate-limiting
service for Courses specifically, and coupling Courses to another
module's Redis instance without that being an established, intentional
part of the deployment architecture would be exactly the "unnecessary
infrastructure" this sprint says not to add speculatively. The adapter
boundary above is what makes adding one later a contained change: a
`RedisRateLimitAdapter implements RateLimitAdapter` and a one-line swap in
each guard file, nothing else.

## Environment / production config validation

`src/lib/env.ts`:

- `getDatabaseUrl()` — validates `DATABASE_URL` is present and a
  well-formed `postgresql://` or `postgres://` URL before the Prisma client is constructed
  (`src/lib/prisma.ts`), replacing a previously-unvalidated
  `process.env.DATABASE_URL` read that would have surfaced as an opaque
  low-level driver error on misconfiguration.
- `assertIdentityModeIsSafe()` — the identity safety rail described
  above.

No secrets are committed; `.env` is gitignored, `.env.example` documents
the required shape including the new `STUDENT_IDENTITY_MODE` variable
with an explanatory comment. PostgreSQL remains provider-neutral (the
generic `pg` driver adapter, no vendor SDK) — unchanged this sprint.

### Environment variables (production)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | always | PostgreSQL connection string; validated at startup |
| `AI_PROVIDER` | always | Currently only `"ollama"` is implemented |
| `OLLAMA_BASE_URL` | when `AI_PROVIDER=ollama` | Reachable Ollama instance |
| `OLLAMA_MODEL` | when `AI_PROVIDER=ollama` | A model already pulled on that instance |
| `STUDENT_IDENTITY_MODE` | **only** when `NODE_ENV=production` | Must be `"development"` today — see the safety rail above |

## Deployment prerequisites (as of Sprint 7)

1. A reachable PostgreSQL 16+ instance with `DATABASE_URL` pointed at a
   database this project owns exclusively (never a shared database with
   other modules' tables — see CLAUDE.md).
2. `npx prisma migrate deploy` run against that database.
3. A reachable Ollama instance with the configured model already pulled
   (no paid cloud AI provider is implemented).
4. `STUDENT_IDENTITY_MODE=development` set explicitly if deploying with
   `NODE_ENV=production` today — **this is a known, temporary, and
   clearly-flagged gap, not a hidden one** (see Remaining blockers).
5. A single application instance. Both rate-limit guards and the AI
   concurrency cap are in-memory/per-process; running more than one
   instance requires implementing a shared `RateLimitAdapter` first (see
   above) and reassessing the concurrency cap.

## Remaining blockers

- **No production student identity.** Blocked on a real, stable NovaTok
  Social session contract — Sprint 7 found only a Supabase-based,
  client-side, dev-bypass-flagged implementation with no server-side
  session verification to integrate against. `STUDENT_IDENTITY_MODE=development`
  is a conscious, visible, temporary workaround, not a fix.
- **CSRF convention undecided** — see above; revisit once real identity
  integration reveals what session-transport model (cookie vs. bearer
  token) and CSRF convention (if any) NovaTok Social actually uses.
- **Single-instance ceiling.** Rate limiting and AI concurrency capping
  are both in-memory; horizontal scaling needs a shared `RateLimitAdapter`
  implementation first.
