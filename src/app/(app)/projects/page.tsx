import Link from "next/link";
import { listProjects } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkButton } from "@/components/ui/button";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { deriveStatus } from "@/lib/status";
import type { ProjectBrief } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const [projects, recentRuns] = await Promise.all([
    user.agencyId ? listProjects(user.agencyId) : Promise.resolve([]),
    user.agencyId
      ? prisma.agentRun.findMany({
          where: { project: { agencyId: user.agencyId } },
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { project: { select: { id: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const cards = projects.map((p) => {
    const brief = (p.inputs[0]?.data ?? {}) as Partial<ProjectBrief>;
    const hasReferenceUrls = Boolean(
      brief.referenceUrls?.length || brief.existingWebsiteUrl || brief.competitorUrls?.length,
    );
    return {
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      businessType: brief.businessType ?? null,
      type: p.type,
      updatedAt: p.updatedAt,
      fileCount: p._count.files,
      hasReferenceUrls,
      derivedStatus: deriveStatus({ status: p.status, files: p.files, hasReferenceUrls }),
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
      <FadeUp className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-semibold tracking-[-0.02em]">Projects</h2>
          <p className="mt-1 max-w-lg text-sm text-muted">
            Each project turns a client brief into a complete design system —
            files, preview, and an export package for your build tool.
          </p>
        </div>
        <LinkButton href="/projects/new" size="lg">
          Create New Design System
        </LinkButton>
      </FadeUp>

      {cards.length === 0 ? (
        <FadeUp className="card mt-10 flex flex-col items-center px-6 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-lg text-accent">◆</span>
          <h3 className="mt-5 text-lg font-semibold">Create your first design system</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            All you need to start is a business name, type, and website goal.
            Reference websites and brand assets are optional — the system fills
            gaps with clear assumptions.
          </p>
          <LinkButton href="/projects/new" size="lg" className="mt-6">
            Create New Design System
          </LinkButton>
        </FadeUp>
      ) : (
        <>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Create tile — always first */}
            <StaggerItem>
              <Link
                href="/projects/new"
                className="flex h-full min-h-[210px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-surface/60 p-5 text-center transition-colors duration-200 hover:border-accent/50 hover:bg-accent-soft/40"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-white text-xl">+</span>
                <span className="text-sm font-semibold text-ink">New design system</span>
                <span className="text-xs text-muted">Brief → files → preview → export</span>
              </Link>
            </StaggerItem>
            {cards.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </Stagger>

          {/* Recent activity */}
          <FadeUp className="card mt-8 p-6">
            <p className="text-[15px] font-semibold text-ink">Recent activity</p>
            {recentRuns.length === 0 ? (
              <p className="py-8 text-center text-sm text-faint">
                Activity appears here after your first generation run.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {recentRuns.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/projects/${r.project.id}`} className="min-w-0 truncate text-sm text-ink hover:text-accent">
                      {r.name} <span className="text-muted">· {r.project.name}</span>
                    </Link>
                    <span className="shrink-0 font-mono text-[11px] text-faint">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </FadeUp>
        </>
      )}
    </div>
  );
}
