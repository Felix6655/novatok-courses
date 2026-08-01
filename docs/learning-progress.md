# Student Learning & Progress

Sprint 5's foundation (real enrollment, real lesson completion,
deterministic resume) plus Sprint 6's learning intelligence layer: bounded
activity capture, practice questions with server-evaluated correctness,
deterministic mastery signals and review recommendations, and a Learning
Coach (V2) that explains — but never decides — what to study next or
whether a lesson needs review. See
[docs/student-identity.md](./student-identity.md) for who "the student"
is in all of this, and [docs/ai-tutor.md](./ai-tutor.md) /
[docs/ai-course-advisor.md](./ai-course-advisor.md) for the other two AI
features this reuses the same provider architecture from.

## Data model

```text
Course
  └── CourseModule
        └── Lesson
                ↑                    ↑                    ↑
                |                    |                    |
        StudentEnrollment ---- LessonProgress ---- LearningActivity
       (one per student+course)   (one per student+lesson)   (many per student)
```

- **`StudentEnrollment`** — `studentId` + `courseId` (unique together, so
  enrolling twice is a no-op), `currentLessonId` (nullable pointer to the
  lesson the student was last viewing), `enrolledAt`, `lastAccessedAt`.
- **`LessonProgress`** — `studentId` + `lessonId` (unique together, so
  completing twice is a no-op), `courseId` (denormalized from the lesson,
  same pattern as `Lesson.courseId`, so "this student's progress in this
  course" is a direct query), `startedAt`, `completedAt` (null until
  complete).

- **`LearningActivity`** (Sprint 6) — one row per learning-relevant event:
  `studentId`, `courseId`, `lessonId` (nullable — not every event is
  lesson-scoped), `type` (`LESSON_STARTED`, `LESSON_COMPLETED`,
  `TUTOR_QUESTION`, `PRACTICE_ATTEMPT`, `COACH_REQUEST`), a small
  fixed-shape `metadata` JSON column, `createdAt`. This is deliberately
  **not** a UI click log or an analytics firehose — only these five event
  types are ever written, and `metadata` never holds raw AI prompts,
  answers, or unrestricted conversation text (see
  `src/server/learning/activity.ts`'s `LearningActivityMetadata` union —
  it's a closed set of small shapes like `{ correct, questionType }`, not
  an open bag of fields).

No second `User` table — `studentId` is an opaque string today (a dev
identity cookie value) and will hold NovaTok Social's real user ID later
with no schema change. Deleting a `Course` cascades to its enrollments,
progress, and activity; deleting a `Lesson` cascades to its progress rows
and activity rows and nulls out any enrollment pointing at it as
`currentLessonId` (the student just resumes at a different lesson next
visit).

## Enrollment

`src/server/learning/enrollment.ts`. `enrollInCourse(studentId, courseSlug)`:

1. Resolves the course via the existing `getCourseBySlug` (already
   PUBLISHED-only) — a DRAFT/ARCHIVED/unknown slug throws
   `EnrollmentCourseNotFoundError` (404).
2. If an enrollment already exists, returns it unchanged — idempotent,
   and does **not** bump `lastAccessedAt` (that's `touchEnrollmentAccess`,
   a separate concern tied to actually viewing the course).
3. Otherwise creates one. A `findUnique`-then-`create` race (two
   simultaneous enroll clicks) is handled by catching the resulting
   unique-constraint violation (Prisma error `P2002`) and re-fetching the
   winning row, rather than assuming the two calls can't interleave.

Sprint 5 enrollment is free — no payment step of any kind.

## Lesson completion

`src/server/learning/progress.ts`. `markLessonComplete(studentId, courseSlug, lessonSlug)`:

1. Course must exist and be published (`EnrollmentCourseNotFoundError`).
2. Student must have an enrollment (`NotEnrolledError`, 403) — no route
   to mark progress in a course you haven't enrolled in.
