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
  analysis/     Design Intelligence Pipeline (no AI/browser yet):
                animation-extractor.ts (scroll/entrance/hover/parallax/sticky/
                text-motion heuristics + PlaywrightAnimationProbe hooks, safe
                low-confidence fallback), site-analyzer.ts, run-analysis.ts →
                WEBSITE/VISUAL/DESIGN_TOKENS/ANIMATION_ANALYSIS.json as
                versioned GeneratedFiles via the "Analyze website" button
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
- **Every app page uses the same shell rhythm.** Wrap page content in
  `<PageContainer>` (`components/layout/page-container.tsx` — standard
  `px-5 py-8 sm:px-8`, full content width) and lead with `<PageHeader>`. Do NOT
  hardcode per-page padding or `max-w-*` centering. Exceptions: full-bleed
  surfaces (the design editor, `/preview/*`) intentionally own the viewport.
- **Buttons use inline SVG icons, never emoji or text glyphs** (no `＋`, `←`,
  `✕`, `→`, 🖼, 👁). Draw 24×24 line icons with `stroke="currentColor"`,
  `strokeWidth ~1.7`, rendered at 15px, with `className="-ml-0.5"` before a text
  label; icon-only buttons need an `aria-label`. Keeps the UI consistent and
  theme-aware.
- **Dropdowns get a consistent chevron + gap automatically.** A global
  `globals.css` base rule styles every native `<select>` with a custom SVG
  chevron and `padding-right: 2rem` so the value text never touches the icon.
  Don't add per-select chevrons or right padding; opt out only with
  `appearance-auto` on the rare native-styled select.

### Design system (UI)

n8n-inspired LIGHT system (single theme) — tokens in `globals.css` `@theme`:
`canvas` #FAFAF8, `surface` #FFF cards, `panel` #F4F1EE wells, `line` #E6E2DD,
text `ink`/`body`/`muted`/`faint`, one rose accent `accent` #E94B6F (+ hover,
soft), semantic soft pairs (success/warning/danger/info). Inter + Geist Mono.
Helpers: `.card`, `.panel`, `.canvas-grid` (workflow dot grid), `.eyebrow`.
Color explains state only. Motion: light Framer Motion (fade-up, small lifts),
0.55–0.85s ease [0.22,1,0.36,1], reduced-motion safe.

Shared workflow visuals: `components/workflow/workflow-node.tsx`
(WorkflowNodeCard + NodeConnector, typed node styling) — used by the homepage
preview, hero ProductMockup, and the app's WorkflowBlueprint.

App shell: `components/layout/dashboard-shell.tsx` — left sidebar
(Dashboard, Projects live; Workflows/Approvals/Leads/Templates/Settings marked
"soon"), top bar (search, Create project, sign out). Post-auth lands on
`/dashboard` (summary cards + recent projects).

## UI / Design Libraries

Use these design resources where appropriate:

- shadcn/ui for core app UI: forms, buttons, cards, tabs, dialogs, sidebars, tables, badges, dropdowns.
- Magic UI for premium landing page sections, animated cards, gradients, marquees, and visual polish.
- Aceternity UI for advanced creative hero sections, background effects, parallax sections, and motion-led UI.
- Framer Motion / Motion for subtle, premium animation.

Rules:
- Do not copy random components without adapting them to our product.
- Keep UI enterprise-grade, clean, and useful.
- Avoid flashy, cheap, or distracting effects.
- Use motion only where it improves clarity or product feel.
- Dashboard UI should prioritize usability over decoration.
- Landing page can be more creative, but still professional.

## Status

Agency OS foundation + auth + n8n-inspired light redesign complete: repositioned landing, type-aware project
creation, type-specific file generation with versions, agent-run timeline,
workflow blueprint display, notes/decisions, Railway deploy config + worker.
Not yet built: real AI agents, workflow execution/approval queue UI, leads UI,
external integrations, export package, auth, visual workflow builder.
