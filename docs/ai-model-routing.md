# AI Model Routing (Sprint 11)

Sprint 10 shipped the i18n architecture and found a separate problem: local
model quality for non-English AI output was inconsistent (`llama3:latest`
often answered in English for `es`/`pt`/`fr`, and was inconsistent for
`de`). Sprint 11 adds configurable, task/locale-aware model routing behind
the existing `AIProvider` interface so a better-fit model can be selected
per locale without any business service depending on a concrete provider.

## Architecture

```text
Advisor / Tutor / Coach / Practice
              |
              v
     getAIProvider(env, { task, locale })
              |
              v
       getRoutedAIProvider   (src/ai/model-routing.ts)
              |
   reads AI_MODEL_ROUTES_JSON, resolves task.locale -> locale -> task -> default -> legacy
              |
              v
        RoutedAIProvider
        (primary, then at most one fallback)
         /              \
  OllamaProvider    OpenAICompatibleProvider
  (src/ai/providers/ollama.ts)   (src/ai/providers/openai-compatible.ts, OmniRoute-shaped)
```

Business services (`src/server/advisor`, `src/server/tutor`,
`src/server/learning/learning-coach.ts`, `src/server/learning/practice.ts`)
call `getAIProvider(process.env, { task, locale })` exactly as they called
the old single-provider `getAIProvider(process.env)` — the routing layer is
an internal extension of the same function, not a second AI architecture.
`deps.provider` injection for tests is unchanged.

## Route configuration

`AI_MODEL_ROUTES_JSON` (env, no credentials — just `provider:model` specs):

```json
{
  "default": "ollama:llama3:latest",
  "routes": {
    "es": "ollama:qwen3.6:latest",
    "pt": "ollama:qwen3.6:latest",
    "fr": "ollama:qwen3.6:latest",
    "de": "ollama:qwen3.6:latest"
  },
  "fallbacks": ["ollama:llama3:latest"]
}
```

Route lookup precedence (`selectModelRoute` in `src/ai/model-routing.ts`):
`task.locale` (e.g. `"advisor.es"`) > `locale` > `task` > `default` >
the legacy `AI_PROVIDER`/`OLLAMA_MODEL` pair. At most one fallback spec is
ever attempted (`fallbacks` is capped at 3 entries in the config schema, but
`selectModelRoute` only ever takes the first one that isn't already the
primary) — there is no retry loop.

`OLLAMA_TIMEOUT_MS` (env, optional) overrides the default 30s Ollama
request timeout. It exists because `qwen3.6:latest` is a ~24GB model: when
it isn't already loaded in memory (e.g. right after switching away from
`llama3`), Ollama's cold load alone measured 60-90s in testing on this
machine. 30s was long enough to make every routed call to it fail with a
misleading "could not reach Ollama" error even though the server was up.
Production config uses `100000` (100s).

Both are read fresh per request via `env` (defaults to `process.env`), so
routing can be changed without a code change or rebuild — just restart the
process (or the dev server) after editing `.env`.

## Providers

- `src/ai/providers/ollama.ts` — talks to Ollama's native `/api/chat`.
  Sprint 11 additions: `maxTokens` maps to `options.num_predict`; latency is
  recorded in `lastRequestMetadata`; **`think: false` is always sent**.
  Reasoning-capable models (`qwen3.6`, `gpt-oss`) otherwise spend their
  entire token budget on hidden "thinking" content and can return an empty
  `message.content`, or, with no token cap, take minutes before answering
  at all (see Findings below). Non-reasoning models (`llama3`) ignore the
  field.
- `src/ai/providers/openai-compatible.ts` — new. A generic OpenAI
  `/chat/completions`-shaped adapter, used for OmniRoute. Records
  `inputTokens`/`outputTokens`/`estimatedCost` from the response `usage`
  object when the endpoint provides it. Never logs the API key or upstream
  response bodies in errors (see `openai-compatible.test.ts`).
