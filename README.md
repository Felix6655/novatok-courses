# NovaTok Courses

A standalone courses marketplace, built to later power the Courses module
inside novatoksocial.com. See [CLAUDE.md](./CLAUDE.md) for the full project
purpose and repository rules, and
[docs/novatok-integration.md](./docs/novatok-integration.md) for how this
repo integrates with NovaTok Social.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma · Zod

PostgreSQL is the only database used by this project. Prisma connects to it
directly via `DATABASE_URL` using the generic `pg` driver adapter — no
vendor-specific database SDK (no Supabase, no Firebase, no Google Cloud).
Any standard PostgreSQL host works: local Postgres, Neon, Render, Railway,
etc.

## Prerequisites

- Node.js 20+ and npm
- A running PostgreSQL instance (local or hosted) and its connection string

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure PostgreSQL**

   Copy the environment template and set `DATABASE_URL` to your Postgres
   connection string:

   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/novatok_courses?schema=public"
   ```

3. **Run the Prisma migration**

   Creates the database schema (`Category`, `Course` tables and enums):

   ```bash
   npm run db:migrate
   ```

4. **Seed the database**

   Loads 15 categories and 50 realistic courses. The seed upserts by slug,
   so running it repeatedly is safe and never creates duplicates:

   ```bash
   npm run db:seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000/courses](http://localhost:3000/courses) to
   see the catalog.

## Scripts

```bash
npm run dev           # start the dev server
npm run build         # production build
npm run start         # run the production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm run test          # vitest
npm run db:validate   # validate prisma/schema.prisma
npm run db:generate   # regenerate the Prisma client
npm run db:migrate    # apply Prisma migrations (prisma migrate dev)
npm run db:seed       # seed categories and courses (idempotent)
```

## Validation before committing

Per [CLAUDE.md](./CLAUDE.md), all of these must pass before a commit:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Sprint 1 routes

- `/courses` — public course catalog: search, category/level/price
  filters, pagination
- `/courses/[slug]` — course detail page
- `/categories/[slug]` — courses within a single category
- `/api/categories` — active categories
- `/api/courses` — paginated, filterable, searchable published courses
- `/api/courses/[slug]` — a single published course with related courses

See [docs/novatok-integration.md](./docs/novatok-integration.md) for full
request/response shapes.
