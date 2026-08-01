# AI Course Advisor

Sprint 2 adds the first version of the NovaTok AI Course Advisor: a student
describes a learning goal in natural language and gets back real courses
from the NovaTok Courses catalog, ranked and explained.

## Architecture

```text
User
  |
  v
Course Advisor API  (POST /api/ai/course-advisor)
  |
  v
Learning Intent Parser  (src/server/advisor/extract-intent.ts)
  |
  +-------------------+
  |                   |
  v                   v
Course Catalog      AI Provider Interface  (src/ai/provider.ts)
(PostgreSQL)               |
  |                        v
  |                    Ollama Adapter  (src/ai/providers/ollama.ts)
  |                        |
  +----------+-------------+
             |
             v
   Grounded Recommendation  (src/server/advisor/recommendation.ts)
             |
             v
   Validated Structured Response  (Zod)
             |
             v
   Course Advisor UI  (/courses/advisor)
```

PostgreSQL is the source of truth for which courses exist. The LLM never
invents a course — it only reasons about and orders courses that a real
Prisma query already returned (see **Grounding** below).

## AI provider interface

`src/ai/provider.ts` defines the only contract the rest of the app depends
on:

```ts
interface AIProvider {
  readonly name: string;
  generateCompletion(request: { messages: ChatMessage[]; temperature?: number }): Promise<string>;
}
```

Intent extraction and recommendation reasoning (`src/server/advisor/`) call
`provider.generateCompletion(...)` and nothing else — no Ollama-specific or
cloud-SDK types leak into that code. `src/ai/get-ai-provider.ts` is the
single place that reads `AI_PROVIDER` and returns a concrete adapter behind
that interface.

Only an Ollama adapter is implemented in Sprint 2
(`src/ai/providers/ollama.ts`). Adding OpenAI-compatible or Anthropic
adapters later means adding a new file in `src/ai/providers/` and a new
`case` in `get-ai-provider.ts` — no changes to the advisor logic itself.

## Ollama configuration

| Variable          | Default                   | Purpose                                   |
| ------------------ | -------------------------- | ------------------------------------------ |
| `AI_PROVIDER`      | `ollama`                   | Selects the provider adapter.             |
| `OLLAMA_BASE_URL`  | `http://localhost:11434`   | Base URL of a running Ollama instance.    |
| `OLLAMA_MODEL`     | *(required, no default)*   | Model name to request, e.g. `llama3.2`.   |

No API key is needed for Ollama — nothing here is a secret.

### Running Ollama locally

1. Install Ollama: https://ollama.com/download
2. Pull a model that can follow JSON-formatting instructions reasonably
   well, e.g.:
   ```bash
   ollama pull llama3.2
   ```
   This repo does not require any specific model — set `OLLAMA_MODEL` to
   whatever you've pulled. Smaller/older models may produce JSON that fails
   validation more often; see **Degraded behavior** below for what happens
   when that occurs.
3. Ollama listens on `http://localhost:11434` by default — that matches
   `OLLAMA_BASE_URL`'s default, so no extra config is needed for local dev.
4. Set `.env`:
   ```env
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```

If Ollama isn't running, `POST /api/ai/course-advisor` returns `503` with a
clear message — the app does not crash, and it does not fall back to a
paid cloud API.

## How grounding works

1. **Intent extraction** — the user's message plus a system prompt asking
   for a specific JSON shape go to the AI provider. The raw string comes
   back and is parsed as JSON (with one repair attempt for prose-wrapped
   JSON), then validated against `learningIntentSchema` (Zod). If parsing
   or validation fails, the request fails with `502` — there's no safe way
   to guess what the student meant, so this step never silently degrades.
2. **Catalog retrieval** (`src/server/advisor/catalog-retrieval.ts`) — a
   real Prisma query (`status: "PUBLISHED"`, keyword `OR` across title,
   descriptions, and category name for each extracted topic) pulls a pool
   of real courses. A pure, unit-tested scoring function ranks them by
   keyword-match weight, level match, and featured status, and the top N
   (default 8) become the **candidate set**.
