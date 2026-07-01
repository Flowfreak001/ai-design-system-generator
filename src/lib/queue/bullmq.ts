// BullMQ transport — only imported when REDIS_URL is set (see ./index.ts).
// Kept isolated so the local/inline path never loads ioredis or BullMQ.

import { Queue, type ConnectionOptions } from "bullmq";
import IORedis from "ioredis";

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
    // Cast bridges the dual-package ioredis type mismatch (bullmq bundles its
    // own ioredis copy); the instance is runtime-compatible.
    queue = new Queue(QUEUE_NAME, {
      connection: getConnection() as unknown as ConnectionOptions,
    });
  }
  return queue;
}
