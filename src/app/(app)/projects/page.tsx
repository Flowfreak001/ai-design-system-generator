// Projects list: a clean card grid — each project shows just its title,
// description and type. The whole card links into the workspace.

import Link from "next/link";
import { listProjects } from "@/lib/projects";
import { listClients } from "@/lib/clients";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { NewProjectButton } from "@/components/projects/new-project-modal";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";
import type { ProjectBrief } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = user.agencyId ? await listProjects(user.agencyId) : [];
  const clients = user.agencyId ? await listClients(user.agencyId) : [];
  const clientOpts = clients.map((c) => ({ id: c.id, name: c.name }));

  const cards = projects.map((p) => {
    const brief = (p.inputs[0]?.data ?? {}) as Partial<ProjectBrief>;
    // Prefer the project's goal sentence; fall back to business type/industry.
    const description =
      p.description?.trim() ||
      [brief.businessType, brief.industry].filter(Boolean).join(" · ") ||
      "No description yet.";
    return {
      id: p.id,
      name: p.name,
      description,
      type: p.type,
    };
  });

  return (
    <div className="px-5 py-8 sm:px-8">
      <PageHeader
        title="Projects"
        description={
          cards.length
            ? `${cards.length} ${cards.length === 1 ? "project" : "projects"}`
            : "Each project turns a client brief into a complete design system — files, preview, export."
        }
        action={<NewProjectButton clients={clientOpts} />}
      />

      {cards.length === 0 ? (
        <FadeUp className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-lg text-accent">◆</span>
          <h3 className="mt-5 text-lg font-semibold">Create your first design system</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            All you need to start is a business name, type, and goal. Reference
            websites and brand assets are optional — the system fills gaps with
            clear assumptions.
          </p>
          <div className="mt-6"><NewProjectButton clients={clientOpts} label="New project" size="lg" /></div>
        </FadeUp>
      ) : (
        <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((p) => (
            <StaggerItem key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="card group flex h-full flex-col p-5 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-ink group-hover:text-accent">
                    {p.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wide text-body">
                    {p.type === "WEBSITE_APP" ? "Website" : "Automation"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">
                  {p.description}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
