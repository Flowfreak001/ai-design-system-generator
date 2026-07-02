# Project OS — Agency Project OS + Small Business Automation Builder

An AI-powered project workspace for freelancers and agencies to scope,
organize, and deliver websites, apps, and small-business automation workflows —
from first client brief to final handoff.

Not a project-management clone and not an n8n/Zapier clone: a focused,
agency-first delivery system with automation workflow foundations.

**Live:** https://ai-design-system-generator-production.up.railway.app

## What it does

- **Project Workspace** — client projects with briefs, inputs, files, notes,
  decisions, and activity history.
- **Two project types** — `WEBSITE_APP` (client web builds) and
  `AUTOMATION_WORKFLOW` (leads, bookings, follow-ups, approvals for small
  businesses: plumbers, restaurants, real estate, taxi, clinics…).
- **Type-specific generated files** — built from the real brief, versioned:
  - Website/App: `PROJECT_BRIEF.md` · `SCOPE.md` · `DESIGN.md` · `CONTENT.md` · `BUILD_PROMPT.md` · `HANDOFF.md`
  - Automation: `WORKFLOW_AUDIT.md` · `AUTOMATION_BLUEPRINT.md` · `TOOLS_STACK.md` · `CLIENT_PROPOSAL.md` · `BUILD_PLAN.md` · `HANDOFF.md`
- **Workflow foundation** — workflow records with nodes + edges
  (`TRIGGER → AI_CLASSIFY → CONDITION → CREATE_LEAD → HUMAN_APPROVAL → SEND_EMAIL → END`),
  displayed as a clean flow. Visual builder and execution come later.
- **Project-to-Automation Intelligence** — business type → suggested workflows.
- **Agent run timeline** — every generation logs step-by-step activity.

## Stack

- **Next.js 16** (App Router, Server Actions) · **TypeScript** · **Tailwind v4** · **Framer Motion**
- **Prisma 7** on **PostgreSQL** · **zod**
- Queue abstraction: inline mock locally, **BullMQ + Redis** in production when
  `REDIS_URL` is set (worker: `npm run worker`)
- Deployed on **Railway** (`DATABASE_URL`, `REDIS_URL` from env — no secrets in code)

Deferred by design: real AI APIs, external integrations (email/WhatsApp/
calendar), auth, payments, uploads, visual workflow builder.

## Getting started

```bash
npm install
cp .env.example .env          # set DATABASE_URL
npm run db:start              # local userspace Postgres on :5433 (no Docker)
npm run db:migrate            # apply Prisma migrations
npm run db:seed               # optional: one demo project of each type
npm run dev                   # http://localhost:3000
```

`npm run build` runs the production build **and** the TypeScript check.

## Structure

```
src/
  app/            routes + server actions (landing, /projects, /projects/new, /projects/[id])
  components/     landing/ · layout/ · projects/ · ui/ (motion primitives, buttons)
  lib/
    generators/   type-specific file generators (real input, no filler)
    generation.ts AgentRun + steps → files + versions (+ mock workflow)
    workflow-suggestions.ts  business type → suggested workflows
    jobs/ queue/  enqueue abstraction (mockQueue local, redisQueue prod)
    db/ validators/ utils/
  types/          shared domain types
```

See `CLAUDE.md` for architecture notes (incl. Prisma 7 specifics) and
`DEPLOY.md` for Railway setup.
