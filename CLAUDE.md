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

- Do not add authentication, payments, AI recommendations, affiliate
  payouts, file uploads, or reviews until explicitly requested. These are
  out of scope for early sprints — ask before implementing any of them.
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