- `src/ai/model-routing.ts` — `createProviderForSpec` builds a concrete
  provider from a `"provider:model"` spec; `RoutedAIProvider` tries the
  primary, and on an `AIProviderUnavailableError` or an obvious
  language-adherence failure (see below) with a fallback still available,
  makes exactly one more attempt.

## Language-adherence signal

`detectLanguageAdherence(text, locale)` is a conservative regression
detector, not a linguistic authority: it flattens JSON string values,
counts hits against small per-locale function-word lists, and returns
`"pass"` if there's real target-language evidence, `"fail"` only if there's
a lot of English and zero target-language evidence, and `"unknown"`
otherwise (e.g. short answers dominated by code identifiers). `"fail"`
triggers the one bounded fallback attempt when a fallback provider exists;
if there is no fallback, or the fallback also fails, the response is still
returned with `languageAdherence: "fail"` recorded in metadata — it is
never silently reported as a pass.

**Architectural limit:** this signal only inspects the raw completion
text returned by the provider. It cannot see downstream Zod schema
validation done by the calling business service (e.g. `practice.ts`
rejecting an over-long `explanation`). A model that writes fluent,
correctly-grounded target-language JSON that happens to violate a length
constraint will surface as an `InvalidModelOutputError` in the business
layer, not as a routed fallback. Sprint 11 mitigated the one case this
produced (see Findings) by tightening the practice-generation prompt's
length constraints, not by touching the routing layer.

## Models discovered

`npm run models:inventory` queries Ollama's `/api/tags` and OmniRoute's
`/models` and writes `benchmark-artifacts/model-inventory.json` (ignored).
Either endpoint being unreachable is reported, not fatal, so the other
provider's catalog is still discovered.

Actually discovered on this machine after the outage:

| Provider  | Model              | Notes                                              |
|-----------|--------------------|-----------------------------------------------------|
| Ollama    | `llama3:latest`    | 8B, no "thinking"                                    |
| Ollama    | `qwen3.6:latest`   | 36B MoE, "thinking"-capable, 262K context             |
| Ollama    | `qwen2.5-coder:7b` | not evaluated (coding-specialized, not a candidate)  |
| Ollama    | `gpt-oss:20b`      | not evaluated (out of Stage 1 scope)                 |
| OmniRoute | `ollama-local/qwen3.6:latest` | live-validated through `/v1/chat/completions` |

## OmniRoute status

OmniRoute is now live-validated locally at `http://localhost:20128/v1`.
The model `ollama-local/qwen3.6:latest` returned a real, non-empty assistant
response through `/v1/chat/completions`:

```text
OMNIROUTE QWEN WORKS
```

The earlier empty response was not an Ollama failure or an upstream model
timeout. OmniRoute logs identified its own local rate-limit queue budget:
`resilienceSettings.requestQueue.maxWaitMs` was `15000`, so a slow local
request could be dropped after 15 seconds before it completed. OmniRoute's
supported environment setting is `RATE_LIMIT_MAX_WAIT_MS`; changing it from
`15000` to `120000` in **OmniRoute's separate local `.env`** and
restarting OmniRoute resolved the queue drop. A matched final probe returned
the expected assistant content through both direct Ollama and OmniRoute.

`RATE_LIMIT_MAX_WAIT_MS` is not a NovaTok Courses runtime variable and does
not belong in this repository's `.env`. NovaTok configures only the client
side with `OMNIROUTE_BASE_URL`, an optional `OMNIROUTE_API_KEY`, and routed
model specs such as `omniroute:ollama-local/qwen3.6:latest`. Never copy
OmniRoute's machine-specific `.env` or credentials into this repository.

## Staged evaluation (what was actually run, and why)

The original approach (3 models x 5 locales x 4 capabilities = 60 live
calls) was too slow and was explicitly not repeated. Sprint 11 used 3
bounded stages instead, via `npm run models:benchmark` (env-configured —
see script header for `BENCHMARK_MODELS`/`BENCHMARK_LOCALES`/
`BENCHMARK_TASKS`/`BENCHMARK_MAX_TOKENS`) and the existing
`npm run smoke:i18n` harness for the real acceptance matrix.

