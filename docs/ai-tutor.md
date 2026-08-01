# AI Tutor

The NovaTok AI Tutor lets a student open a course, ask questions about its
material, and get explanations, simpler rephrasings, examples, and
practice questions — grounded in that course's real content, not
open-ended chat. Introduced in Sprint 3; Sprint 4 made it end-to-end
usable: lesson-specific context, bounded follow-up conversation, expanded
content, and request protection.

## Architecture

```text
Student
   |
   v
Course Page  (/courses/[slug])
   |
   v
AI Tutor  (/courses/[slug]/tutor)
   |
   v
Tutor API  (POST /api/ai/tutor)
   |
   +--------------------------+
   |                          |
   v                          v
Course Content Retrieval    AIProvider  (src/ai/provider.ts — reused from Sprint 2)
(src/server/tutor/)              |
   |                          v
   v                       Ollama Adapter  (src/ai/providers/ollama.ts — reused)
PostgreSQL
(Course, CourseModule, Lesson)
   |
   +------------+-------------+
                |
                v
       Grounded Tutor Context
                |
                v
       Validated Structured Response
                |
                v
              UI
```

This reuses the Sprint 2 AI layer unchanged: `AIProvider`, the Ollama
adapter, `getAIProvider()`, and the error types in `src/ai/errors.ts`. The
Tutor is a second consumer of that same provider-agnostic interface, not a
second AI architecture — no Ollama-specific or cloud-SDK types appear
anywhere in `src/server/tutor/`.

## Content model

```text
Course
  └── CourseModule (ordered)
        └── Lesson (ordered, real text content)
```

`CourseModule` and `Lesson` (`prisma/schema.prisma`) are the smallest
addition that gives the Tutor something real to ground answers in:

- `CourseModule`: `courseId`, `title`, `description`, `displayOrder`,
  unique on `(courseId, displayOrder)`.
- `Lesson`: `moduleId`, `courseId` (denormalized so retrieval can query
  "all lessons for this course" directly without a join), `slug`, `title`,
  `summary`, `content`, `displayOrder`, unique on `(courseId, slug)` and
  `(moduleId, displayOrder)`.

No video, no instructor authoring workflow, no completion tracking, no
quizzes stored in the database — those are out of scope until a feature
actually needs them.

## Seeded content

12 published courses across 11 categories and all three levels
(BEGINNER/INTERMEDIATE/ADVANCED) have real module and lesson content — 24
modules, 45 lessons total:

`javascript-fundamentals`, `cybersecurity-fundamentals`,
`python-for-data-science`, `digital-marketing-fundamentals`,
`project-management-fundamentals`, `ai-fundamentals-for-managers`,
`cloud-computing-foundations`, `sales-fundamentals-cold-call-to-close`,
`stock-market-basics`, `budgeting-and-debt-payoff-fundamentals`,
`business-english-foundations`, `advanced-system-design-for-engineers`.

The other ~38 catalog courses intentionally have no Tutor content yet —
the Tutor UI and API both handle that gracefully (see **Errors** below)
rather than assuming every course has lessons. Content lives in
`src/seed-data/course-content.ts`; extending it to more courses is
additive — add another `CourseContentSeed` entry and re-run `npm run
db:seed`.

## Retrieval strategy

No vector database, no embeddings, no external search service —
deliberately, given the current content scale (45 lessons). Retrieval
(`src/server/tutor/content-retrieval.ts`) branches on whether the request
pins a specific lesson:

**No `lessonSlug` (keyword retrieval):**

1. `extractKeywords(question)` strips stopwords and Tutor-interaction meta
   words ("explain", "practice", "next", "study"...), leaving only
   topical terms.
