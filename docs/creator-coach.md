# Creator Coach

Creator Coach turns a free-text description of a creator's business,
platforms, audience, and goals into a real, grounded, week-by-week
learning plan built from the Creator Academy catalog (see
[docs/creator-academy.md](./creator-academy.md)). It reuses the exact
same architecture, provider abstraction, and grounding discipline as the
[Course Advisor](./ai-course-advisor.md) — this is deliberately not a
second AI architecture.

## Example

Input:

> "I sell clothing online. I have 700 Instagram followers and 300 TikTok
> followers. My videos average 400 views. I want to make $2,000/month."

Output: a structured profile (business summary, platforms, experience
level, goal, focus areas) plus a week-by-week plan, each week pointing at
a real course from the catalog — e.g. Week 1: niche/positioning →
`social-media-foundations-for-creators`; Week 4: conversion → `creator-sales-and-conversion`.
The plan never promises a specific income or follower outcome — only
skills and concrete next steps (enforced in the system prompt, not just
requested).

## Architecture

```text
Creator
   |
   v
Creator Coach UI  (/courses/creator-coach)
   |
   v
Creator Coach API  (POST /api/ai/creator-coach)
   |
   v
Profile Extraction  (src/server/creator-coach/extract-profile.ts)
   |
   +-------------------+
   |                    |
   v                    v
Creator Academy Catalog   AI Provider Interface  (src/ai/provider.ts)
(PostgreSQL, via                |
 academy-retrieval.ts)          v
   |                        Ollama Adapter  (src/ai/providers/ollama.ts)
   |                            |
   +-------------+--------------+
                 |
                 v
      Grounded Weekly Plan  (src/server/creator-coach/plan-generation.ts)
                 |
                 v
      Validated Structured Response  (Zod)
```

This is line-for-line the Course Advisor's pipeline
(`message -> extract-intent -> catalog-retrieval -> recommendation`) with
each stage renamed for creator-business context:
`extract-profile` (structured `CreatorProfile` instead of `LearningIntent`),
`academy-retrieval` (same scoring/candidate-pool pattern, biased toward
the `creator-economy` category without being restricted to it), and
`plan-generation` (a week-by-week plan instead of a flat ordered list).

## Grounding

Same discipline as every other AI feature in this codebase:

- PostgreSQL (via `getCandidateCourses`) is the only source of truth for
  which courses exist. The model chooses, orders, and explains only
  among the real candidates it's given — it never sees the full catalog
  and can't invent a slug outside that list.
- Any `courseSlug` the model returns that isn't in the candidate set is
  silently dropped, not shown — the same hallucination protection
  `src/server/advisor/recommendation.ts` uses.
- If the model's JSON is missing, unparseable, or fails schema
  validation, the plan falls back to presenting the real, retrieval-ranked
  candidates directly as a sequenced plan (`generatedBy: "fallback-sequence"`)
  instead of failing the request.
- The system prompt explicitly forbids promising a specific income,
  follower, or view outcome — plans describe skills and actions, never
  guarantees.

## API

### `POST /api/ai/creator-coach`

Request:

```json
{
  "message": "I sell clothing online. I have 700 Instagram followers and 300 TikTok followers. My videos average 400 views. I want to make $2,000/month.",
  "locale": "en"
}
```

Success response (`200`):

```json
{
  "profile": {
    "businessSummary": "Sells clothing online",
    "platforms": ["Instagram", "TikTok"],
    "experienceLevel": "BEGINNER",
    "primaryGoal": "Reach $2,000/month in sales",
    "focusAreas": ["audience growth", "social commerce"],
    "constraints": ["700 Instagram followers", "300 TikTok followers", "400 average views"]
  },
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "Niche and positioning",
      "summary": "Nail down who you're selling to before optimizing anything else.",
      "course": { "slug": "social-media-foundations-for-creators", "title": "Social Media Foundations for Creators", "...": "..." }
    }
  ],
  "overallSummary": "Start with foundations, then move into audience growth and conversion.",
  "generatedBy": "ai"
}
```

Error responses match the Course Advisor's exactly: `400` invalid
request, `503` provider unavailable/misconfigured, `502` model output
unusable at the profile-extraction step (extraction has no safe
fallback — a garbled profile can't be used for retrieval), `500`
unexpected error (logged server-side, never leaked to the client — see
the production-readiness audit's P1-1 fix, reused here unchanged).

Goes through `src/lib/ai-request-guard.ts` like every other `/api/ai/*`
route (body size, rate limit, concurrency cap) — no new guard was added.

## Identity: deliberately stateless, like the Course Advisor

Creator Coach does not require student identity, enrollment, or
progress — matching the worked example, which describes a prospective
user who hasn't necessarily used the platform yet. It reuses no
`src/server/learning/*` code and writes no `LearningActivity` row. This
is a deliberate scope boundary for this phase, not an oversight — see
below for how a future iteration could add real progress awareness.

## Future NovaTok Social integration

**Not implemented.** The pipeline is shaped so this slots in later
without changing its architecture:

- Today, `CreatorProfile.focusAreas`/`platforms`/`experienceLevel` come
  entirely from what the creator types (self-reported).
- Once NovaTok Social can supply real creator signals (posts, videos,
  views, engagement, follower growth, content categories, commerce
  activity), those signals would feed into `academy-retrieval.ts`'s
  candidate scoring and into the `plan-generation.ts` prompt as
  additional grounded context — the same way
  `src/server/learning/learning-signals.ts` already feeds real
  `LessonProgress`/`LearningActivity` data into the existing Learning
  Coach's prompt, never letting the model itself decide what the signals
  mean.
- Concretely, this is what would eventually let Creator Coach say things
  like "your videos receive views but very few profile visits — take
  this CTA/conversion lesson" or "most viewers leave in the first few
  seconds — work through the Hooks & Retention module" grounded in real
  analytics instead of self-reported numbers.
- This requires an actual NovaTok Social data contract to exist first
  (see CLAUDE.md's "NovaTok Courses is a standalone... repo" boundary) —
  explicitly out of scope for this phase.
