# NovaTok Courses

## Purpose

NovaTok Courses is a standalone courses marketplace. It is being built to
later power a "Courses" tab inside novatoksocial.com, but for now it ships
and is developed as an independent application with its own repo, database,
and deploy lifecycle.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL via Prisma (`prisma/schema.prisma`, generated client in
  `src/generated/prisma`, not committed)
- Zod for runtime validation (env vars, input parsing)
- npm as the package manager — do not introduce yarn/pnpm lockfiles
- Vitest for unit tests

## Repository Rules

- Do not add authentication, payments, affiliate payouts, file uploads, or
  reviews until explicitly requested. These are out of scope for early
  sprints — ask before implementing any of them.
- The AI Course Advisor (Sprint 2, `src/ai/`, `src/server/advisor/`) and
  AI Tutor (Sprint 3–4, `src/server/tutor/`, `CourseModule`/`Lesson`
  models) were explicitly requested and are in scope. Keep the AI layer
  provider-agnostic (`src/ai/provider.ts`); business logic must depend
  only on that interface, never directly on an Ollama/cloud SDK — both
  features share the same provider/adapter code, do not fork a second AI
  architecture. No paid cloud AI API is called. Recommendations and Tutor
  answers must stay grounded in real PostgreSQL rows — never display a
  course/lesson slug the retrieval query didn't actually return. See
  docs/ai-course-advisor.md and docs/ai-tutor.md.
- Local dev Postgres runs in Docker as a shared server across NovaTok
  modules (container `novatok-postgres`, database `novatok` holds other
  modules' tables). This project uses its own isolated database
  (`novatok_courses`) inside that same server — never point
  `DATABASE_URL` at the shared `novatok` database, and never run
  `prisma migrate dev`/`db push --accept-data-loss` against a database you
  didn't create yourself; both commands try to own the whole schema and
  will offer to drop tables they don't recognize.
- `/api/ai/course-advisor` and `/api/ai/tutor` go through
  `src/lib/ai-request-guard.ts` (body size, rate limit, concurrency cap).
  It's intentionally in-memory/single-process — don't add Redis or a
  distributed limiter unless actually running more than one instance.
- Do not add CI configuration until explicitly requested.
- Keep the Prisma schema minimal and only add models when a feature that
  needs them is actually being implemented — no speculative schema.
- One local commit per approved unit of work. Before committing, `lint`,
  `typecheck`, `test`, and `build` must all pass:

  ```sh
  npm run lint
  npm run typecheck
  npm run test
  npm run build
  ```

- Do not push to GitHub unless explicitly asked.
- `.env` holds local secrets and is never committed; `.env.example`
  documents the required shape.
- Prefer editing existing files over creating new ones; don't add
  abstractions or scaffolding beyond what the current task needs.
