@AGENTS.md

# AI Website Design System Generator

Generates structured, AI-ready design-system files (tokens, docs, per-tool build
prompts) for agencies, developers, and AI coding tools. Users create a project,
add a business brief + reference URLs + assets, run AI agents, generate the
files, preview, and export.

## Stack

- **Next.js 16** (App Router, Turbopack, RSC + Server Actions) · **TypeScript**
- **Tailwind CSS v4** (CSS `@theme` config in `globals.css`)
- **Prisma 7** on **PostgreSQL** · **BullMQ + ioredis** (queue) · **zod** (validation)
- Deployed on **Railway** (provides `DATABASE_URL`, `REDIS_URL`). Never hard-code secrets.
- Deferred: Playwright (crawler/screenshots), OpenAI API (real agents).

> Next 16 + Prisma 7 both have breaking changes vs. older training data. See
> `AGENTS.md`; read `node_modules/next/dist/docs/` before unfamiliar APIs.

### Prisma 7 specifics (important)

- Connection URL lives in `prisma.config.ts` (`datasource.url`), **not** the
  schema `datasource` block.
- Client generates to `src/generated/prisma` (git-ignored); import
  `PrismaClient` from `@/generated/prisma/client`, enums from
  `@/generated/prisma/enums`.
- The client **requires a driver adapter** — we pass `@prisma/adapter-pg`
  (`PrismaPg`) in `src/lib/db/client.ts`.

## Commands

```bash
npm run dev         # dev server on :3000 (Turbopack)
npm run build       # production build + typecheck (this is the typecheck)
npm run db:start    # local userspace Postgres (embedded-postgres) on :5433
npm run db:stop
npm run db:migrate  # prisma migrate dev
npm run db:generate # prisma generate
npx tsx scripts/seed.ts   # seed a demo project (needs DATABASE_URL)
```

Local dev has **no Docker/Redis** (machine can't install them). `db:start` runs
Postgres in userspace; Redis is absent, so the queue runs **inline** (see below).

## Architecture (`src/`)

```
app/            routes + API + server actions (projects/actions.ts)
components/     UI
lib/
  agents/       AI pipeline stages — research → website → visual → tokens (STUBBED)
  generators/   registry mapping every OutputFileName → content generator
  queue/        enqueue(): BullMQ when REDIS_URL set, else runs inline
  db/           Prisma 7 client singleton (pg adapter)
  validators/   zod schemas (createProjectSchema, ...)
  storage/      asset adapter (local fs now; swap for cloud)
  projects.ts   data-access + generateMockFiles()
types/          BusinessBrief, DesignTokens, OutputFileName (30 artifacts), GenerationContext
prompts/        per-tool prompt templates
```

### Generation flow (mock, no real AI yet)

`generateMockFiles(projectId)` → load brief → `runPipeline()` (stub agents fill
research/analysis/tokens) → `generateAll()` produces all artifacts → upsert
`GeneratedFile` rows → set project `READY`. Structured files (JSON/CSS/theme/
preview) are already real; markdown/prompt bodies are placeholders until the
OpenAI-backed agents are wired.

### Queue

`enqueue(type, payload)` uses BullMQ (`src/lib/queue/bullmq.ts`) only when
`REDIS_URL` is set; otherwise it runs the registered processor inline so the app
is fully functional locally. Note: bullmq bundles its own `ioredis`, so the
connection instance is cast to `ConnectionOptions` (dual-package hazard).

## Conventions

- Mutations use **Server Actions** (`src/app/projects/actions.ts`) with zod
  validation; pages are Server Components (`export const dynamic = "force-dynamic"`
  where they read the DB).
- `params`/`searchParams` are **Promises** — await them.
- Keep Prisma access in `lib/projects.ts` / `lib/*`, not in components.
- No secrets in code; read from env. `.env`, `.pg-data`, `.storage`,
  `src/generated`, and `dev-with-path.sh` are git-ignored.

## Status

Foundation: schema, module structure, types, and the project create/list/detail
UI + mock generation are done and build-verified. Not yet built: real AI agents,
Playwright crawler, asset upload UI, QA reports, export ZIP, auth.
