// Redis/BullMQ queue — production transport. Only imported when REDIS_URL is
// set (see ./index.ts), so local dev never loads ioredis or BullMQ.

import { Queue, type ConnectionOptions } from "bullmq";
import IORedis from "ioredis";
import type { JobPayload } from "./index";

export const QUEUE_NAME = "adsg-jobs";

let queue: Queue | undefined;
let connection: IORedis | undefined;

export function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: null, // required by BullMQ
    });
  }
  return connection;
}

export function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      // Cast bridges bullmq's bundled-ioredis type (dual-package hazard).
      connection: getConnection() as unknown as ConnectionOptions,
    });
  }
  return queue;
}

export async function enqueueRedis(jobName: string, payload: JobPayload): Promise<string | null> {
  const job = await getQueue().add(jobName, payload);
  return job.id ?? null;
}
