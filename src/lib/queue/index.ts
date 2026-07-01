// Job queue abstraction.
//
// On Railway (REDIS_URL set) jobs are enqueued to BullMQ and processed by a
// separate worker. Locally (REDIS_URL empty — Redis can't run here without
// Docker) the same jobs execute INLINE so the app is fully functional in dev.
//
// Processors are registered per JobType and are the single source of truth for
// what a job does, regardless of transport.

import type { JobType } from "@/generated/prisma/enums";

export type JobPayload = { projectId: string; [k: string]: unknown };
export type JobProcessor = (payload: JobPayload) => Promise<void>;

const processors = new Map<JobType, JobProcessor>();

export function registerProcessor(type: JobType, fn: JobProcessor) {
  processors.set(type, fn);
}

export function hasRedis(): boolean {
  return Boolean(process.env.REDIS_URL);
}

/**
 * Enqueue a job. Returns the transport job id when using BullMQ, or null when
 * it ran inline. Callers persist a Job row separately for status tracking.
 */
export async function enqueue(type: JobType, payload: JobPayload): Promise<string | null> {
  if (hasRedis()) {
    const { getQueue } = await import("./bullmq");
    const job = await getQueue().add(type, payload);
    return job.id ?? null;
  }
  // Inline fallback — run now.
  const fn = processors.get(type);
  if (!fn) throw new Error(`No processor registered for job type "${type}"`);
  await fn(payload);
  return null;
}

/** Used by the worker process to look up a processor by type. */
export function getProcessor(type: JobType): JobProcessor | undefined {
  return processors.get(type);
}
