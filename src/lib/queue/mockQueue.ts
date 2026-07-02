// Mock queue — local development transport. Runs the registered processor
// inline (awaited) so the app is fully functional without Redis. Returns null
// (no external job id) to signal inline execution.

import { getProcessor, type JobPayload } from "./index";

export async function enqueueMock(jobName: string, payload: JobPayload): Promise<null> {
  const fn = getProcessor(jobName);
  if (!fn) throw new Error(`No processor registered for job "${jobName}"`);
  await fn(payload);
  return null;
}
