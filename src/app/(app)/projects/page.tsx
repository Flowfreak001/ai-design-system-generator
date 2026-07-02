import { listProjects } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkButton } from "@/components/ui/button";
import { FadeUp, Stagger, StaggerItem } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = user.agencyId ? await listProjects(user.agencyId) : [];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-28 md:pt-32 pb-24">
      <FadeUp className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 text-muted">
            Client builds and automation workflows, from brief to handoff.
          </p>
        </div>
        <LinkButton href="/projects/new">New project</LinkButton>
      </FadeUp>

      {projects.length === 0 ? (
        <FadeUp className="card mt-12 flex flex-col items-center justify-center px-6 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-line-strong bg-panel text-accent text-lg">
            ◆
          </span>
          <h2 className="mt-5 text-lg font-semibold">No projects yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Create your first project — a website/app build or a small-business
            automation workflow.
          </p>
          <LinkButton href="/projects/new" className="mt-6">
            Create your first project
          </LinkButton>
        </FadeUp>
      ) : (
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <StaggerItem key={p.id}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
