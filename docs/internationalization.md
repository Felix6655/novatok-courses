# Internationalization and Adding a New Language

NovaTok Courses supports `en`, `es`, `pt`, `fr`, and `de`; English is the default. Page URLs use a locale prefix (`/{locale}/courses`, advisor, Tutor, course detail, and learning routes). Legacy unprefixed pages redirect to the cookie preference or English. API URLs remain stable and accept a validated `locale` field.

## Architecture

`src/i18n/config.ts` is the only supported-locale registry. `dictionaries.ts` holds type-checked UI copy. The proxy rewrites prefixed URLs to the existing page tree, passes the locale to server components through `x-novatok-locale`, and persists `novatok_locale` as a SameSite=Lax cookie. The switcher replaces only the locale segment, preserving course/lesson slugs, identity, enrollment, progress, and practice history.

Course, module, and lesson IDs and slugs remain canonical. Prisma translation rows are unique by parent and locale and cascade with their parent. Retrieval in `src/server/localized-content.ts` applies requested translation, then English translation, then canonical content. Search checks requested-locale translation text first while retaining canonical matching.

AI capabilities reuse the existing provider. Advisor, Tutor, Learning Coach, and practice validate locale and append the shared language instruction. Tutor and practice remain grounded in canonical IDs; localized text changes presentation only. Deterministic state and multiple-choice grading are language-independent.

The idempotent seed supplies localized metadata for six courses and module/lesson content for three Tutor-ready courses in the four non-English locales; canonical English remains the final fallback. This is validation content, not a translation of the full catalog.

## Add a sixth language

1. Add its BCP-47 code to `SUPPORTED_LOCALES`, display name, and language instruction.
2. Add a dictionary with exactly the English dictionary keys.
3. Add reviewed translation seed rows or production translations.
4. Extend locale validation/routing/prompt tests and run all gates.
5. Add the locale to multilingual Ollama and HTTP acceptance smoke.

No route, schema, provider, enrollment, or progress architecture change is required. A future NovaTok Social preference can initialize or synchronize the locale cookie after authentication; Courses must continue treating Social as the identity authority. Model fluency varies by the installed Ollama model, so every launch locale requires human-reviewed live acceptance.

The authenticated two-user deployment smoke still requires real NovaTok Social Supabase configuration and two dedicated test users; do not fabricate them.
