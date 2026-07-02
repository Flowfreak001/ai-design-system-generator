@AGENTS.md

# Project OS — Agency Project OS + Small Business Automation Builder

An AI-powered project workspace for freelancers and agencies to scope, organize,
and deliver websites, apps, and small-business automation workflows — from first
client brief to final handoff. Not a PM-tool clone and not an n8n/Zapier clone:
a focused, agency-first delivery system with automation workflow foundations.

Two project types: **WEBSITE_APP** (client web builds) and
**AUTOMATION_WORKFLOW** (leads/bookings/approvals automation for small
businesses like plumbers, restaurants, real estate, taxi).

## Stack

- **Next.js 16** (App Router, Turbopack, RSC + Server Actions) · **TypeScript**
- **Tailwind CSS v4** (CSS `@theme` config in `globals.css`) · **Framer Motion** (light)
- **Prisma 7** on **PostgreSQL** · **BullMQ + ioredis** (queue) · **zod** (validation)
- Deployed on **Railway** (provides `DATABASE_URL`, `REDIS_URL`). Never hard-code secrets.
- Deferred: real AI APIs, external integrations (email/WhatsApp/calendar), auth, uploads.

> Next 16 + Prisma 7 both have breaking changes vs. older training data. See
> `AGENTS.md`; read `node_modules/next/dist/docs/` before unfamiliar APIs.

### Prisma 7 specifics (important)

- Connection URL lives in `prisma.config.ts` (`datasource.url`), **not** the
  schema `datasource` block.
- Client generates to `src/generated/prisma` (git-ignored). Import `PrismaClient`
  from `@/generated/prisma/client`, enums from `@/generated/prisma/enums`, and
  model row types from `@/generated/prisma/models` as `<Name>Model`
  (e.g. `ProjectModel`) — plain `Project` is NOT exported.
- The client **requires a driver adapter** — `@prisma/adapter-pg` in
  `src/lib/db/client.ts`.
- After schema changes: `npx prisma generate` AND restart the dev server (a
  running Next dev process keeps the old client in memory).

## Commands

```bash
npm run dev         # dev server on :3000 (Turbopack)
npm run build       # production build + typecheck (this is the typecheck)
npm run db:start    # local userspace Postgres (embedded-postgres) on :5433
npm run db:stop
npm run db:migrate  # prisma migrate dev
npm run db:seed     # seed one project of each type (needs DATABASE_URL)
npm run worker      # BullMQ worker (requires REDIS_URL)
```

Local dev has **no Docker/Redis** (machine can't install them). `db:start` runs
Postgres in userspace; without Redis the queue runs inline via the mock queue.

## Architecture (`src/`)

```
app/            routes + server actions (page.tsx = landing, projects/*)
components/
  landing/      LandingHero, FeatureSection (pillars + use cases),
                WorkflowSection (how it works), OutputFilesSection, FinalCTA
  layout/       SiteHeader, SiteFooter ("Project OS" brand)
  projects/     ProjectCard, ProjectForm (type-aware), ProjectOverview,
                GeneratedFilesViewer, WorkflowBlueprint, NotesSection,
                AgentRunTimeline, StatusBadge/TypeBadge
  ui/           Button/LinkButton, motion primitives (FadeUp, Stagger,
                StaggerItem, HoverLift) — all respect prefers-reduced-motion
lib/
  generators/   two file sets from real input:
                WEBSITE_APP → PROJECT_BRIEF/SCOPE/DESIGN/CONTENT/BUILD_PROMPT/HANDOFF
                AUTOMATION_WORKFLOW → WORKFLOW_AUDIT/AUTOMATION_BLUEPRINT/
                TOOLS_STACK/CLIENT_PROPOSAL/BUILD_PLAN/HANDOFF
  generation.ts runGeneration(): AgentRun + step-by-step AgentSteps → files +
                FileVersions; automation projects also get a mock Workflow
                (nodes + edges: TRIGGER → AI_CLASSIFY → CONDITION → CREATE_LEAD
                → HUMAN_APPROVAL → SEND_EMAIL → END, with an urgent branch)
  workflow-suggestions.ts  Project-to-Automation Intelligence: business type →
                suggested workflows (plumber/restaurant/real estate/taxi/clinic)
  jobs/         startGeneration() → enqueue GENERATE
  queue/        index.ts (abstraction) / mockQueue.ts (inline, local) /
                redisQueue.ts (BullMQ, only imported when REDIS_URL set)
  db/           Prisma 7 client singleton (pg adapter)
  validators/   zod schemas (createProjectSchema incl. automation fields)
types/          ProjectBrief, AutomationBrief, GenerationInput, file-set consts
```

### Data model

Tenancy: `Agency` → `User`s, `Business`es (clients, each with `Lead`s),
`Project`s. A `Project` has typed `ProjectInput` rows (category `brief` /
`automation`, data as Json), `GeneratedFile`s (→ `FileVersion`s), `AgentRun`s
(→ `AgentStep`s), `ProjectNote`s, and `Workflow`s (→ `WorkflowNode`/`WorkflowEdge`,
runs → `WorkflowRun`/`WorkflowStep`/`Approval`). Agency/Business/User/Lead and
WorkflowRun/Approval are schema-ready but not yet surfaced in UI.

### Rules

- Long-running AI/workflow work never lives in the request path conceptually —
  it goes through `enqueue()` so a worker can own it later.
- Mutations use Server Actions with zod; DB-reading pages set
  `export const dynamic = "force-dynamic"`.
- `params`/`searchParams` are **Promises** — await them.
- Prisma access stays in `lib/*`, not components.
- `.env`, `.pg-data`, `src/generated`, `dev-with-path.sh` are git-ignored.

### Design system (UI)

Dark premium look — tokens in `globals.css` `@theme` (`canvas`, `surface`,
`ink`, `muted`, `brand` indigo→violet, `accent` cyan, hairline `line`).
Plus Jakarta Sans + Geist Mono. Helpers: `.aurora`, `.text-gradient`,
`.eyebrow`, `.card`. Motion: light, 0.55–0.9s, ease `[0.22,1,0.36,1]`, no
bounce/spin.

## Status

Agency OS foundation complete: repositioned landing, type-aware project
creation, type-specific file generation with versions, agent-run timeline,
workflow blueprint display, notes/decisions, Railway deploy config + worker.
Not yet built: real AI agents, workflow execution/approval queue UI, leads UI,
external integrations, export package, auth, visual workflow builder.
