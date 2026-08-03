# Sprint 1: Course Catalog

Sprint 1 delivers the public NovaTok Courses catalog on PostgreSQL through
Prisma. It intentionally excludes authentication, payments, reviews,
instructor uploads, affiliate tracking, student progress, and AI-powered
recommendations.

## Data model

The catalog is backed by the Category and Course models in
prisma/schema.prisma.

- Categories have unique slugs, display ordering, active state, descriptions,
  and icons.
- Courses have unique slugs, category relations, publication status, level,
  pricing, instructor metadata, duration and lesson metadata, prerequisites,
  learning outcomes, and enrollment links.
- Public catalog reads always limit courses to PUBLISHED rows and categories
  to active rows.
- PostgreSQL is the only datasource. All application database access goes
  through the generated Prisma client.

## Seed catalog

npm run db:seed idempotently upserts the catalog by category and course slug.
The Sprint 1 catalog contains 15 active categories and 50 courses. Later
sprints extend 20 of those courses with 40 modules and 77 lessons without
changing the public catalog contract.

## Public API

- GET /api/categories returns active categories in display order.
- GET /api/courses returns published courses with pagination and optional
  search, category, level, minPrice, maxPrice, and featured filters.
- GET /api/courses/[slug] returns one published course and related courses;
  invalid or unknown slugs return a not-found response.

Query parameters are validated with Zod. Search is case-insensitive across
course title and short description. Price bounds are inclusive, and the
validator rejects a minimum price greater than the maximum price.

## Pages

- /courses provides category navigation, featured courses, search, filters,
  result counts, empty states, and pagination.
- /courses/[slug] provides course, instructor, price, prerequisite, learning
  outcome, and related-course details.
- /categories/[slug] provides the filtered catalog for one active category.

Search, filters, and pagination are URL-backed so results are linkable and
survive navigation.

## Validation

Run the complete repository gate before committing:

    npm run lint
    npm run typecheck
    npm run test
    npm run build
    npm run db:validate

With the configured PostgreSQL database available, validate the real seed and
catalog service behavior:

    npm run db:seed
    npm run db:smoke

The Sprint 1-specific automated coverage includes seed invariants, query
validation, Prisma filter construction, category/course services, JSON-safe
serialization, and all three catalog API handlers.
