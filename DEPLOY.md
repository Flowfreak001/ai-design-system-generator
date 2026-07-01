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

Background generation currently runs **synchronously inside the request** — the
BullMQ path is scaffolded but not yet on the critical path. So:

- You do **not** need Redis to run the app. Leave `REDIS_URL` unset and jobs run
  inline.
- If you add a Railway Redis database and set `REDIS_URL`, `enqueue()` will start
  using BullMQ — but a **worker service** to consume the queue isn't built yet.
  Until it is, keep `REDIS_URL` unset (or expect enqueued jobs to sit unprocessed).

## Notes

- `prisma` and `dotenv` are runtime dependencies (not dev) because
  `prisma migrate deploy` and `prisma.config.ts` run at deploy/start time.
- Node engine is pinned to `>=20.9.0` (Next.js 16 requirement).
- No secrets are committed; everything sensitive comes from Railway env vars.