3. The lesson must actually belong to that course
   (`LearningLessonNotFoundError`, 404) — the same
   `getLessonByCourseAndSlug(courseId, slug)` scoped lookup the AI Tutor
   uses for `lessonSlug` pinning, so a lesson slug borrowed from a
   different course is rejected identically.
4. Idempotent: completing an already-completed lesson leaves the original
   `completedAt` untouched (and does **not** log a second
   `LESSON_COMPLETED` activity — see below).
5. Also updates the enrollment's `lastAccessedAt`/`currentLessonId` to
   this lesson.

Every one of these checks is scoped to the caller's own `studentId` —
there is no parameter or code path that lets a request act on another
student's progress.

**`ensureLessonStarted(studentId, courseId, lessonId)`** (Sprint 6, also in
`progress.ts`) is called every time `/learn/[courseSlug]` renders a
lesson. It's idempotent and cheap to call repeatedly: the first time a
student views a given lesson it creates an unstarted `LessonProgress` row
(`completedAt: null`) and logs one `LESSON_STARTED` activity; every
subsequent view of the same lesson is a no-op. This is what makes
`LessonProgress.startedAt` mean something distinct from `completedAt` —
before Sprint 6 the two were always set together.

## Learning activity (Sprint 6)

`src/server/learning/activity.ts`, `recordLearningActivity()`. Called from
five places, each logging exactly the event type its name says and
nothing else:

| Event | Logged from | metadata |
| --- | --- | --- |
| `LESSON_STARTED` | `ensureLessonStarted` (first lesson view) | — |
| `LESSON_COMPLETED` | `markLessonComplete` (first completion) | — |
| `TUTOR_QUESTION` | `getTutorAnswer` (every question) | `{ responseMode }` |
| `PRACTICE_ATTEMPT` | `evaluatePracticeAttempt` | `{ correct, questionType }` |
| `COACH_REQUEST` | `getLearningCoachAdvice` | — |

Nothing here stores the student's actual question text, the AI's answer,
or the practice question's wording — only which lesson/course the event
happened in, when, and (for practice) whether the answer was correct. This
is intentionally the smallest data model that makes Sprint 6's learning
signals possible, not a general-purpose event log.

## Practice questions

`src/lib/validation/practice.ts`, `src/server/learning/practice.ts`,
`src/server/learning/practice-store.ts`. A learner on `/learn/[courseSlug]`
can request one practice question for the lesson they're currently
viewing:

```text
POST /api/learning/practice { courseSlug, lessonSlug }
        |
        v
Course/enrollment/lesson validation (same errors as markLessonComplete)
        |
        v
AIProvider generates a MULTIPLE_CHOICE or SHORT_ANSWER question,
grounded in that lesson's real content, including its own answer key
        |
        v
Answer key (correctChoiceIndex / modelAnswer) stored server-side only,
keyed by a random practiceId — never sent to the client
        |
        v
{ practiceId, questionType, question, choices } returned to the browser
```

```text
POST /api/learning/practice/evaluate { practiceId, studentAnswer }
        |
        v
takePendingPractice(practiceId, studentId) — one-shot, cross-student-safe
        |
        v
MULTIPLE_CHOICE: deterministic index comparison against the stored answer
key — the AI is never asked whether its own answer is correct.
SHORT_ANSWER: AIProvider judges the free-text answer against the stored
modelAnswer, returning a bounded { correct, feedback }.
        |
        v
One PRACTICE_ATTEMPT LearningActivity recorded — { correct, questionType }
        |
        v
{ correct, correctAnswer, explanation, feedback } returned to the browser
```

