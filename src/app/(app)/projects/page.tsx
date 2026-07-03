// Projects list: scannable table (name/client · type · derived status ·
// files · next step · updated) matching the clients page pattern, with a
// purposeful empty state. Whole row links into the workspace.

import Link from "next/link";
import { listProjects } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/ui/motion";
import { deriveStatus, recommendedNextAction, STATUS_STYLES } from "@/lib/status";
import type { ProjectBrief } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = user.agencyId ? await listProjects(user.agencyId) : [];

  const rows = projects.map((p) => {
    const brief = (p.inputs[0]?.data ?? {}) as Partial<ProjectBrief>;
    const hasReferenceUrls = Boolean(
      brief.referenceUrls?.length || brief.existingWebsiteUrl || brief.competitorUrls?.length,
    );
    const input = { status: p.status, files: p.files, hasReferenceUrls };
    return {
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      businessType: brief.businessType ?? null,
      type: p.type,
      updatedAt: p.updatedAt,
      fileCount: p._count.files,
      derived: deriveStatus(input),
      next: recommendedNextAction(input),
    };
  });
  const inFlight = rows.filter((r) => r.derived !== "Exported").length;

  return (
    <div className="px-5 py-8 sm:px-8">
      <PageHeader
        title="Projects"
        description={
          rows.length
            ? `${rows.length} ${rows.length === 1 ? "project" : "projects"} · ${inFlight} in flight`
            : "Each project turns a client brief into a complete design system — files, preview, export."
        }
        action={<LinkButton href="/projects/new">New project</LinkButton>}
      />

      {rows.length === 0 ? (
        <FadeUp className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-lg text-accent">◆</span>
          <h3 className="mt-5 text-lg font-semibold">Create your first design system</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            All you need to start is a business name, type, and goal. Reference
            websites and brand assets are optional — the system fills gaps with
            clear assumptions.
          </p>
          <LinkButton href="/projects/new" size="lg" className="mt-6">
            New project
          </LinkButton>
        </FadeUp>
      ) : (
        <FadeUp className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[12.5px] text-muted">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium tnum">Files</th>
                <th className="px-5 py-3 font-medium">Next step</th>
                <th className="px-5 py-3 text-right font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id} className="group relative transition-colors hover:bg-panel/50">
                  <td className="px-5 py-3.5">
                    <Link href={`/projects/${p.id}`} className="block">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <span className="block font-medium text-ink group-hover:text-accent">{p.name}</span>
                      <span className="block text-[12.5px] text-muted">
                        {p.clientName ?? "—"}{p.businessType ? ` · ${p.businessType}` : ""}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-panel px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wide text-body">
                      {p.type === "WEBSITE_APP" ? "Website" : "Automation"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11.5px] ${STATUS_STYLES[p.derived]}`}>
                      {p.derived}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[13px] text-muted tnum">{p.fileCount}</td>
                  <td className="max-w-[220px] truncate px-5 py-3.5 text-[13px] text-muted">
                    {p.derived === "Exported" ? "—" : p.next.title}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[11.5px] text-faint">
                    {new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeUp>
      )}
    </div>
  );
}
