// Job orchestration. Registers processors (shared by the inline path and the
// BullMQ worker) and exposes typed enqueue helpers that also track a Job row.
//
// Importing this module registers the processors as a side effect — both the
// web app (inline execution) and the worker entrypoint import it.

import { prisma } from "@/lib/db/client";
import { registerProcessor, enqueue, type JobPayload } from "@/lib/queue";
import { generateMockFiles } from "@/lib/projects";
import { JobType, JobStatus } from "@/generated/prisma/enums";

// ---- Processor registration --------------------------------------------

registerProcessor(JobType.GENERATE, async (payload: JobPayload) => {
  const { projectId } = payload;
  const jobId = payload.jobId as string | undefined;

  if (jobId) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.RUNNING, startedAt: new Date() },
    });
  }

  try {
    await generateMockFiles(projectId);
    if (jobId) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JobStatus.COMPLETED, progress: 100, finishedAt: new Date() },
      });
    }
  } catch (err) {
    if (jobId) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          error: err instanceof Error ? err.message : String(err),
          finishedAt: new Date(),
        },
      });
    }
    await prisma.project
      .update({ where: { id: projectId }, data: { status: "FAILED" } })
      .catch(() => {});
    throw err; // let BullMQ mark the job failed too
  }
});

// ---- Public API ---------------------------------------------------------

/**
 * Kick off generation for a project. Creates a Job row, then enqueues.
 * - No Redis: runs inline; the Job is already COMPLETED when this returns.
 * - Redis set: enqueues to BullMQ; the worker processes it asynchronously.
 */
export async function startGeneration(projectId: string) {
  // Reflect "in progress" immediately in the UI, even before the worker runs.
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "GENERATING" },
  });

  const job = await prisma.job.create({
    data: { projectId, type: JobType.GENERATE, status: JobStatus.QUEUED },
  });

  const queueJobId = await enqueue(JobType.GENERATE, { projectId, jobId: job.id });

  if (queueJobId) {
    await prisma.job.update({
      where: { id: job.id },
      data: { queueJobId },
    });
  }

  return job;
}
