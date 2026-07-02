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
app/            routes + server actions (page.tsx = premium landing, projects/*)
components/
  landing/      LandingHero, FeatureSection, WorkflowSection, OutputFilesSection,
                PreviewExportSection, TrustSection, FinalCTA
  layout/       SiteHeader, SiteFooter
  projects/     ProjectCard, ProjectForm, ProjectOverview, GeneratedFilesViewer, StatusBadge
  ui/           Button/LinkButton (micro-interactions), motion primitives (FadeUp,
                Stagger, StaggerItem, HoverLift) — all respect prefers-reduced-motion
lib/
  generators/   BRAND.md, DESIGN.md, CREATIVE.md, PROMPT_CLAUDE_CODE.md — rich
                templates built from real project input (no filler)
  generation.ts runGeneration(): AgentRun + AgentStep per agent → GeneratedFile
                (+ FileVersion history, version bump on regenerate)
  jobs/         startGeneration() → enqueue GENERATE
  queue/        index.ts (abstraction) / mockQueue.ts (inline, local) /
                redisQueue.ts (BullMQ, only loaded when REDIS_URL set)
  db/           Prisma 7 client singleton (pg adapter)
  validators/   zod schemas + PLATFORM_TARGETS / ANIMATION_PREFERENCES constants
  utils/        slugify, shortId
types/          GenerationInput, OutputFileName, AGENT_NAMES
```

### Data model

`Project` (name, slug, client/business, status) 1:1 `ProjectInput` (goal, audience,
URLs, colors, pages, keywords, platform, animation, notes) 1:N `GeneratedFile`
(1:N `FileVersion`) and 1:N `AgentRun` (1:N `AgentStep`).

### Generation flow (mock, no real AI yet)

`startGeneration(projectId)` → enqueue → `runGeneration()`: creates an AgentRun,
runs 4 agents (Brand Strategist, Design Systems, Creative Director, Prompt
Engineer) each producing its file from real input values, versioning on
regenerate, then marks the project READY.

### Queue

`enqueue(jobName, payload)`: mockQueue runs the processor inline (local, no
Redis); redisQueue uses BullMQ (only dynamically imported when `REDIS_URL` is
set). Worker: `npm run worker` (`src/worker.ts`). Note: bullmq bundles its own
`ioredis`, so the connection instance is cast to `ConnectionOptions`.

### Design system (UI)

Dark premium enterprise look — tokens in `globals.css` `@theme` (`canvas`,
`surface`, `ink`, `muted`, `brand` indigo→violet, `accent` cyan, hairline
`line`). Plus Jakarta Sans display/body, Geist Mono for code/labels. Helpers:
`.aurora`, `.text-gradient`, `.eyebrow`, `.card`. Motion: 0.6–0.9s, ease
`[0.22,1,0.36,1]`, no bounce/spin; `motion.tsx` primitives handle reduced motion.

## Conventions

- Mutations use **Server Actions** (`src/app/projects/actions.ts`) with zod
  validation; pages are Server Components (`export const dynamic = "force-dynamic"`
  where they read the DB).
- `params`/`searchParams` are **Promises** — await them.
- Keep Prisma access in `lib/projects.ts` / `lib/*`, not in components.
- No secrets in code; read from env. `.env`, `.pg-data`, `.storage`,
  `src/generated`, and `dev-with-path.sh` are git-ignored.

## Status

Foundation complete: premium landing page, full project flow (create with 16-field
brief → generate → view files with agent workflow status), rich mock generators,
versioned files, queue abstraction, Railway deploy config. Not yet built: real AI
agents (OpenAI), remaining output files (CONTENT/COMPONENTS/ANIMATION/SEO/other
PROMPT_*), export ZIP, preview.html rendering, Playwright crawler, uploads, auth.
