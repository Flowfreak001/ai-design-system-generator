# Flowfreak

Flowfreak is an AI platform to **plan, build, optimize, and automate business websites**.
It turns a short business brief into wireframes, real pages, SEO content, and automations —
and exposes that intelligence to external AI coding tools over MCP.

This document describes the **technical foundation** (Phase 1). It is intentionally a
scalable base: clean module structure, typed domain, and mock data — with real AI,
backend, and auth added in later phases without reworking the UI layer.

## Product modules

| Module | What it does | Route | Status |
| --- | --- | --- | --- |
| **Flowfreak Studio** | Create wireframes, pages, and full websites from a brief | `/studio` | Beta |
| **Flowfreak Library** | Browse industry sections, UI patterns, layouts, page templates | `/library` | Live |
| **Flowfreak SEO** | Generate SEO pages, blogs, keywords, and content plans | `/seo` | Planned |
| **Flowfreak Automations** | Automate website, lead, support, and agency workflows | `/automations` | Planned |
| **Flowfreak MCP** | Connect Flowfreak to Claude, Cursor, Lovable, VS Code | `/mcp` | Planned |

## Current stack

- **Next.js 16** (App Router, RSC + Server Actions) · **TypeScript**
- **Tailwind CSS v4** (`@theme` tokens in `globals.css`) · light **Framer Motion**
- **Prisma 7** on **PostgreSQL** (used by the existing Studio/Library modules)
- Mock data for the newer modules (SEO / Automations / MCP) — no backend or AI wired yet

> Flowfreak is built **inside the existing Next.js app** rather than a separate Vite
> project, so it reuses the app shell, design system, Studio (design editor), and the
> real Section Library — and is ready for SSR, API routes, and MCP endpoints in future
> phases.

## Routes / pages

| Route | Page |
| --- | --- |
| `/dashboard` | Dashboard — greeting, KPI strip, **platform module grid**, needs-attention queue, recent activity |
| `/studio` | Studio — website brief inputs (category, goal, style, pages) + generated-structure preview placeholder |
| `/library` | Library — real Section Library catalog (browse, preview, add) |
| `/seo` | SEO — page/blog/meta generators, keyword tasks table, on-page checklist |
| `/automations` | Automations — workflow cards (trigger→action), recent runs, builder placeholder |
| `/mcp` | MCP — server status, tools list with input/output examples, connected tools |
| `/projects` | Projects — project card grid |
| `/settings` | Settings — profile, workspace, module toggles |

## Folder structure (Flowfreak additions)

```
src/
  types/flowfreak.ts            # ProductModule, Project, LibraryItem, SeoTask,
                                # AutomationWorkflow, McpTool, PageBlueprint, …
  data/flowfreak.ts             # mock modules, projects, library items, SEO tasks,
                                # automations, MCP tools, business categories, goals
  components/
    shared/
      module-card.tsx           # ProductModule tile
      stat-card.tsx             # metric tile
      module-ui.tsx             # Panel / Placeholder / Field / Chips primitives
    layout/                     # DashboardShell (sidebar + full-width header), logo
    ui/                         # Button, Card, Badge, Input, Select, Textarea, Tabs…
  app/(app)/
    dashboard/  studio/  seo/  automations/  mcp/  projects/  settings/
```

The existing Studio (design editor) and Library (section catalog) already have deeper,
backend-connected implementations; the new module pages are structured placeholders that
share the same shell, tokens, and components.

## Mock data approach

All non-backed modules read from `src/data/flowfreak.ts`. Each export matches a domain
type in `src/types/flowfreak.ts`, so swapping mock arrays for real Prisma queries or AI
agent output later requires **no changes in the page components** — only the data source.

Business categories: SaaS · Agency · Car Rental · Dental Clinic · Construction ·
Restaurant · Real Estate · E-commerce · Fitness · Accounting · Cleaning · Taxi Service ·
Healthcare · Education · Legal · Home Services.

Website goals: Lead generation · Online booking · Product sales · Appointment booking ·
Portfolio showcase · Local SEO · Support/helpdesk · Brand awareness.

## Future plans

- **Backend** — Prisma models for each module (SeoTask, AutomationWorkflow, McpTool…);
  Server Actions for mutations; the queue already in the repo for long-running AI work.
- **AI integration** — per-module agents (wireframe planner, SEO writer, workflow
  composer) behind the existing `enqueue()` boundary, returning the same typed shapes.
- **MCP server** — a real MCP endpoint exposing `generate_wireframe`, `search_library`,
  `generate_seo_page`, `create_automation` to external AI tools.

## Recommended next phases

- **Phase 1 — Frontend technical foundation** ✅ (this)
- **Phase 2 — Library data model and component management**
- **Phase 3 — Studio wireframe generator logic**
- **Phase 4 — Website/page assembly engine**
- **Phase 5 — SEO generation tools**
- **Phase 6 — Automation workflow builder**
- **Phase 7 — MCP server integration**
- **Phase 8 — Authentication, database, billing, and production deployment**
