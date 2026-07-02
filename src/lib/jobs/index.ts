// Job orchestration. Registers the GENERATE processor (shared by the mock/inline
// queue and the Redis worker) and exposes startGeneration(). Importing this
// module registers the processor as a side effect.

import { prisma } from "@/lib/db/client";
import { registerProcessor, enqueue, type JobPayload } from "@/lib/queue";
import { runGeneration } from "@/lib/generation";

export const GENERATE_JOB = "GENERATE";

registerProcessor(GENERATE_JOB, async (payload: JobPayload) => {
  await runGeneration(payload.projectId);
});

/**
 * Kick off generation. Marks the project IN_PROGRESS immediately, then enqueues.
 * - No Redis: runs inline (files ready when this resolves).
 * - Redis set: the worker processes it asynchronously.
 */
export async function startGeneration(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "IN_PROGRESS" },
  });
  return enqueue(GENERATE_JOB, { projectId });
}
