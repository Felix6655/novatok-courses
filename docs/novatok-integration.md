# NovaTok Social Integration

## Status

NovaTok Courses is developed today as a standalone repository, database, and
deploy target for isolation and fast iteration. It is **not** a separate
product or brand — it is the Courses module of novatoksocial.com, built
ahead of the main site integrating it. Conceptually:

```text
novatok-social-web
    |
    +-- Feed
    +-- Music
    +-- Messaging
    +-- Profile
    +-- Courses  <-- this repository, eventually mounted here
```

Nothing in this repo should read as an unrelated "course academy" brand:
copy, navigation, and visual language are written to slot under
novatoksocial.com without a rename.

## Planned NovaTok routes

Once merged into the NovaTok Social web app, these routes map directly:

| This repo (standalone dev)  | novatoksocial.com (integrated)      |
| ---------------------------- | ------------------------------------ |
| `/courses`                   | `novatoksocial.com/courses`          |
| `/courses/[slug]`            | `novatoksocial.com/courses/[slug]`   |
| `/categories/[slug]`         | `novatoksocial.com/categories/[slug]`|
| `/api/courses`               | `novatoksocial.com/api/courses`      |
| `/api/courses/[slug]`        | `novatoksocial.com/api/courses/[slug]`|
| `/api/categories`            | `novatoksocial.com/api/categories`   |

No route currently assumes a standalone domain (no hardcoded absolute
URLs, no separate cookie domain, no subdomain-specific config).

## API endpoints and response shapes

All responses are JSON. Prisma `Decimal` fields (`price`, `originalPrice`)
are serialized as fixed 2-decimal strings (e.g. `"199.00"`); `Date` fields
are ISO 8601 strings.

### `GET /api/categories`

Returns active categories ordered by `displayOrder`.

```json
{ "categories": [ { "id": "...", "name": "AI for Business", "slug": "ai-for-business", "description": "...", "icon": "brain-circuit", "displayOrder": 1, "active": true, "createdAt": "...", "updatedAt": "..." } ] }
```

### `GET /api/courses`

Query params (all optional unless noted): `search`, `category` (slug),
`level` (`BEGINNER` | `INTERMEDIATE` | `ADVANCED`), `minPrice`, `maxPrice`,
`featured` (`true` | `false`), `page` (default `1`), `limit` (default
`12`, max `50`). Only `PUBLISHED` courses are returned. Invalid params
return `400` with a structured issue list.

```json
{
  "courses": [ { "id": "...", "title": "...", "slug": "...", "price": "199.00", "originalPrice": null, "category": { "...": "..." }, "...": "..." } ],
  "pagination": { "page": 1, "limit": 12, "total": 45, "totalPages": 4 }
}
```

### `GET /api/courses/[slug]`

Returns `404` if the course doesn't exist or isn't `PUBLISHED`.

```json
{ "course": { "...": "..." }, "category": { "...": "..." }, "relatedCourses": [ { "...": "..." } ] }
```

## Required environment variables

| Variable       | Purpose                                                        |
| -------------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | Standard PostgreSQL connection string (`postgresql://user:pass@host:5432/db?schema=public`) |

PostgreSQL is the only database this project uses. The Prisma client is
initialized with `@prisma/adapter-pg` (the generic `pg`-based driver
adapter), not a vendor SDK — the same `DATABASE_URL` works against a local
Postgres instance, Neon, Render, Railway, or any other standard Postgres
host without code changes.

## Moving into / consuming from novatok-social-web

Two integration paths, in order of likely adoption:

1. **Move-in (recommended for the actual integration):** copy
   `prisma/schema.prisma` models (`Category`, `Course`, enums) into the
   NovaTok Social schema (or run this schema against the same database as
   an additional set of tables), copy `src/server/`, `src/lib/`,
   `src/components/courses/`, and the `app/courses` and `app/categories`
   routes into the NovaTok Social Next.js app, and wire them under the
   existing app shell/navigation. This repo's service-layer functions
   (`listCourses`, `getCourseBySlug`, `listCategories`, etc.) have no
   dependency on anything outside `@/lib/prisma`, `@/generated/prisma`,
   and Zod, so the move is a file copy plus import-path updates.
2. **Consume via API (useful during a transition period):** if NovaTok
   Social needs course data before the full move-in happens, it can call
   the `/api/courses*` and `/api/categories` endpoints on a deployed
   instance of this repo directly, using the response shapes documented
   above.

## Future shared authentication

Sprint 1 has no authentication. When this module is integrated, it should
adopt NovaTok Social's existing session/auth mechanism rather than
introducing its own — the course catalog itself stays public/read-only, but
future work (saved courses, enrollment, instructor tooling) will need the
logged-in NovaTok Social user, not a parallel account system. No auth
scaffolding (tables, providers, cookies) has been added here to avoid
conflicting with whatever NovaTok Social already uses.

## CORS considerations during standalone development

If this repo is deployed to its own host while NovaTok Social is developed
separately (e.g. a staging NovaTok Social frontend calling a staging
NovaTok Courses API), the API routes will need explicit CORS headers
scoped to the known NovaTok Social origin(s) — none are configured today
because same-origin `fetch`/Server Component calls are enough for
standalone development. Do not add a wildcard (`*`) CORS policy; scope it
to the specific NovaTok Social origins when that need arises.

## Intentionally not in Sprint 1

Authentication, payments, AI recommendations, course lesson playback,
student progress, reviews, instructor uploads, affiliate commissions,
payouts, an admin dashboard, CI configuration, Supabase, Firebase, and any
Google service or SDK. These are out of scope until a later sprint
explicitly requests them.