**The answer key is never client-trusted.** `generatePracticeQuestion`
stores the full generated question (including its answer key) in
`src/server/learning/practice-store.ts` — an in-memory, single-process,
one-shot store keyed by a random UUID, same trade-off already accepted for
`src/lib/ai-request-guard.ts` and documented there: swap for a shared
store before running more than one instance in production. The client
only ever receives the question and (for multiple choice) the visible
choice text — never `correctChoiceIndex` or `modelAnswer`. Taking an entry
deletes it immediately, so a `practiceId` can be evaluated exactly once,
regardless of whether the caller is the entry's owner (ids are unguessable
UUIDs, so this is a one-shot-replay protection, not a meaningful access
check on its own — the studentId check below is the actual access check).

**Practice results never modify `LessonProgress` or `StudentEnrollment`.**
The only durable effect of a practice attempt is one `LearningActivity`
row — completion and progress remain entirely under the deterministic
rules in `progress.ts` and `resume.ts`. This is the "AI provides learning
guidance, never authoritative progress state" rule applied concretely: a
student can get every practice question wrong and their lesson-completion
state doesn't change, and vice versa.

## Deterministic learning signals

`src/server/learning/learning-signals.ts`, `getLearningSignals(studentId,
courseId)`. A **DB-only, no-AI** summary of a student's real activity in
one course, composing `calculateCourseProgress`, `resolveResumeLesson`,
`getReviewCandidates` (below), and direct `LearningActivity` queries:

```ts
{
  completedLessons: number;
  totalLessons: number;
  recentPracticeAccuracy: number | null; // 0-1, null if no recent attempts
  recentPracticeAttempts: number;        // over the last 20 PRACTICE_ATTEMPT rows
  recentTutorQuestions: number;
  lessonsNeedingPractice: ReviewCandidate[];
  currentLesson: { slug, title } | null;
  nextLesson: { slug, title } | null;
  isCourseComplete: boolean;
}
```

This is the one function both the Learning Coach and the Tutor's bounded
context (below) are built on top of — neither re-implements progress or
practice-accuracy math independently.

## Review recommendations (deterministic, no AI)

`src/server/learning/review-recommendations.ts`, `getReviewCandidates()`.
Simple, explainable rules over real `LearningActivity` rows — no
spaced-repetition scheduling, no AI-generated "knowledge score":

- A lesson with **at least 2 practice attempts** where **fewer than half**
  were correct becomes a candidate, with a reason like *"correct on only
  33% of 3 recent practice attempts"*.
- A lesson the student asked the **Tutor about at least 3 times** becomes
  a candidate, with a reason like *"asked the Tutor about this lesson 3
  times"*.
- Both reasons can apply to the same lesson at once.
- Capped at 5 candidates.

The Learning Coach may explain *why* a lesson was flagged; it never
decides *whether* one is flagged.

## Resume algorithm (deterministic, no AI)

`src/server/learning/resume.ts`, `resolveResumeLesson`:

1. If the enrollment's `currentLessonId` (the last lesson the student was
   viewing) is still incomplete, resume exactly there.
2. Otherwise, resume at the first incomplete lesson in course order.
3. If every lesson is complete, report `isCourseComplete: true` instead of
   picking an arbitrary lesson.

This is pure database logic — PostgreSQL decides the answer, and the
Learning Coach (below) reuses this exact function rather than
re-implementing "what's next" with its own logic.

## Progress calculation

`src/server/learning/progress.ts`, `calculateCourseProgress`: real
`SELECT count(*)` against `Lesson` and `LessonProgress` — never a
client-provided percentage. `completedLessons / totalLessons`, rounded;
`0%` for a course with zero lessons rather than dividing by zero.

## Learning routes

- **`/learn`** — dashboard: enrolled courses split into "in progress" /
  "completed", each with a real progress bar, a "Continue learning" link
  into `/learn/[courseSlug]`, and (Sprint 6) an amber "N lessons may be
  worth reviewing" note when `getReviewCandidates` found any for that
  course. Also shows a **Recent activity** feed (Sprint 6, up to 8 items,
  `getRecentActivity`) — a human-readable rendering of the student's own
  `LearningActivity` rows across all their courses.