### Stage 1 — fast language screen (Tutor only, es/pt/fr/de, 8 calls)

First pass (100 max output tokens, default 30s Ollama timeout, before the
`think:false` fix): `llama3:latest` succeeded on all 4 locales but every
response was truncated before valid JSON closed (100 tokens is too tight
once a real answer is included); `qwen3.6:latest` failed all 4 — see
Finding 1.

Second pass (200 tokens, `think:false` added): `llama3:latest` 4/4 success,
3/4 fully parsed JSON, 4/4 language-adherence pass, ~7.3s average latency.
`qwen3.6:latest` still failed all 4 at the default 30s timeout — see
Finding 1.

### Finding 1 — qwen3.6 needs `think:false` and a longer timeout to be usable at all

Manual `curl` probes against Ollama directly (outside the app) isolated
why:

- `think` enabled + `num_predict: 100` → 83s total (66s was a cold model
  load), and the entire 100-token budget was consumed by hidden
  `"thinking"` content — `message.content` came back **empty**.
- `think: false` + `num_predict: 100` → 6.3s (model already warm), a
  correct, fluent Spanish answer.
- `think` enabled, no token cap → exceeded 90s without finishing; aborted.
- `think: false`, no token cap → 15.7s (warm), a correct, well-grounded
  Spanish JSON answer with the requested lesson slug echoed back.

This is why `think: false` was added unconditionally to `OllamaProvider`
(harmless for non-reasoning models) and why `OLLAMA_TIMEOUT_MS` exists as a
route-level override — a 36B reasoning model cannot be fairly evaluated,
let alone used in production, under a 30s client timeout while cold.

### Stage 2 — chosen policy

Preference order from the sprint brief: (1) one model for everything, (2)
English model + one multilingual model, (3) per-locale routing, (4)
per-locale/per-task routing. Given Finding 1 and Finding 2 below, Sprint 11
selected **option 2**: `llama3:latest` for `en`, `qwen3.6:latest` for
`es`/`pt`/`fr`/`de`, with `llama3:latest` as the single bounded fallback for
every locale (so an unavailable/timed-out/English-leaking `qwen3.6`
response never becomes a hard error — it degrades to a working, if
English, answer). This is the `AI_MODEL_ROUTES_JSON` shown above.

### Finding 2 — the real (non-English) problem only shows up under real prompts, not a short synthetic probe

