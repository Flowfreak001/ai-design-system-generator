import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const CHIP_STYLES: Record<string, string> = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const agencyId = user.agencyId ?? "__none__";

  const [activeClients, totalClients, openProjects, files, recentRuns] = await Promise.all([
    prisma.business.count({ where: { agencyId, stage: "Active" } }),
    prisma.business.count({ where: { agencyId } }),
    prisma.project.count({ where: { agencyId, status: { in: ["DRAFT", "IN_PROGRESS", "REVIEW"] } } }),
    prisma.generatedFile.count({ where: { project: { agencyId } } }),
    prisma.agentRun.findMany({
      where: { project: { agencyId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { id: true, name: true, clientName: true } } },
    }),
  ]);

  const stats = [
    { label: "Active Clients", value: activeClients, sub: `${totalClients} total`, tone: "info", icon: "👥" },
    { label: "Open Projects", value: openProjects, sub: openProjects ? "In delivery" : "None open", tone: "warning", icon: "▣" },
    { label: "Pending Approvals", value: 0, sub: "All on track", tone: "danger", icon: "!" },
    { label: "Generated Files", value: files, sub: "Across all projects", tone: "success", icon: "↗" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
      {/* Greeting */}
      <FadeUp className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-semibold tracking-[-0.02em]">
            {greeting()}, {user.name?.split(" ")[0] ?? "there"}
          </h2>
          <p className="mt-1 text-[15px] text-muted">
            Here&apos;s what&apos;s happening across your agency today.
          </p>
        </div>
        <LinkButton href="/clients/new">+ Add Client</LinkButton>
      </FadeUp>

      {/* Stat cards */}
      <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <Card className="gap-0 py-5">
              <CardContent className="px-5">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-muted">{s.label}</p>
                  <span
                    aria-hidden="true"
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm ${CHIP_STYLES[s.tone]}`}
                  >
                    {s.icon}
                  </span>
                </div>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-ink tnum">{s.value}</p>
                <Separator className="my-2.5" />
                <p className="text-[13px] text-faint">{s.sub}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Activity + upcoming */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <p className="text-[15px] font-semibold text-ink">Recent Activity</p>
          <p className="mt-0.5 text-[13px] text-muted">Latest agent runs across your clients</p>
          {recentRuns.length === 0 ? (
            <p className="py-14 text-center text-sm text-faint">No recent activity yet.</p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {recentRuns.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${r.project.id}`}
                      className="block truncate text-sm font-medium text-ink hover:text-accent"
                    >
                      {r.name}
                    </Link>
                    <p className="truncate text-[13px] text-muted">
                      {r.project.clientName ?? "—"} · {r.project.name}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-faint">
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <p className="text-[15px] font-semibold text-ink">Pending Approvals</p>
          <p className="mt-0.5 text-[13px] text-muted">Items waiting on a human decision</p>
          <p className="py-14 text-center text-sm text-faint">
            Nothing waiting — approvals appear here once workflows run.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/clients" label="Manage Clients" />
        <QuickLink href="/projects/new" label="New Project" />
        <QuickLink href="/projects" label="All Projects" />
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-panel text-muted">↗</span>
      <span className="text-sm font-medium text-ink">{label}</span>
    </Link>
  );
}