- **`/learn/[courseSlug]`** — the learning experience. Which lesson shows
  is controlled by an optional `?lessonSlug=` query param (same pattern as
  the Tutor's lesson pinning): omit it to get the deterministic resume
  lesson, or pass it to jump to a specific lesson (validated against the
  course, `404` if it doesn't belong). Shows the syllabus with completed
  lessons checked off, the current lesson's full content, a progress bar,
  prev/next navigation, a "Mark lesson complete" action, an "Ask AI Tutor
  about this lesson" link, a **Practice this lesson** panel (Sprint 6),
  and the Learning Coach panel. If the student isn't enrolled yet, shows a
  free "Enroll" call to action instead.
- The course detail page (`/courses/[slug]`) gained a **"Start learning"**
  link next to the existing enroll/Tutor entry points, shown only for
  courses with Tutor-ready content.

## AI Learning Coach (V2)

`src/server/learning/learning-coach.ts`, reusing the exact same
`AIProvider` interface and Ollama adapter as the Course Advisor and Tutor
— no second AI architecture.

```text
studentId + courseSlug
        |
        v
Enrollment check (PostgreSQL) -----------> not enrolled? 403, no AI call
        |
        v
COACH_REQUEST activity recorded
        |
        v
getLearningSignals() (PostgreSQL, deterministic — resume + progress + review candidates)
        |
        v
Real next-lesson content + completed-lesson titles + recent practice
accuracy + review-candidate titles/reasons + syllabus
        |
        v
AIProvider.generateCompletion()  (Ollama)
        |
        v
Zod-validated { explanation, studyTips, practiceSuggestion }
        |
        v
{ nextLesson, explanation, studyTips, practiceSuggestion, suggestedCourses,
  reviewCandidates, signals, isCourseComplete }
```

### Grounding — the database decides WHAT, the AI explains WHY/HOW

This is stricter than the Tutor's grounding, not just equivalent to it:
**the model's response schema has no lesson or course identifier field at
all** (`learningCoachModelResponseSchema` = `{ explanation, studyTips,
practiceSuggestion }`, all free text — see
`src/lib/validation/learning-coach.test.ts`'s "schema has none to
hallucinate" test). `nextLesson` in the API response comes entirely from
`getLearningSignals()` → `resolveResumeLesson()`, called *before* the AI
is ever invoked; the model is never asked to name a lesson and
structurally cannot hallucinate one into the response, because there's no
field for it to occupy.

The same applies to `suggestedCourses` (from `getRelatedCourses()`) and
`reviewCandidates` (from `getReviewCandidates()`, Sprint 6): both are
computed entirely in PostgreSQL/TypeScript and only *echoed* into the
response — the AI may reference them in `explanation`/`practiceSuggestion`
prose, but cannot add to, remove from, or reorder either list. The system
prompt says this explicitly: *"you did not determine that list and must
not add to it, remove from it, or invent a different one."*

If the model's JSON is missing, unparseable, or fails validation, the
Coach falls back to a deterministic templated explanation (`"Next up:
'{lesson}' in {module}. This continues your progress in {course}."` or a
congratulatory message if complete, with `practiceSuggestion: null`)
rather than failing the request — same resilience pattern as the Advisor
and Tutor.

### Optional recent Tutor context

`recentTutorHistory` (same shape and bound — `MAX_HISTORY_TURNS`, 1000
chars/turn — as the Tutor's `history`) can optionally be passed from the
active page session so the Coach's explanation can reference what the
student was just asking the Tutor about. Framed in the system prompt as
context only, never as a source of course facts, same as the Tutor.

## AI Tutor: bounded learning-state context (Sprint 6)

`src/server/tutor/tutor-service.ts` now accepts an optional `studentId`.
When present, two things happen in addition to the Sprint 3/4/5 behavior
(which is otherwise unchanged — the Tutor still works for a student who
isn't enrolled):

1. **Activity**: one `TUTOR_QUESTION` LearningActivity is recorded per
   question, with `metadata: { responseMode }` — never the question text.
2. **Context** (only if the student is enrolled in the course): a small,
   bounded summary from `getLearningSignals()` is added to the prompt —
   completed/total lesson counts, recent practice accuracy, and up to 2
   review-candidate lesson titles. This is what lets the Tutor answer
   things like *"am I ready for the next lesson?"* or *"I'm still
   confused"* sensibly, without giving it the student's full activity
   history. The system prompt frames this explicitly as *"guidance, never
   an authoritative record — the platform's own progress tracking...is
   what actually determines completion and what comes next."*

## API

- **`POST /api/learning/enroll`** — `{ courseSlug }` → `{ enrollment }`.
  `400` invalid body, `404` unknown/unpublished course, `429` rate
  limited (see below).
- **`POST /api/learning/progress`** — `{ courseSlug, lessonSlug }` →
  `{ progress, courseProgress }`. `400` invalid body, `403` not enrolled,
  `404` unknown course or lesson-not-in-course, `429` rate limited.
- **`POST /api/learning/practice`** (Sprint 6) — `{ courseSlug,
  lessonSlug }` → `{ practiceId, questionType, question, choices }`
  (never the answer key). `403` not enrolled, `404` unknown course/lesson,
  `502` unusable AI output, `503` AI provider unavailable.
- **`POST /api/learning/practice/evaluate`** (Sprint 6) — `{ practiceId,
  studentAnswer }` → `{ correct, correctAnswer, explanation, feedback }`.
  `404` unknown/expired/already-consumed `practiceId`, `502`/`503` for
  SHORT_ANSWER AI evaluation failures.
- **`POST /api/ai/learning-coach`** — `{ courseSlug, recentTutorHistory?
  }` → `LearningCoachResult`. `403` not enrolled, `404` unknown course,
  `503` AI provider unavailable/misconfigured.

None of these read `studentId` from the request body — always from
`getStudentIdentity()`. See
[docs/student-identity.md](./student-identity.md).

### Request protection (Sprint 6)

- `POST /api/ai/*` and `POST /api/learning/practice*` go through
  `src/lib/ai-request-guard.ts` (body size cap, 10 req/min per client,
  concurrency cap of 2 in-flight calls) — unchanged from Sprint 4/5,
  applied to the two new practice endpoints too since both can call the
  AI provider.
- `POST /api/learning/enroll` and `POST /api/learning/progress` (Sprint 6)
  go through a new, separate, lighter-weight
  `src/lib/learning-mutation-guard.ts`: a 30 req/min per-client rate limit
  and a 5KB body cap, but **no concurrency cap** — these are fast DB
  writes, not calls into a single local Ollama instance that needs
  protecting from request pile-ups, so applying the AI guard's stricter
  limits here would be disproportionate. Same in-memory,
  single-process trade-off as the AI guard, documented in the same place:
  swap for a shared store before running more than one instance in
  production.

## Real database smoke procedure

Same pattern as the catalog/Advisor/Tutor smoke scripts — live-only,
never part of `npx vitest run`:

```bash
npm run db:smoke        # catalog + content (existing)
npm run smoke:advisor   # Course Advisor E2E (existing)
npm run smoke:tutor     # AI Tutor E2E (existing)
npm run smoke:coach     # enroll -> tutor -> complete -> practice -> resume -> Learning Coach E2E
npm run smoke:http      # HTTP-level route/status checks, incl. the 404 regression check
```

`smoke:coach` (extended in Sprint 6) walks the full loop end to end
against a real database and a real local Ollama: enroll in a Tutor-ready
course, ask the Tutor a lesson-pinned question, complete a lesson,
generate and answer a practice question, verify progress recalculates,
verify resume points at the next lesson, then ask the Learning Coach and
verify its `nextLesson` matches the real DB-determined lesson exactly and
every lesson/course it references is real.
