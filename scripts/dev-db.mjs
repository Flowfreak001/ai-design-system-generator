// Local userspace Postgres for development (no Docker / no sudo).
// Mirrors the Railway DATABASE_URL contract so Prisma migrate/generate work
// locally. Data persists in ./.pg-data. Port 5433 to avoid clashing with other
// local Postgres instances.
//
//   node scripts/dev-db.mjs         # start and keep running (Ctrl-C to stop)
//   node scripts/dev-db.mjs stop    # stop / release the port

import EmbeddedPostgres from "embedded-postgres";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../.pg-data");

const USER = "user";
const PASSWORD = "password";
const PORT = 5433;
const DB_NAME = "adsg";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
});

async function start() {
  if (!fs.existsSync(path.join(DATA_DIR, "PG_VERSION"))) {
    console.log("Initialising Postgres data dir at", DATA_DIR);
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}"`);
  } catch {
    console.log(`Database "${DB_NAME}" already exists`);
  }
  console.log(
    `Postgres running. DATABASE_URL=postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}?schema=public`,
  );
  console.log("Leave this process running; Ctrl-C to stop.");

  const shutdown = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function stop() {
  await pg.stop();
  console.log("Postgres stopped.");
  process.exit(0);
}

(process.argv[2] === "stop" ? stop() : start()).catch((err) => {
  console.error(err);
  process.exit(1);
});
