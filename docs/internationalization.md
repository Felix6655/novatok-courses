# Internationalization and Translation Editorial Workflow

NovaTok Courses supports `en`, `es`, `pt`, `fr`, and `de`; English canonical content is the final fallback. Page URLs use `/{locale}/...`; APIs accept an optional validated `locale`. `novatok_locale` is a SameSite=Lax preference cookie. IDs, slugs, enrollment, progress, activities, and practice ownership always reference canonical rows.

## Translation lifecycle

Course, module, and lesson translations share `TranslationStatus`:

- `DRAFT`: development or machine-assisted text; visible only through explicit development preview and never treated as production content.
- `REVIEWED`: human-reviewed but not yet released.
- `PUBLISHED`: publishable and eligible for normal localized retrieval.

`reviewedAt` is required by the audit for REVIEWED/PUBLISHED rows. `createdAt` and `updatedAt` provide lifecycle timestamps. Production retrieval uses requested PUBLISHED translation, then PUBLISHED English translation, then canonical English content.

## Editor workflow

1. Run `npm run translations:audit` for coverage and structural integrity.
2. Export a locale: `npm run translations:export -- --locale es`. Output goes to ignored `translation-exports/es.json`; use `--out` to choose another path.
3. Translate/review fields without changing `entityType`, `entityId`, locale, course slug, lesson slug, or source fields.
4. Set status deliberately. Omitted status defaults to DRAFT. Only a human approval decision may set REVIEWED or PUBLISHED.
5. Validate without writes: `npm run translations:import -- translation-exports/es.json --dry-run`.
6. Import after review: `npm run translations:import -- translation-exports/es.json`.
7. Rerun the import to confirm idempotency, then rerun the audit.

Import uses Zod, rejects unsupported/mixed locales, unknown canonical IDs, duplicate entity/locale rows, incomplete translated fields, and malformed status values. Valid rows upsert transactionally; nothing is deleted. Export is read-only.

The audit reports total, translated, draft, reviewed, published, fallback, and missing counts for each entity and locale. It exits nonzero for unsupported locales, duplicates, empty required fields, or approved rows lacking review timestamps. Incomplete coverage is reported but is not corruption.

## Preview and publishing

In development, add `?translationPreview=1` to the localized catalog. A review panel labels each displayed course as requested translation, English translation, or canonical fallback and shows its status. This query flag has no effect in production. Normal student and AI retrieval excludes DRAFT and REVIEWED rows.

No automatic draft translation command is included in Sprint 10. This was intentionally skipped: the safe audit/export/import/review lifecycle is more important than bulk generation, and the existing seed drafts already provide workflow samples. A future local Ollama draft tool must use bounded batches and may create only DRAFT rows.

## AI and quality acceptance

`npm run smoke:i18n` exercises Advisor, Tutor, Learning Coach, and practice for every V1 locale using the existing local provider and real PostgreSQL. It validates schemas, canonical course/lesson grounding, and localized content availability. It writes a bounded, ignored `translation-exports/i18n-quality-report.json` for human review. The harness does not claim to prove fluency; a reviewer must assess correctness, awkward phrasing, language mixing, and launch suitability.

`npm run smoke:auth` is the gated authenticated multilingual acceptance harness. It clearly skips if NovaTok Social origin and two credential pairs are absent. Once configured, it checks all five `/learn` variants, enrollment, lesson access, progress, Tutor, Coach, practice, cross-user ownership, and cleanup. Credentials must never be fabricated.

## Adding a new language

1. Add its BCP-47 code, display name, and AI instruction in `src/i18n/config.ts`.
2. Add a complete dictionary with the same keys as English.
3. Add reviewed translation rows through export/import.
4. Add the locale to routing, audit, metadata, HTTP, AI, and authenticated acceptance expectations.
5. Human-review UI and AI language quality before publishing.

No route, database identity, enrollment/progress, or AI-provider architecture change is required. NovaTok Social can later initialize/synchronize the locale cookie while remaining the identity authority.