Stage 1's short, single-line Tutor probe made `llama3:latest` look fine in
all 4 non-English locales. Running the actual Stage 3 acceptance matrix
against the real Advisor/Tutor/Coach/Practice prompts (full lesson content,
longer system prompts, conversation history) with `llama3:latest` as the
only model reproduced the exact Sprint 10 finding: Tutor, Coach, and
Practice all came back in English for `es`/`pt`/`fr`/`de` (only Advisor's
`reason` strings were sometimes localized, matching the "Advisor sometimes
good German" note). The single appended `LANGUAGE_INSTRUCTIONS` line is
not enough to overcome a prompt that's otherwise mostly English content.
Switching the non-English locales to `qwen3.6:latest` (Stage 2's policy)
fixed this — see Stage 3.

### Stage 3 — final acceptance (`npm run smoke:i18n`, 5 locales x 4 capabilities = 20 real calls)

This existing Sprint 10 harness already does exactly what Stage 3 needs:
it drives the real `getCourseAdvisorRecommendation` / `getTutorAnswer` /
`getLearningCoachAdvice` / `generatePracticeQuestion` service functions
(not synthetic prompts), asserts every recommended/relevant/pinned
course-or-lesson slug actually exists in PostgreSQL, and writes a bounded
`translation-exports/i18n-quality-report.json` (ignored) for human review.

- **`llama3:latest`-only baseline:** 20/20 mechanically passed (structured
  + grounded), but the quality report showed English leakage for
  Tutor/Coach/Practice on all 4 non-English locales — confirms Finding 2.
- **Stage 2 policy (qwen3.6 for es/pt/fr/de + llama3 fallback,
  `OLLAMA_TIMEOUT_MS=100000`):** first attempt 19/20 — `de` Practice
  failed with `InvalidModelOutputError` because the model's `explanation`
  exceeded the schema's 600-character cap (the content itself was fluent,
  correct German, fully grounded in the lesson — a length violation, not a
  language or grounding failure). Reproduced identically on a second run.
  See Finding 3 / the fix below.
- **After the fix, final run (via `.env`, no manual overrides): 20/20
  clean**, and the quality report shows genuinely fluent, well-grounded,
  correctly-localized Advisor reasoning, Tutor answers, Coach explanations,
  and Practice questions for all 5 locales — see the sample transcript in
  `translation-exports/i18n-quality-report.json` after running
  `npm run smoke:i18n`.

### Finding 3 — qwen3.6 writes longer explanations than the schema expected, independent of language

`practiceModelResponseSchema.explanation` is capped at 600 characters, and
`GENERATE_SYSTEM_PROMPT` (in `src/server/learning/practice.ts`) never
stated a length target. `qwen3.6` twice wrote a German explanation over
that cap; `llama3` never did in testing. The fix — adding explicit length
guidance ("at most 3 sentences and under 500 characters" for
`explanation`, explicit character caps for `choices`/`modelAnswer`) to the
system prompt — is model-agnostic and benefits any provider, not a
qwen3.6-specific workaround. This is exactly the architectural limit noted
under Language-adherence signal above: the routing layer's fallback logic
has no visibility into this class of failure.

## Fallback behavior observed

In the final clean 20/20 run, the quality report's `es`/`pt`/`fr`/`de`
samples all show genuine target-language content, consistent with the
primary (`qwen3.6`) succeeding on the first attempt — no fallback to
`llama3` was needed. The fallback path itself (unavailable provider, and
separately, an obvious-English response with a fallback configured) is
exercised in `src/ai/model-routing.test.ts` with fake providers, since
reliably forcing a live failure on demand isn't practical for a repeatable
test suite.

## Latency observations

Approximate, from Ollama on this machine (`think: false`, warm model
unless noted):

- `llama3:latest`: ~5-20s per call.
- `qwen3.6:latest`: ~6-16s per call once warm; 60-90s+ the first call
  after a cold load (i.e. right after the process last used a different,
  large model). This is why `OLLAMA_TIMEOUT_MS=100000` is configured for
  this route.

No usage/cost metadata is available from Ollama (`OllamaProvider` only
records latency). `OpenAICompatibleProvider` records
`inputTokens`/`outputTokens`/`estimatedCost` from the OmniRoute response's
`usage` object when present. Live validation confirmed the adapter's response
shape and non-empty assistant content; metadata remains endpoint-dependent.

## Changing the routing later

Edit `AI_MODEL_ROUTES_JSON` in `.env` (no code change, no rebuild — just
restart the process). Keys are looked up most-specific first:
`"<task>.<locale>"`, then `"<locale>"`, then `"<task>"`, then `"default"`.
`fallbacks` is a flat list; only the first entry that isn't already the
primary is used, and only one fallback attempt is ever made.

## Rerunning the benchmark

```sh
npm run models:inventory   # catalog discovery only, ~instant
BENCHMARK_MODELS="ollama:llama3:latest,ollama:qwen3.6:latest" \
BENCHMARK_LOCALES="es,pt,fr,de" \
BENCHMARK_TASKS="tutor" \
BENCHMARK_MAX_TOKENS=200 \
npm run models:benchmark   # Stage-1-style short screen

npm run smoke:i18n         # Stage-3-style full acceptance against .env's configured routes
```

Do not run the full `models:benchmark` matrix (all locales x all tasks x
many models) unless there's a specific new candidate to screen — prefer the
staged approach above.
