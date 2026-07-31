# NovaTok Courses

A standalone courses marketplace, built to later power a "Courses" tab
inside novatoksocial.com. See [CLAUDE.md](./CLAUDE.md) for the full project
purpose and repository rules.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma · Zod

## Getting Started

Copy the environment template and point it at your local Postgres instance:

```bash
cp .env.example .env
```

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Scripts

```bash
npm run dev         # start the dev server
npm run build       # production build
npm run start       # run the production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # vitest
```
