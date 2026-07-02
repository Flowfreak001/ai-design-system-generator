// BullMQ worker entrypoint — a standalone process (its own Railway service).
// Consumes the job queue and runs the registered processors. Only meaningful
// when REDIS_URL is set; without it, jobs run inline in the web process and no
// worker is needed.
//
// Run: npm run worker   (locally requires a reachable REDIS_URL)

import "dotenv/config";
import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAME, getConnection } from "@/lib/queue/redisQueue";
import { getProcessor } from "@/lib/queue";
import "@/lib/jobs"; // side effect: registers processors

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL is required to run the worker. Exiting.");
  process.exit(1);
}

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const fn = getProcessor(job.name);
    if (!fn) throw new Error(`No processor registered for "${job.name}"`);
    await fn(job.data);
  },
  {
    // Cast bridges bullmq's bundled-ioredis type (dual-package hazard).
    connection: getConnection() as unknown as ConnectionOptions,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
  },
);

worker.on("completed", (job) => console.log(`[worker] completed job ${job.id} (${job.name})`));
worker.on("failed", (job, err) =>
  console.error(`[worker] failed job ${job?.id} (${job?.name}):`, err?.message),
);

console.log(`[worker] listening on queue "${QUEUE_NAME}"`);

async function shutdown() {
  console.log("[worker] shutting down…");
  await worker.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
