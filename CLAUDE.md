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

- Do not add production authentication, payments, affiliate payouts, file
  uploads, or reviews until explicitly requested. These are out of scope
  for early sprints — ask before implementing any of them.
- The AI Course Advisor (Sprint 2, `src/ai/`, `src/server/advisor/`), AI
  Tutor (Sprint 3–4, `src/server/tutor/`, `CourseModule`/`Lesson` models),
  AI Learning Coach (Sprint 5, `src/server/learning/learning-coach.ts`),
  and Sprint 6's learning-intelligence layer (practice questions, review
  recommendations, `LearningActivity`, `src/server/learning/practice.ts`,
  `learning-signals.ts`, `review-recommendations.ts`) were explicitly
  requested and are in scope. Keep the AI layer provider-agnostic
  (`src/ai/provider.ts`); business logic must depend only on that
  interface, never directly on an Ollama/cloud SDK — every AI feature
  shares the same provider/adapter code, do not fork a second AI
  architecture. No paid cloud AI API is called. Recommendations, Tutor
  answers, and Learning Coach explanations must stay grounded in real
  PostgreSQL rows — never display a course/lesson slug the retrieval query
  didn't actually return; for the Learning Coach specifically, the next
  lesson and any review candidates are decided entirely by
  `getLearningSignals()`/`getReviewCandidates()` before the AI is ever
  called, and the model's response schema has no lesson/course identifier
  field at all. Practice-question correctness for multiple-choice is
  always evaluated deterministically server-side against a stored answer
  key — never by asking the AI whether its own answer is correct — and
  practice results never modify `LessonProgress`/`StudentEnrollment`,
  only `LearningActivity`. See docs/ai-course-advisor.md, docs/ai-tutor.md,
  and docs/learning-progress.md.
- Student identity (`src/server/identity/dev-identity.ts`,
  `src/middleware.ts`) is a development-only cookie, explicitly NOT
  production authentication — see docs/student-identity.md before
  changing it or building on top of it. Learning services
  (`src/server/learning/*`) take `studentId` as a plain function
  parameter and never read it from a request body/query param.
  `LearningActivity` metadata is a small, fixed-shape JSON per event type
  — never raw AI prompts, answers, or unrestricted conversation text.
- Local dev Postgres runs in Docker as a shared server across NovaTok
  modules (container `novatok-postgres`, database `novatok` holds other
  modules' tables). This project uses its own isolated database
  (`novatok_courses`) inside that same server — never point
  `DATABASE_URL` at the shared `novatok` database, and never run
  `prisma migrate dev`/`db push --accept-data-loss` against a database you
  didn't create yourself; both commands try to own the whole schema and
  will offer to drop tables they don't recognize.
- `/api/ai/*` and `/api/learning/practice*` go through
  `src/lib/ai-request-guard.ts` (body size, rate limit, concurrency cap).
  `/api/learning/enroll` and `/api/learning/progress` go through a
  separate, lighter `src/lib/learning-mutation-guard.ts` (rate limit only,
  no concurrency cap — they're plain DB writes, not AI calls). Both are
  intentionally in-memory/single-process — don't add Redis or a
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
