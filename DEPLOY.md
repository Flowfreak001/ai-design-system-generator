# Deploying to Railway

This app deploys to [Railway](https://railway.app) via Nixpacks. Config lives in
[`railway.json`](./railway.json).

## What the config does

- **Build:** `npm run build`. `postinstall` runs `prisma generate` first (the
  Prisma client is git-ignored, so it must be generated on every install).
- **Start:** `npm run db:deploy && npm run start` — applies pending Prisma
  migrations (`prisma migrate deploy`), then boots Next.js. Next binds to the
  `PORT` Railway injects.
- **Health check:** `/api/health` (checks DB connectivity; returns queue mode).

## One-time setup

1. **Create a project** and connect this GitHub repo
   (`Flowfreak001/ai-design-system-generator`). Railway auto-detects `railway.json`.
2. **Add a PostgreSQL database** (New → Database → PostgreSQL). Railway exposes
   its connection string as `DATABASE_URL`.
3. **Reference `DATABASE_URL`** on the web service. In the service Variables,
   add `DATABASE_URL=${{Postgres.DATABASE_URL}}` (Railway variable reference) so
   the web service uses the database's URL.
4. **Deploy.** The first deploy runs `prisma migrate deploy`, creating the
   schema, then starts the app.

## Environment variables

| Variable         | Required | Notes                                                        |
| ---------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`   | yes      | From the Railway Postgres plugin. Never hard-code it.        |
| `REDIS_URL`      | no       | Optional. See "Queue" below.                                 |
| `OPENAI_API_KEY` | no       | Reserved for the real AI agents (not used yet).              |

## Queue / Redis

Generation is enqueued via `startGeneration()`. Behavior depends on `REDIS_URL`:

- **No Redis (`REDIS_URL` unset):** jobs run **inline** in the web process —
  generation completes within the request. Fine for small/low-volume use; no
  worker service needed.
- **With Redis (`REDIS_URL` set):** jobs are enqueued to **BullMQ** and processed
  by a separate **worker service** (below). Generation happens off the request
  thread.

### Worker service (only if using Redis)

Run a **second Railway service** from the same repo for the worker:

1. Add a **Redis** database to the project; it exposes `REDIS_URL`.
2. Create a second service pointing at this repo. In its settings:
   - **Start command:** `npm run worker`
   - **Variables:** `DATABASE_URL=${{Postgres.DATABASE_URL}}` and
     `REDIS_URL=${{Redis.REDIS_URL}}`
3. Set `REDIS_URL=${{Redis.REDIS_URL}}` on the **web** service too, so it enqueues
   to BullMQ instead of running inline.

Both services share the same code; the worker uses `tsx src/worker.ts` and only
needs `DATABASE_URL` + `REDIS_URL` (no `next build`). Optional: `WORKER_CONCURRENCY`
(default 2).

## Notes

- `prisma` and `dotenv` are runtime dependencies (not dev) because
  `prisma migrate deploy` and `prisma.config.ts` run at deploy/start time.
- Node engine is pinned to `>=20.9.0` (Next.js 16 requirement).
- No secrets are committed; everything sensitive comes from Railway env vars.

## Rendered-page probe (Playwright)

Website analysis uses a headless-Chromium probe for real rendered measurements
(computed styles, painted palette, live CTA styling). It needs a browser:

- **Local dev:** `npx playwright install chromium` (already done on this machine).
- **Railway:** the default web build has no browser — analysis automatically
  falls back to static-CSS heuristics and labels values accordingly. To enable
  the probe in production, either add `npx playwright install chromium --with-deps`
  to the build (heavier image) or run analysis on the worker service with a
  Playwright-enabled base image.