2. If there are no topical keywords at all (e.g. "What should I study
   next?"), the question is treated as a general/meta question — the
   course's early lessons are returned as reasonable default context.
3. Otherwise, every lesson in the course is scored by keyword overlap
   against its title, summary, and content (title weighted highest), and
   the top 3 are returned.
4. If keywords exist but **none** match anything in the course's lessons,
   that's treated as a deterministic, testable signal that the question is
   off-topic — see **Out-of-scope handling**.

**With `lessonSlug` (pinned retrieval, Sprint 4):**

1. `getPinnedLessonContext` (`src/server/tutor/content-retrieval.ts`)
   looks the lesson up scoped to the requested course
   (`courseId_slug` compound key) — a lesson slug from a different course
   simply doesn't match and is rejected, never silently served.
2. If found, that lesson becomes the primary context, followed by up to 2
   other lessons from the same module for a little surrounding context.
3. The keyword out-of-scope check is skipped entirely: a student who
   explicitly opened a lesson and asked about it has, by construction,
   asked an in-scope question.

This mirrors the Course Advisor's catalog-scoring approach
(`src/server/advisor/catalog-retrieval.ts`) for consistency. Revisit this
approach (and consider embeddings) only if the content library grows to a
size where keyword scoring stops being precise enough — not preemptively.

## Grounding and hallucination protection

The system prompt tells the model that the provided course material is
authoritative for course-specific claims, that it must not say the course
covers something absent from that material, and that it should be honest
when a question falls outside what's provided.

That instruction is necessary but not sufficient, so the code enforces it
independently, the same way `src/server/advisor/recommendation.ts` does
for course recommendations:

- **`relevantLessonSlugs`** the model returns are filtered against the
  actual lessons retrieved for that question. Anything else is dropped —
  there is no path that displays a lesson slug retrieval didn't return.
- If the model's JSON is missing, unparseable, or fails schema validation,
  the Tutor falls back to presenting the real retrieved lesson content
  directly (`answerSource: "fallback"`) instead of failing the request.
- If the model drops all cited slugs (e.g. cites only hallucinated ones),
  the response still shows the real retrieved lessons as the citation
  list — only the free-text answer is trusted to the model; which lessons
  get shown as sources never is.

## Out-of-scope question handling

Two layers, matching the "don't just trust the model" philosophy above:

1. **Deterministic (primary):** if the question has extractable topical
   keywords and none of them match anything in the course's lesson
   content, the Tutor returns a fixed redirect message —
   *"That's outside what's covered in {course}. I can help with questions
   about this course's material..."* — **without calling the AI provider
   at all**. This is fully unit-tested without Ollama
   (`src/server/tutor/tutor-service.test.ts`).
2. **Model-reported (secondary):** the prompt also asks the model to set
   `outOfScope: true` for borderline cases that pass the keyword check but
   the model still judges unrelated. When it does, its own answer text
   (a redirect-style message per the prompt) is used, and no lessons are
   cited.

This is intentionally not a general-purpose chatbot: a question with no
topical connection to the course's lessons never reaches the model.

## Practice questions

`responseMode: "PRACTICE"` asks the model to produce one practice question
grounded in the retrieved lesson content instead of a plain explanation.
The output (`{ question, choices?, answer, explanation }`) is Zod-validated
before being returned; nothing is persisted here — this Tutor-mode
question is generated fresh per request and never graded server-side.

**Sprint 6 added a separate, dedicated practice workflow** —
`POST /api/learning/practice` + `POST /api/learning/practice/evaluate` —
with a real answer key stored server-side and deterministic MULTIPLE_CHOICE
grading. See [docs/learning-progress.md](./learning-progress.md#practice-questions)
for the full design; this Tutor-mode practice question is unrelated and
unaffected by it, kept for quick "give me a practice question" follow-ups
inline in a Tutor conversation.

## Tutor API

### `POST /api/ai/tutor`

Request:

```json
{
  "courseSlug": "javascript-fundamentals",
  "question": "Can you give me another example?",
  "lessonSlug": "variables-and-data-types",
  "responseMode": "EXAMPLE",
  "history": [
    { "role": "user", "content": "Explain variables" },
    { "role": "assistant", "content": "A variable is a named container for a value." }
  ]
}
```

- `responseMode` is one of `NORMAL` (default) | `SIMPLE` | `EXAMPLE` |
  `PRACTICE`.
- `lessonSlug` (optional) pins the Tutor's context to one specific lesson —
  verified to belong to `courseSlug` before use (see **Lesson-specific
  context**). Omit it for course-wide keyword retrieval.
- `history` (optional, defaults to `[]`) is a bounded list of prior turns
  for light follow-up conversation — see **Follow-up context**.

Success response (`200`):

```json
{
  "courseSlug": "javascript-fundamentals",
  "courseTitle": "JavaScript Fundamentals",
  "question": "Can you give me another example?",
  "responseMode": "EXAMPLE",
  "pinnedLessonSlug": "variables-and-data-types",
  "answer": "Here's an example of declaring and using variables: let name = 'John'; ...",
  "grounded": true,
  "relevantLessons": [
    { "slug": "variables-and-data-types", "title": "Variables and Data Types", "moduleTitle": "JavaScript Basics" }
  ],
  "outOfScope": false,
  "practiceQuestion": null,
  "answerSource": "ai"
}
```

Error responses:

| Status | Meaning                                                                 |
| ------ | ------------------------------------------------------------------------ |
| `400`  | Malformed JSON body, or invalid `courseSlug`/`question`/`responseMode`/`lessonSlug`/`history` |
| `404`  | No PUBLISHED course matches `courseSlug`, or `lessonSlug` doesn't exist / belongs to a different course |
| `413`  | Request body too large (see **Request protection**)                     |
| `422`  | The course exists but has no Tutor-ready lesson content yet              |
| `429`  | Rate limit or concurrency limit hit (see **Request protection**)         |
| `502`  | The AI provider responded, but its output couldn't be parsed/validated for intent-equivalent steps; answer/practice generation itself degrades gracefully instead — see Grounding above |
| `503`  | The AI provider is unreachable or misconfigured                          |
| `500`  | Unexpected server error (no internal details included)                   |

## Lesson-specific context

Passing `lessonSlug` changes retrieval entirely (`src/server/tutor/tutor-service.ts`):

- `getPinnedLessonContext` looks the lesson up scoped to the given
  course's id, so a real lesson slug from a *different* course is
  rejected as if it didn't exist — `404`, never silently served.
- The pinned lesson becomes primary context, with up to 2 lessons from
  the same module included for a little extra surrounding material.
- The keyword-based out-of-scope check is skipped: opening a specific
  lesson and asking about it is treated as in-scope by construction.

In the UI, this happens two ways: clicking a lesson title directly from
the course page's syllabus list (`/courses/[slug]/tutor?lessonSlug=...`),
or picking a lesson from the "Ask about" dropdown on the Tutor page
itself.

## Bounded learning-state context and activity (Sprint 6)

`getTutorAnswer` now accepts an optional `studentId`, supplied by
`POST /api/ai/tutor` from `getStudentIdentity()` — never from the request
body. This is fully backward compatible: a request with no resolvable
identity (shouldn't happen in practice, since middleware always assigns
the dev cookie) behaves exactly like Sprint 3-5.

- **Activity**: every question logs one `TUTOR_QUESTION`
  `LearningActivity` row (`metadata: { responseMode }` only — never the
  question text), regardless of whether the student is enrolled in the
  course.
- **Context**: only if the student is enrolled, a small bounded summary
  (completed/total lesson counts, recent practice accuracy, up to 2
  review-candidate lesson titles — from
  `src/server/learning/learning-signals.ts`) is appended to the prompt.
  The system prompt frames it explicitly as guidance the model may use to
  answer things like "am I ready for the next lesson?", never as
  something the model's own answer can override — the platform's own
  progress tracking remains authoritative. See
  [docs/learning-progress.md](./learning-progress.md#ai-tutor-bounded-learning-state-context-sprint-6)
  for the full design.

## Follow-up context

`history` lets a student ask "explain that more simply," "give me another
example," or "quiz me on that" within one page session, without any
server-side conversation storage:

- Validated with `tutorHistoryTurnSchema` — `role` must be `"user"` or
  `"assistant"`, `content` is bounded to 1000 characters, and the array is
  capped at `MAX_HISTORY_TURNS` (6) total turns. Oversized or malformed
  history is rejected with `400`, exactly like any other input.
- The client (`TutorForm`) keeps the running conversation in component
  state and sends the most recent `MAX_HISTORY_TURNS` turns with each
  request — nothing is persisted server-side, and reloading the page
  starts fresh.
- History is inserted into the prompt as real chat turns between the
  system message and the final question (`buildTutorPromptMessages`), but
  the system prompt explicitly tells the model that prior conversation is
  context for *what's already been discussed*, not a source of course
  facts — the lesson material retrieved from PostgreSQL is still the only
  authoritative source. Grounding (dropping hallucinated
  `relevantLessonSlugs`) applies identically whether or not history is
  present.

## Request protection

`src/lib/ai-request-guard.ts` protects both `/api/ai/course-advisor` and
`/api/ai/tutor` against accidental rapid or oversized requests hammering a
single local Ollama instance:

- **Body size**: requests over ~20KB are rejected with `413` before JSON
  parsing (checked via `Content-Length` first, then actual read length).
- **Rate limit**: 10 requests per 60-second window per client key
  (`x-forwarded-for` / `x-real-ip`, falling back to a shared key in
  environments without either) — `429` with a `Retry-After` header once
  exceeded.
- **Concurrency cap**: at most 2 AI calls in flight at once per endpoint —
  a 3rd concurrent request gets `429` immediately rather than queuing
  behind an already-loaded local model.

This is deliberately in-memory and per-process — the smallest thing that
fits a single local/dev instance, not a distributed rate limiter. It's
explicitly *not* hardened against a determined attacker (e.g. a client
omitting `Content-Length` still gets fully read before the size check
runs); the goal is guarding against accidental abuse (a retry loop, a
runaway script), not adversarial traffic. Swapping in a shared store
(Redis or similar) before running more than one instance in production is
a drop-in replacement behind the same `guardAIRequest()` function
signature — nothing above it needs to change.

## UI

- `/courses/[slug]/tutor` — course-scoped Tutor page: a syllabus summary
  with clickable lesson links (reusing `CourseSyllabus`), an "Ask about"
  lesson dropdown (general course questions, or any specific lesson), a
  question box, and quick-action buttons (*Explain simpler*, *Give
  example*, *Quiz me*, *What next?*). With no conversation yet, a quick
  action prefills a starter question for you to review; once at least one
  turn exists, quick actions submit immediately as a follow-up using the
  running conversation. Each turn renders via `TutorAnswer`
  (`src/components/tutor/`) — answer text, any practice question (with an
  expandable answer), and the lesson titles the answer was grounded in —
  stacked in a simple transcript, not a chat-app redesign.
- The course detail page (`/courses/[slug]`) gets an **"Ask AI Tutor"**
  entry point, plus a syllabus where each lesson title links directly into
  that lesson's Tutor context — but only for the 12 courses that currently
  have content, so there's never a link into an empty Tutor experience.

This is still a single-page-session experience, not a persistent chat:
follow-up context lives in the browser tab's component state only (see
**Follow-up context**) and is gone on reload — there is no server-side
conversation storage.

## Ollama configuration

No new environment variables — the Tutor reuses `AI_PROVIDER`,
`OLLAMA_BASE_URL`, and `OLLAMA_MODEL` from Sprint 2
(see [docs/ai-course-advisor.md](./ai-course-advisor.md)). If Ollama isn't
running, `/api/ai/tutor` returns `503`, the same as the Course Advisor.

## Live smoke-test procedure

Two scripts exercise the real pipeline end to end (not part of the
automated test suite, which never requires a live server):

```bash
npm run smoke:advisor   # Course Advisor against real Postgres + Ollama
npm run smoke:tutor     # AI Tutor against real Postgres + Ollama
```

Both require a seeded, reachable `DATABASE_URL` and a running Ollama with
`OLLAMA_MODEL` set to a model you've already pulled. They print pass/fail
per check and exit non-zero on any failure — safe to run repeatedly, no
data is written. `npm run db:smoke` similarly exercises the plain catalog
service layer (categories, courses, filters, search, content retrieval)
against a live database without touching any AI provider.

## Limitations

- Follow-up context lives only in the browser tab's state for the current
  page session — no server-side conversation storage, and nothing
  persists across a reload (by design for Sprint 4; see Out of Scope).
- 12 of ~50 catalog courses have Tutor content; the rest show a friendly
  "not available yet" state on both the course page and the Tutor route.
- Retrieval is keyword-based, not semantic — a question that means the
  same thing as a lesson but shares no vocabulary with it may not be
  matched. This is an accepted tradeoff at the current content scale.
- Practice questions aren't persisted, graded, or deduplicated across
  requests.
- Small local models sometimes produce Tutor JSON that fails validation
  (observed during live smoke testing); the fallback path handles this
  correctly, but the AI-authored answer quality depends on which local
  model is configured.
- As of Sprint 5, real student progress exists (`docs/learning-progress.md`)
  but the Tutor itself still has no awareness of it — it answers from
  course/lesson content only, not "you're behind on module 2." Wiring
  progress context into the Tutor's own prompt is a reasonable Sprint 6
  candidate if it proves useful.

### Fixed in Sprint 5: notFound() returning HTTP 200

Sprint 4 found that `notFound()` on `/courses/[slug]` and
`/courses/[slug]/tutor` rendered correct not-found content but returned
HTTP 200 instead of 404, while `/categories/[slug]` correctly returned
404. Root cause: `/courses/loading.tsx` created a route-segment Suspense
boundary that Next.js also wraps around *nested* routes
(`/courses/[slug]`, `/courses/[slug]/tutor`) — the initial 200 response
starts streaming before those nested routes' `notFound()` call can set a
real status code. `/categories` had no `loading.tsx`, so it was never
affected.

Fix: removed `src/app/courses/loading.tsx` and replaced it with a
component-local `<Suspense>` boundary inside `/courses/page.tsx` itself
(`CoursesContent`, wrapped by `<Suspense fallback={<CoursesLoadingSkeleton />}>`).
A `<Suspense>` used inside one page's own JSX only affects that page's
rendering — it isn't part of the route-segment tree the way `loading.tsx`
is, so it no longer cascades into sibling dynamic routes. The catalog page
keeps its loading skeleton; `/courses/[slug]` and `/courses/[slug]/tutor`
now correctly return 404. Regression coverage:
`npm run smoke:http` (live, HTTP-level — page routing status codes aren't
observable by calling a Server Component directly, so this can't be a
plain Vitest test).

## Future RAG/vector-search considerations

Not needed yet. If the lesson library grows large enough that keyword
scoring starts missing clearly relevant content, an embedding-based
retrieval step could replace `content-retrieval.ts`'s scoring internals
without changing anything downstream (`tutor-response.ts`,
`tutor-service.ts`, the API, or the UI) — the retrieval layer's contract
(`{ lessons, outOfScope, isMetaQuestion }`) was kept intentionally
decoupled from *how* relevance is computed for exactly this reason. No
vector database is warranted at 17 lessons.
