# AI Tutor

Sprint 3 adds the first version of the NovaTok AI Tutor: a student opens a
course, asks questions about its material, and gets explanations, simpler
rephrasings, examples, and practice questions — grounded in that course's
real content, not open-ended chat.

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

5 published courses across 5 different categories/levels received real
module and lesson content (10 modules, 17 lessons total): `javascript-fundamentals`,
`cybersecurity-fundamentals`, `python-for-data-science`,
`digital-marketing-fundamentals`, `project-management-fundamentals`. The
other ~45 catalog courses intentionally have no Tutor content yet — the
Tutor UI and API both handle that gracefully (see **Errors** below) rather
than assuming every course has lessons.

## Retrieval strategy

No vector database, no embeddings, no external search service —
deliberately, given the current content scale (17 lessons). Retrieval
(`src/server/tutor/content-retrieval.ts`) is deterministic and keyword-based:

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
before being returned; nothing is persisted — there's no quiz bank or
grading system in Sprint 3, this is generated fresh per request.

## Tutor API

### `POST /api/ai/tutor`

Request:

```json
{
  "courseSlug": "javascript-fundamentals",
  "question": "Explain variables in simpler terms.",
  "responseMode": "SIMPLE"
}
```

`responseMode` is one of `NORMAL` (default) | `SIMPLE` | `EXAMPLE` |
`PRACTICE`. `lessonSlug` is accepted but currently informational only —
retrieval scores across the whole course rather than pinning to one lesson.

Success response (`200`):

```json
{
  "courseSlug": "javascript-fundamentals",
  "courseTitle": "JavaScript Fundamentals",
  "question": "Explain variables in simpler terms.",
  "responseMode": "SIMPLE",
  "answer": "Think of a variable as a labeled box...",
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
| `400`  | Malformed JSON body, or invalid `courseSlug`/`question`/`responseMode`   |
| `404`  | No PUBLISHED course matches `courseSlug`                                 |
| `422`  | The course exists but has no Tutor-ready lesson content yet              |
| `502`  | The AI provider responded, but its output couldn't be parsed/validated (intent-equivalent step; practice/answer generation itself degrades gracefully instead — see Grounding above) |
| `503`  | The AI provider is unreachable or misconfigured                          |
| `500`  | Unexpected server error (no internal details included)                   |

## UI

- `/courses/[slug]/tutor` — course-scoped Tutor page: a syllabus summary
  (reusing `CourseSyllabus`), a question box, and quick-action buttons
  (*Explain simpler*, *Give example*, *Practice me*, *What next?*) that set
  `responseMode` and a starter question. Answers render via `TutorAnswer`
  (`src/components/tutor/`), which shows the answer text, any practice
  question (with an expandable answer), and the lesson titles the answer
  was grounded in.
- The course detail page (`/courses/[slug]`) gets an **"Ask AI Tutor"**
  entry point plus a compact syllabus section — but only for the 5 courses
  that currently have content, so there's never a link into an empty
  Tutor experience.

Like the Course Advisor, this is a single-shot form, not a persistent chat
— there is no conversation memory across requests in Sprint 3.

## Ollama configuration

No new environment variables — the Tutor reuses `AI_PROVIDER`,
`OLLAMA_BASE_URL`, and `OLLAMA_MODEL` from Sprint 2
(see [docs/ai-course-advisor.md](./ai-course-advisor.md)). If Ollama isn't
running, `/api/ai/tutor` returns `503`, the same as the Course Advisor.

## Limitations (Sprint 3)

- No conversation memory — quick actions like "Explain simpler" work by
  setting a starter question, not by referencing a prior answer.
- Only 5 of ~50 catalog courses have Tutor content; the rest show a
  friendly "not available yet" state on both the course page and the
  Tutor route.
- Retrieval is keyword-based, not semantic — a question that means the
  same thing as a lesson but shares no vocabulary with it may not be
  matched. This is an accepted tradeoff at the current content scale.
- Practice questions aren't persisted, graded, or deduplicated across
  requests.
- No student accounts, so there's no per-student history or personalized
  "what's next" beyond the course's own structure.

## Future RAG/vector-search considerations

Not needed yet. If the lesson library grows large enough that keyword
scoring starts missing clearly relevant content, an embedding-based
retrieval step could replace `content-retrieval.ts`'s scoring internals
without changing anything downstream (`tutor-response.ts`,
`tutor-service.ts`, the API, or the UI) — the retrieval layer's contract
(`{ lessons, outOfScope, isMetaQuestion }`) was kept intentionally
decoupled from *how* relevance is computed for exactly this reason. No
vector database is warranted at 17 lessons.
