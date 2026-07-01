import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { hasRedis } from "@/lib/queue";

// Liveness + dependency check. Confirms the DB is reachable and reports whether
// the queue is in BullMQ mode (Redis present) or inline mode (local dev).
export async function GET() {
  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    db = false;
  }

  return NextResponse.json({
    ok: db,
    db,
    queue: hasRedis() ? "bullmq" : "inline",
  });
}
