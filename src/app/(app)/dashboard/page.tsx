// Dashboard = homebase (F-pattern): KPI strip with drill-down links up top,
// then the actionable core — a "needs attention" queue built from each
// project's derived status — with recent activity alongside. No placeholder
// metrics: sections render only when there is real data behind them.

import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { listProjects } from "@/lib/projects";
import { LinkButton } from "@/components/ui/button";
import { listClients } from "@/lib/clients";
import { NewProjectButton } from "@/components/projects/new-project-modal";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { deriveStatus, recommendedNextAction, STATUS_STYLES } from "@/lib/status";
import type { ProjectBrief } from "@/types";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const agencyId = user.agencyId ?? "__none__";
  const clientOpts = (user.agencyId ? await listClients(user.agencyId) : []).map((c) => ({ id: c.id, name: c.name }));

  const [activeClients, totalClients, files, recentRuns, projects] = await Promise.all([
    prisma.business.count({ where: { agencyId, stage: "Active" } }),
    prisma.business.count({ where: { agencyId } }),
    prisma.generatedFile.count({ where: { project: { agencyId } } }),
    prisma.agentRun.findMany({
      where: { project: { agencyId } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { project: { select: { id: true, name: true, clientName: true } } },
    }),
    user.agencyId ? listProjects(user.agencyId) : Promise.resolve([]),
  ]);

  const enriched = projects.map((p) => {
    const brief = (p.inputs[0]?.data ?? {}) as Partial<ProjectBrief>;
    const hasReferenceUrls = Boolean(
      brief.referenceUrls?.length || brief.existingWebsiteUrl || brief.competitorUrls?.length,
    );
    const input = { status: p.status, files: p.files, hasReferenceUrls };
    return {
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      updatedAt: p.updatedAt,
      derived: deriveStatus(input),
      next: recommendedNextAction(input),
    };
  });
  const attention = enriched.filter((p) => p.derived !== "Exported").slice(0, 5);
  const exported = enriched.filter((p) => p.derived === "Exported").length;
  const previewsReady = enriched.filter((p) => p.derived === "Preview Ready").length;

  const stats: { label: string; value: number; sub: string; href: string }[] = [
    { label: "Active clients", value: activeClients, sub: `${totalClients} total`, href: "/clients" },
    { label: "Projects in flight", value: enriched.length - exported, sub: `${enriched.length} total`, href: "/projects" },
    { label: "Previews ready", value: previewsReady, sub: "awaiting export", href: "/projects" },
    { label: "Files generated", value: files, sub: `${exported} exported`, href: "/projects" },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="px-5 py-8 sm:px-8">
      <PageHeader
        title={`${greeting()}, ${user.name?.split(" ")[0] ?? "there"}`}
        description={today}
        action={
          <div className="flex gap-2.5">
            <LinkButton href="/clients/new" variant="secondary">Add client</LinkButton>
            <NewProjectButton clients={clientOpts} />
          </div>
        }
      />

      {/* KPI strip — each card is a drill-down link */}
      <Stagger className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Link
              href={s.href}
              className="card block px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong"
            >
              <p className="text-[13px] text-muted">{s.label}</p>
              <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight text-ink tnum">{s.value}</p>
              <p className="mt-2 text-[12px] text-faint">{s.sub}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
        {/* Needs attention — the actionable core */}
        <FadeUp className="card">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="text-[15px] font-semibold text-ink">Needs attention</p>
              <p className="mt-0.5 text-[13px] text-muted">Projects with a recommended next step</p>
            </div>
            <Link href="/projects" className="text-[13px] font-medium text-accent hover:underline">
              All projects
            </Link>
          </div>
          {attention.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted">
                {enriched.length === 0 ? "No projects yet." : "Everything is exported — nothing waiting on you."}
              </p>
              {enriched.length === 0 && (
                <div className="mt-4"><NewProjectButton clients={clientOpts} label="Create your first project" /></div>
              )}
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {attention.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-panel/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink group-hover:text-accent">{p.name}</p>
                      <p className="truncate text-[12.5px] text-muted">{p.clientName ?? "—"}</p>
                    </div>
                    <span className={`hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[11.5px] sm:inline-flex ${STATUS_STYLES[p.derived]}`}>
                      {p.derived}
                    </span>
                    <span className="hidden w-44 shrink-0 truncate text-right text-[12.5px] text-muted md:block">
                      {p.next.title}
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </FadeUp>

        {/* Recent activity */}
        <FadeUp className="card">
          <div className="px-5 pt-5">
            <p className="text-[15px] font-semibold text-ink">Recent activity</p>
            <p className="mt-0.5 text-[13px] text-muted">Latest pipeline runs</p>
          </div>
          {recentRuns.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-faint">
              Runs appear here after your first analysis or generation.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {recentRuns.map((r) => (
                <li key={r.id}>
                  <Link href={`/projects/${r.project.id}`} className="group block px-5 py-3 transition-colors hover:bg-panel/50">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          r.status === "completed" ? "bg-success" : r.status === "failed" ? "bg-danger" : "bg-info"
                        }`}
                      />
                      <p className="min-w-0 truncate text-[13px] font-medium text-ink group-hover:text-accent">{r.name}</p>
                      <span className="ml-auto shrink-0 font-mono text-[10.5px] text-faint">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate pl-3.5 text-[12px] text-muted">
                      {r.project.clientName ? `${r.project.clientName} · ` : ""}{r.project.name}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </FadeUp>
      </div>
    </div>
  );
}
