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

The AI Course Advisor (Sprint 2) talks to AI providers through a
provider-agnostic interface (`src/ai/provider.ts`). Only a local Ollama
adapter is implemented — no paid cloud AI API is called, and none is
required to run the app. See
[docs/ai-course-advisor.md](./docs/ai-course-advisor.md).

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

5. **(Optional) Configure the AI Course Advisor**

   The catalog, search, and filters work without this. To use
   `/courses/advisor`, install [Ollama](https://ollama.com/download), pull
   a model, and set the AI variables in `.env` — see
   [docs/ai-course-advisor.md](./docs/ai-course-advisor.md) for the full
   walkthrough:

   ```bash
   ollama pull llama3.2
   ```

   ```env
   AI_PROVIDER="ollama"
   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="llama3.2"
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000/courses](http://localhost:3000/courses) to
   see the catalog, or
   [http://localhost:3000/courses/advisor](http://localhost:3000/courses/advisor)
   for the AI Course Advisor.

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

## Routes

Sprint 1 — course catalog:

- `/courses` — public course catalog: search, category/level/price
  filters, pagination
- `/courses/[slug]` — course detail page
- `/categories/[slug]` — courses within a single category
- `/api/categories` — active categories
- `/api/courses` — paginated, filterable, searchable published courses
- `/api/courses/[slug]` — a single published course with related courses

Sprint 2 — AI Course Advisor:

- `/courses/advisor` — natural-language course recommendation form
- `/api/ai/course-advisor` — `POST` a `{ "message": string }` learning
  goal, get back grounded, structured recommendations

See [docs/novatok-integration.md](./docs/novatok-integration.md) for the
Sprint 1 catalog API shapes and
[docs/ai-course-advisor.md](./docs/ai-course-advisor.md) for the advisor's
architecture, configuration, and API contract.
