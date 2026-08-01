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

The AI Course Advisor (Sprint 2), AI Tutor (Sprint 3–4, extended in
Sprint 6 with bounded learning-state context), and AI Learning Coach
(Sprint 5, upgraded to V2 in Sprint 6 with practice/review-aware guidance)
all talk to AI providers through the same provider-agnostic interface
(`src/ai/provider.ts`). Only a local Ollama adapter is implemented — no
paid cloud AI API is called, and none is required to run the app. See
[docs/ai-course-advisor.md](./docs/ai-course-advisor.md),
[docs/ai-tutor.md](./docs/ai-tutor.md), and
[docs/learning-progress.md](./docs/learning-progress.md).

Student identity (enrollment, progress) uses a development-only cookie —
**not production authentication**. See
[docs/student-identity.md](./docs/student-identity.md) before assuming
otherwise.

## Prerequisites

- Node.js 20+ and npm
- A running PostgreSQL instance (local or hosted) and its connection string

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get a PostgreSQL instance**

   Any standard Postgres works. If you don't already have one running
   locally, the quickest option is a throwaway Docker container — this
   does **not** require Supabase, Firebase, or any hosted service:

   ```bash
   docker run --name novatok-courses-postgres -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 -d postgres:16
   ```

   **If you already run Postgres in Docker for other projects and it
   hosts other apps' tables**, create a separate database inside that
   same server rather than pointing this project at the shared one —
   Prisma's schema-sync commands (`migrate dev`, `db push`) try to own the
   entire target schema and will treat unrelated tables as drift, offering
   to drop them:

   ```bash
   docker exec <your-postgres-container> psql -U postgres -d postgres \
     -c "CREATE DATABASE novatok_courses;"
   ```

3. **Configure `DATABASE_URL`**

   Copy the environment template and point it at your Postgres instance:

   ```bash
   cp .env.example .env
   ```

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/novatok_courses?schema=public"
   ```

4. **Run the Prisma migrations**

   Creates the database schema (`Category`, `Course`, `CourseModule`,
   `Lesson`, `StudentEnrollment`, `LessonProgress` tables and enums):

   ```bash
   npm run db:migrate
   ```

5. **Seed the database**

   Loads 15 categories, 50 realistic courses, and lesson content (24
   modules / 45 lessons) for 12 of those courses. The seed upserts by
   slug/displayOrder, so running it repeatedly is safe and never creates
   duplicates:

   ```bash
   npm run db:seed
   ```

6. **(Optional) Verify against the real database**

   ```bash
   npm run db:smoke
   ```

   Exercises the actual service layer — categories, course filters,
   search, module/lesson retrieval — against your live database and
   prints pass/fail per check.

7. **(Optional) Configure the AI Course Advisor and AI Tutor**

   The catalog, search, and filters work without this. To use
   `/courses/advisor` or `/courses/[slug]/tutor`, install
   [Ollama](https://ollama.com/download), pull a model, and set the AI
   variables in `.env` — see
   [docs/ai-course-advisor.md](./docs/ai-course-advisor.md) and
   [docs/ai-tutor.md](./docs/ai-tutor.md) for the full walkthrough:

   ```bash
   ollama pull llama3.2
   ```

   ```env
   AI_PROVIDER="ollama"
   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="llama3.2"
   ```

8. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000/courses](http://localhost:3000/courses) to
   see the catalog,
   [http://localhost:3000/courses/advisor](http://localhost:3000/courses/advisor)
   for the AI Course Advisor,
   [http://localhost:3000/courses/javascript-fundamentals/tutor](http://localhost:3000/courses/javascript-fundamentals/tutor)
   for the AI Tutor, or
   [http://localhost:3000/learn](http://localhost:3000/learn) for the
   student learning dashboard (enroll in a course from its detail page
   first — see [docs/learning-progress.md](./docs/learning-progress.md)).

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
npm run db:seed       # seed categories, courses, modules, and lessons (idempotent)
npm run db:smoke      # verify the real service layer against a live database
npm run smoke:advisor # live E2E: Course Advisor against real Postgres + Ollama
npm run smoke:tutor   # live E2E: AI Tutor against real Postgres + Ollama
npm run smoke:coach   # live E2E: enroll -> tutor -> complete -> practice -> resume -> Learning Coach
npm run smoke:http    # live HTTP status checks (build/start the app first)
```

The `smoke:*`/`db:smoke` scripts require a reachable, seeded
`DATABASE_URL`; `smoke:advisor`, `smoke:tutor`, and `smoke:coach`
additionally require a running Ollama with `OLLAMA_MODEL` set to a model
you've already pulled; `smoke:http` requires the app itself running
(`npm run build && npm run start`, or `npm run dev`). None of them are
part of `npm test` — the automated suite never requires a live database,
AI provider, or running server.

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

Sprint 3–4 — AI Tutor:

- `/courses/[slug]/tutor` — ask questions about a specific course's
  material, optionally pinned to one lesson (`?lessonSlug=...`), with
  bounded follow-up conversation for the page session (20 courses have
  seeded content; others show a graceful "not available yet" state)
- `/api/ai/tutor` — `POST` `{ courseSlug, question, lessonSlug?, responseMode?, history? }`,
  get back a grounded, structured answer

Sprint 5 — student learning, progress, and the AI Learning Coach:

- `/learn` — dashboard of the student's enrolled courses, progress,
  review-candidate hints, and recent activity (Sprint 6)
- `/learn/[courseSlug]` — the learning experience: syllabus, current
  lesson, progress bar, mark-complete, Tutor entry point, a Practice panel
  (Sprint 6), and the Learning Coach (optionally `?lessonSlug=...` to
  jump to a specific lesson)
- `/api/learning/enroll` — `POST { courseSlug }`, free/dev enrollment
- `/api/learning/progress` — `POST { courseSlug, lessonSlug }`, mark a
  lesson complete
- `/api/ai/learning-coach` — `POST { courseSlug, recentTutorHistory? }`,
  a grounded "what should I learn next?" explanation, now (Sprint 6)
  including deterministic review candidates and recent practice signals

Sprint 6 — practice questions and learning intelligence:

- `/api/learning/practice` — `POST { courseSlug, lessonSlug }`, generates
  one AI practice question grounded in that lesson (answer key kept
  server-side only)
- `/api/learning/practice/evaluate` — `POST { practiceId, studentAnswer }`,
  deterministic grading for multiple-choice, AI-assisted grading for
  short-answer; records a `PRACTICE_ATTEMPT` activity, never touches
  lesson-completion state

All learning routes use a development-only student identity cookie,
**not real authentication** — see
[docs/student-identity.md](./docs/student-identity.md).

`/api/ai/*` and `/api/learning/practice*` are protected against accidental
rapid/oversized requests via `src/lib/ai-request-guard.ts`;
`/api/learning/enroll` and `/api/learning/progress` use a separate,
lighter-weight guard proportionate to a non-AI operation
(`src/lib/learning-mutation-guard.ts`). See
[docs/ai-tutor.md](./docs/ai-tutor.md#request-protection) and
[docs/learning-progress.md](./docs/learning-progress.md#request-protection-sprint-6).

See [docs/novatok-integration.md](./docs/novatok-integration.md) for the
Sprint 1 catalog API shapes,
[docs/ai-course-advisor.md](./docs/ai-course-advisor.md) for the advisor's
architecture, [docs/ai-tutor.md](./docs/ai-tutor.md) for the Tutor's
content model, grounding rules, and API contract, and
[docs/learning-progress.md](./docs/learning-progress.md) for enrollment,
progress, resume, and the Learning Coach.
