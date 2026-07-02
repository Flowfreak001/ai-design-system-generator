// Queue abstraction.
//
// Local dev has no Redis, so jobs run through the MOCK queue (inline execution).
// In production, setting REDIS_URL switches to the Redis/BullMQ queue processed
// by the worker (src/worker.ts). Callers use the same `enqueue()` either way;
// swapping transports never touches call sites.

export type JobPayload = { projectId: string; [k: string]: unknown };
export type JobProcessor = (payload: JobPayload) => Promise<void>;

const processors = new Map<string, JobProcessor>();

export function registerProcessor(jobName: string, fn: JobProcessor) {
  processors.set(jobName, fn);
}

export function getProcessor(jobName: string): JobProcessor | undefined {
  return processors.get(jobName);
}

export function hasRedis(): boolean {
  return Boolean(process.env.REDIS_URL);
}

/**
 * Enqueue a job. Returns the transport job id (Redis) or null (ran inline).
 */
export async function enqueue(jobName: string, payload: JobPayload): Promise<string | null> {
  if (hasRedis()) {
    const { enqueueRedis } = await import("./redisQueue");
    return enqueueRedis(jobName, payload);
  }
  const { enqueueMock } = await import("./mockQueue");
  return enqueueMock(jobName, payload);
}