3. **Recommendation reasoning** (`src/server/advisor/recommendation.ts`) —
   the candidate set (with real slugs) is sent to the AI provider, which is
   instructed to choose, order, and explain courses **from that list
   only**. The response is parsed and validated (Zod), and then every
   returned slug is checked against the candidate set's actual slugs.
   Anything not present is dropped — this is the hallucination guard, and
   it is unconditional: there is no code path that displays a course the
   catalog query didn't return.
4. **Degraded behavior** — if the reasoning step's output is missing,
   unparseable, fails validation, or every recommended slug turns out to be
   hallucinated, the advisor falls back to presenting the ranked candidate
   list directly (`generatedBy: "fallback-ranking"` in the response) with a
   generic reason per course, instead of failing the request. The courses
   shown are always real either way; only the AI-authored explanation is
   what's missing in the fallback case.

## API

### `POST /api/ai/course-advisor`

Request:

```json
{ "message": "I have never coded before and want to learn Python so I can build AI tools." }
```

Success response (`200`):

```json
{
  "interpretedGoal": "Learn Python for building AI tools",
  "intent": {
    "goal": "Learn Python for building AI tools",
    "currentSkillLevel": "BEGINNER",
    "topics": ["Python", "AI"],
    "availableHoursPerWeek": null,
    "budgetPreference": "ANY",
    "constraints": ["no coding experience"]
  },
  "recommendations": [
    {
      "course": { "slug": "javascript-fundamentals", "title": "...", "...": "..." },
      "reason": "A beginner-friendly starting point before moving into Python-specific tooling.",
      "order": 1
    }
  ],
  "pathSummary": "Start with programming fundamentals, then move into Python for data/AI work.",
  "generatedBy": "ai"
}
```

Error responses:

| Status | Meaning                                                              |
| ------ | --------------------------------------------------------------------- |
| `400`  | Malformed JSON body, or `message` missing/empty/too long             |
| `502`  | The AI provider responded, but its output couldn't be parsed/validated for intent extraction |
| `503`  | The AI provider is unreachable or misconfigured (e.g. Ollama not running, `OLLAMA_MODEL` unset) |
| `500`  | Unexpected server error (no internal details are included in the response) |

## UI

`/courses/advisor` (`src/app/courses/advisor/page.tsx`) is a simple form —
a textarea, a submit button, and a few example-prompt chips — backed by
`src/components/advisor/CourseAdvisorForm.tsx` (client component). Results
render via `src/components/advisor/CourseAdvisorResults.tsx`, which reuses
the existing `CourseCard` and `EmptyState` components from the Sprint 1
catalog UI rather than introducing new card styling. This is a single-shot
advisor form, not a chat interface — there is no conversation history or
follow-up turn in Sprint 2.

## Limitations (Sprint 2)

- No conversation memory — each request is independent; the advisor
  doesn't remember prior messages.
- No student accounts, so there's no personalization beyond what's in the
  message itself.
- Catalog retrieval is keyword-based (title/description/category
  substring match against extracted topics), not a vector/embedding
  search. This is intentional — the current catalog is 50 courses, small
  enough that a vector database would be premature.
- Intent extraction accuracy depends on the configured model. Smaller
  local models may produce less reliable topic extraction than a larger
  one; there's no accuracy benchmark in this sprint.
- The advisor answers questions about which courses to take; it does not
  tutor, answer arbitrary course-content questions, or generate quizzes —
  those are explicitly out of scope for Sprint 2.

## Future provider adapters

The interface in `src/ai/provider.ts` is intentionally minimal so adding a
provider is additive:

- **OpenAI-compatible HTTP APIs** (including many self-hosted runtimes) —
  a `src/ai/providers/openai-compatible.ts` adapter would look very similar
  to the Ollama one (`fetch` + JSON body), added when there's a concrete
  reason to prefer a hosted model.
- **Anthropic** — same pattern, added behind `AI_PROVIDER=anthropic` when
  needed.

No cloud provider is wired up in Sprint 2, and none is required to run the
advisor locally.
