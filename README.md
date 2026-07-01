# AI Website Design System Generator

Generates structured, AI-ready design-system files (design tokens, brand/UX/SEO
docs, and per-tool build prompts) for agencies, developers, and AI coding tools.

Create a project → add a business brief, reference URLs, and assets → run agents
→ generate the files → preview → export.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions) · **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** on **PostgreSQL**
- **BullMQ + ioredis** for background jobs (inline fallback when no Redis)
- **zod** for validation
- Deployed on **Railway** (`DATABASE_URL`, `REDIS_URL` provided as env vars)

Deferred (not built yet): Playwright crawler/screenshots, OpenAI-backed agents,
asset upload UI, QA reports, export ZIP, auth.

## Getting started

```bash
npm install
cp .env.example .env          # set DATABASE_URL (Railway provides it in prod)
npm run db:start              # local userspace Postgres on :5433 (no Docker needed)
npm run db:migrate            # apply Prisma migrations
npm run db:seed               # optional: one demo project
npm run dev                   # http://localhost:3000
```

`npm run build` runs the production build **and** the TypeScript check.

## Structure

```
src/
  app/            routes, API, server actions
  components/     UI
  lib/
    agents/       AI pipeline stages (stubbed — no real OpenAI yet)
    generators/   output-file registry (30+ artifacts)
    queue/        BullMQ on Railway, inline execution locally
    db/           Prisma 7 client (pg adapter)
    validators/   zod schemas
    storage/      asset adapter (local fs)
    projects.ts   data access + mock generation
  types/          shared domain types
  prompts/        per-tool prompt templates
```

See `CLAUDE.md` for architecture notes and Prisma 7 specifics.

## Environment

Never commit secrets. Configure via env:

- `DATABASE_URL` — PostgreSQL connection (Railway).
- `REDIS_URL` — optional; when empty, jobs run inline instead of via BullMQ.
- `OPENAI_API_KEY` — reserved for the real agents (not used yet).
