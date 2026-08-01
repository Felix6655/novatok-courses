# Student Learning & Progress

Sprint 5's foundation for a future AI Learning Coach: real enrollment,
real lesson completion, deterministic resume, and a Learning Coach that
explains — but never decides — what to study next. See
[docs/student-identity.md](./student-identity.md) for who "the student"
is in all of this, and [docs/ai-tutor.md](./ai-tutor.md) /
[docs/ai-course-advisor.md](./ai-course-advisor.md) for the other two AI
features this reuses the same provider architecture from.

## Data model

```text
Course
  └── CourseModule
        └── Lesson
                ↑                    ↑
                |                    |
        StudentEnrollment ---- LessonProgress
       (one per student+course)   (one per student+lesson)
```

- **`StudentEnrollment`** — `studentId` + `courseId` (unique together, so
  enrolling twice is a no-op), `currentLessonId` (nullable pointer to the
  lesson the student was last viewing), `enrolledAt`, `lastAccessedAt`.
- **`LessonProgress`** — `studentId` + `lessonId` (unique together, so
  completing twice is a no-op), `courseId` (denormalized from the lesson,
  same pattern as `Lesson.courseId`, so "this student's progress in this
  course" is a direct query), `startedAt`, `completedAt` (null until
  complete).

No second `User` table — `studentId` is an opaque string today (a dev
identity cookie value) and will hold NovaTok Social's real user ID later
with no schema change. Deleting a `Course` cascades to its enrollments and
progress; deleting a `Lesson` cascades to its progress rows and nulls out
any enrollment pointing at it as `currentLessonId` (the student just
resumes at a different lesson next visit).

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
   `completedAt` untouched.
5. Also updates the enrollment's `lastAccessedAt`/`currentLessonId` to
   this lesson.

Every one of these checks is scoped to the caller's own `studentId` —
there is no parameter or code path that lets a request act on another
student's progress.

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
  "completed", each with a real progress bar and a "Continue learning"
  link into `/learn/[courseSlug]`.
- **`/learn/[courseSlug]`** — the learning experience. Which lesson shows
  is controlled by an optional `?lessonSlug=` query param (same pattern as
  the Tutor's lesson pinning): omit it to get the deterministic resume
  lesson, or pass it to jump to a specific lesson (validated against the
  course, `404` if it doesn't belong). Shows the syllabus with completed
  lessons checked off, the current lesson's full content, a progress bar,
  prev/next navigation, a "Mark lesson complete" action, an "Ask AI Tutor
  about this lesson" link, and the Learning Coach panel. If the student
  isn't enrolled yet, shows a free "Enroll" call to action instead.
- The course detail page (`/courses/[slug]`) gained a **"Start learning"**
  link next to the existing enroll/Tutor entry points, shown only for
  courses with Tutor-ready content.

## AI Learning Coach

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
resolveResumeLesson() (PostgreSQL, deterministic — same function /learn uses)
        |
        v
Real lesson content + completed-lesson titles + syllabus
        |
        v
AIProvider.generateCompletion()  (Ollama)
        |
        v
Zod-validated { explanation, studyTips }
        |
        v
{ nextLesson, explanation, studyTips, suggestedCourses, isCourseComplete }
```

### Grounding — the database decides WHAT, the AI explains WHY/HOW

This is stricter than the Tutor's grounding, not just equivalent to it:
**the model's response schema has no lesson or course identifier field at
all** (`learningCoachModelResponseSchema` = `{ explanation, studyTips }`
only — see `src/lib/validation/learning-coach.test.ts`'s "schema has none
to hallucinate" test). `nextLesson` in the API response comes entirely
from `resolveResumeLesson()`, called *before* the AI is ever invoked; the
model is never asked to name a lesson and structurally cannot hallucinate
one into the response, because there's no field for it to occupy.

The same applies to `suggestedCourses`: populated only once the course is
complete, sourced directly from the existing `getRelatedCourses()` catalog
function — never from the AI.

If the model's JSON is missing, unparseable, or fails validation, the
Coach falls back to a deterministic templated explanation (`"Next up:
'{lesson}' in {module}. This continues your progress in {course}."` or a
congratulatory message if complete) rather than failing the request —
same resilience pattern as the Advisor and Tutor.

### Optional recent Tutor context

`recentTutorHistory` (same shape and bound — `MAX_HISTORY_TURNS`, 1000
chars/turn — as the Tutor's `history`) can optionally be passed from the
active page session so the Coach's explanation can reference what the
student was just asking the Tutor about. Framed in the system prompt as
context only, never as a source of course facts, same as the Tutor.

## API

- **`POST /api/learning/enroll`** — `{ courseSlug }` → `{ enrollment }`.
  `400` invalid body, `404` unknown/unpublished course.
- **`POST /api/learning/progress`** — `{ courseSlug, lessonSlug }` →
  `{ progress, courseProgress }`. `400` invalid body, `403` not enrolled,
  `404` unknown course or lesson-not-in-course.
- **`POST /api/ai/learning-coach`** — `{ courseSlug, recentTutorHistory?
  }` → `LearningCoachResult`. Goes through the same
  `src/lib/ai-request-guard.ts` as the Advisor/Tutor (body size, rate
  limit, concurrency cap). `403` not enrolled, `404` unknown course,
  `503` AI provider unavailable/misconfigured.

None of these three read `studentId` from the request body — always from
`getStudentIdentity()`. See
[docs/student-identity.md](./student-identity.md).

## Real database smoke procedure

Same pattern as the catalog/Advisor/Tutor smoke scripts — live-only,
never part of `npx vitest run`:

```bash
npm run db:smoke        # catalog + content (existing)
npm run smoke:advisor   # Course Advisor E2E (existing)
npm run smoke:tutor     # AI Tutor E2E (existing)
npm run smoke:coach     # enrollment -> progress -> resume -> Learning Coach E2E (new)
npm run smoke:http      # HTTP-level route/status checks, incl. the 404 regression check
```

`smoke:coach` walks the full loop end to end against a real database and
a real local Ollama: enroll in a Tutor-ready course, complete a lesson,
verify progress recalculates, verify resume points at the next lesson,
then ask the Learning Coach and verify its `nextLesson` matches the real
DB-determined lesson exactly.
