# Creator Academy

Adds a coherent Social Media Creator / Creator Business / Small Business
curriculum to the existing NovaTok Courses catalog: a new category, 12
real courses with full module/lesson content, and Learning Paths that
sequence courses into progressions. The **Creator Coach** AI feature that
builds a personalized plan from these courses is documented separately in
[docs/creator-coach.md](./creator-coach.md).

This phase does **not** integrate with NovaTok Social — see
[Future NovaTok Social integration](#future-novatok-social-integration)
below for what that would eventually add.

## Why a new category, not an extension of Digital Marketing

`digital-marketing` already exists ("SEO, paid ads, content, and social
strategy courses for growing an audience or a business online") and could
have absorbed a few of these courses. It was left alone deliberately:
Digital Marketing is a business-marketer lens (SEO, paid ads, campaigns),
while Creator Academy is a creator-identity lens (niche, personal brand,
platform-native growth mechanics, creator monetization, creator mindset)
that doesn't fit that framing without diluting it. Cramming 12 courses
into Digital Marketing would also have made it by far the largest
category in the catalog, at the expense of every other category's
proportion.

## Category

`creator-economy` — **Creator Economy & Social Media**
(`src/seed-data/categories.ts`, `displayOrder: 16`). The 16th category;
`categorySeeds.length` is asserted at exactly 16 in
`src/seed-data/seed-data.test.ts` — update that test deliberately if this
number changes again, the same way every prior category addition did.

## The 12 courses

Each maps to one of the originally-requested curriculum areas. All 12
have full Tutor-ready module/lesson content (not just catalog metadata) —
`src/seed-data/course-content.ts` grew from 20 to 32 content-seeded
courses (77 → 137 lessons) specifically so Creator Coach and the Tutor
have real material to ground against, not just titles.

| Course slug | Curriculum area | Level |
| --- | --- | --- |
| `social-media-foundations-for-creators` | Social Media Foundations | BEGINNER |
| `growing-your-audience-from-zero` | Audience Growth | BEGINNER |
| `content-creation-for-creators` | Content Creation | BEGINNER |
| `platform-growth-playbooks` | Platform-Specific Growth (all 9 platforms, cross-platform strategy) | ADVANCED |
| `creator-sales-and-conversion` | Creator Sales & Conversion | INTERMEDIATE |
| `social-commerce-and-live-selling` | Social Commerce | INTERMEDIATE |
| `creator-business-and-monetization` | Creator Business & Monetization | ADVANCED |
| `personal-brand-for-creators` | Personal Brand | BEGINNER |
| `creator-mindset-and-sustainable-habits` | Personal Growth for Creators | BEGINNER |
| `ai-tools-for-creators` | AI for Creators | INTERMEDIATE |
| `creator-analytics-and-data-driven-growth` | Creator Analytics | INTERMEDIATE |
| `small-business-social-media-playbook` | Small Business Social Media | BEGINNER |

### Platform coverage

TikTok, Instagram, Facebook, YouTube, YouTube Shorts, LinkedIn,
X/Twitter, Threads, and Pinterest are covered inside
`platform-growth-playbooks` as three modules grouped by platform family
(short-form video platforms; community/visual platforms; authority/text
platforms) rather than nine separate courses — this directly answers the
brief's "account for cross-platform content strategy rather than treating
every platform as an isolated product" instruction. Platform-specific
tactics also appear contextually in other courses (e.g. TikTok Shop in
Social Commerce, Facebook Marketplace in Small Business).

### What was deliberately not built

No dedicated single-platform courses (e.g. a standalone "YouTube
Creator" course) exist yet — that would have meant either much thinner
per-platform content or a much larger content-authoring effort than a
"smallest clean architecture, no fake volume" first phase called for.
`platform-growth-playbooks`'s YouTube module covers YouTube today; a
dedicated YouTube course is a natural, isolated future addition once
there's a concrete reason for one (see **Remaining gaps** in the
implementation report).

## Learning Paths

Learning Paths are curated, ordered sequences of existing Course rows —
**deliberately not a new Prisma model or migration**. A path is pure
curation: a slug, title, description, target audience, estimated weeks,
and an ordered list of real course slugs
(`src/data/learning-paths.ts`), resolved against the live catalog at
request time (`src/server/learning-paths.ts`). If per-student path
progress becomes a real feature later, that's a natural
`StudentEnrollment`-adjacent schema addition to make *then* — not
speculative schema now, per this project's standing rule.

11 paths ship today: New Creator, Grow My Audience, Short-Form Video
Creator, Personal Brand, Social Commerce Seller, Affiliate Creator, UGC
Creator, Small Business Owner, Become a Full-Time Creator, AI-Powered
Creator, and Creator Business & Monetization. `YouTube Creator` was
requested but intentionally not added as a separate path — see **What
was deliberately not built** above; it would today just duplicate
Short-Form Video Creator's course set.

Pages: `/learning-paths` (list) and `/learning-paths/[slug]` (detail,
ordered course list). A path with a missing/unpublished course silently
skips it rather than showing a broken reference — the same "never show
what the DB didn't return" discipline used throughout this codebase's AI
features, applied here to static config instead of a model.

## Course quality bar

Every new course has: a real target audience and level, prerequisites
where appropriate, concrete learning outcomes, and (for all 12) real
modules and lessons with substantive lesson content — not placeholder
rows. `src/seed-data/seed-data.test.ts` and
`src/seed-data/course-content.test.ts` enforce the same invariants
applied to every other course in the catalog (unique slugs, valid
category references, non-trivial lesson content, no guaranteed-income or
guaranteed-job language) — nothing about the quality bar was relaxed for
this content.

## Future NovaTok Social integration

Not implemented in this phase, by explicit instruction. The intended
shape, for when it happens: NovaTok Social would supply real creator
signals (posts, videos, views, engagement, follower growth, content
categories, commerce activity) that Creator Coach could incorporate
instead of relying only on what a creator types about themselves — e.g.
"your videos receive views but very few profile visits; take this
CTA/conversion lesson" derived from real analytics rather than
self-reported numbers. See
[docs/creator-coach.md](./creator-coach.md#future-novatok-social-integration)
for how that would slot into the existing pipeline without changing its
shape.
