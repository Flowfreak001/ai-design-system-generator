import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkButton } from "@/components/ui/button";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const agencyId = user.agencyId ?? "__none__";

  const [activeProjects, files, runs, recent] = await Promise.all([
    prisma.project.count({ where: { agencyId, status: { not: "ARCHIVED" } } }),
    prisma.generatedFile.count({ where: { project: { agencyId } } }),
    prisma.agentRun.count({ where: { project: { agencyId } } }),
    prisma.project.findMany({
      where: { agencyId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { _count: { select: { files: true, workflows: true } } },
    }),
  ]);

  const stats = [
    { label: "Active projects", value: activeProjects },
    { label: "Generated files", value: files },
    { label: "Agent runs", value: runs },
    { label: "Pending approvals", value: 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <FadeUp>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">
          {user.name ? `Welcome back, ${user.name.split(" ")[0]}.` : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your workspace at a glance.
        </p>
      </FadeUp>

      <Stagger className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="card px-5 py-4">
              <p className="text-2xl font-semibold tracking-tight text-ink tnum">{s.value}</p>
              <p className="mt-1 text-[13px] text-muted">{s.label}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent projects</h2>
        <Link href="/projects" className="text-sm text-accent hover:underline">
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center px-6 py-14 text-center">
          <p className="text-sm text-muted">No projects yet.</p>
          <LinkButton href="/projects/new" className="mt-4">
            Create your first project
          </LinkButton>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
