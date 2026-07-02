import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ownsProject } from "@/lib/projects";
import { prisma } from "@/lib/db/client";

// GET /api/projects/:id/run-status?name=<runName>&since=<iso>
// Returns the latest matching AgentRun (created after `since`, if given) with
// its steps — polled by the UI to render live pipeline progress.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await auth();
  if (!user?.agencyId || !(await ownsProject(id, user.agencyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const name = url.searchParams.get("name") ?? undefined;
  const since = url.searchParams.get("since");

  const run = await prisma.agentRun.findFirst({
    where: {
      projectId: id,
      ...(name ? { name } : {}),
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { steps: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json(
    run
      ? {
          id: run.id,
          name: run.name,
          status: run.status,
          steps: run.steps.map((s) => ({
            id: s.id,
            title: s.title,
            status: s.status,
            detail: s.detail,
          })),
        }
      : null,
    { headers: { "Cache-Control": "no-store" } },
  );
}
