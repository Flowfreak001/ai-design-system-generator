import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { generateAction, deleteProjectAction } from "../actions";
import { StatusBadge } from "@/components/projects/status-badge";
import { ProjectOverview } from "@/components/projects/project-overview";
import { GeneratedFilesViewer } from "@/components/projects/generated-files-viewer";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const latestRun = project.agentRuns[0];
  const generate = generateAction.bind(null, id);
  const remove = deleteProjectAction.bind(null, id);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-28 md:pt-32 pb-24">
      <Link href="/projects" className="text-sm text-muted transition-colors hover:text-ink">
        ← Projects
      </Link>

      {/* Header */}
      <FadeUp className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-2 text-muted">
            {project.clientName || "—"}
            {project.businessType ? ` · ${project.businessType}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={generate}>
            <Button type="submit">
              {project.files.length ? "Regenerate files" : "Generate files"}
            </Button>
          </form>
          <form action={remove}>
            <Button type="submit" variant="secondary">
              Delete
            </Button>
          </form>
        </div>
      </FadeUp>

      {/* Overview + agent workflow */}
      <div className="mt-10">
        <ProjectOverview input={project.input} run={latestRun} />
      </div>

      {/* Generated files */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Generated files{" "}
            <span className="font-mono text-sm text-faint">({project.files.length})</span>
          </h2>
        </div>
        <div className="mt-5">
          <GeneratedFilesViewer files={project.files} />
        </div>
      </section>

      {/* Preview + export */}
      <section className="mt-12 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <p className="eyebrow">Design preview</p>
          <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-line">
            <div className="aurora flex h-full w-full flex-col items-center justify-center gap-3 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-white">
                ◆
              </span>
              <p className="text-sm text-muted">
                {project.status === "READY"
                  ? "Rendered preview appears here once wired to preview.html."
                  : "Generate files to unlock the design preview."}
              </p>
            </div>
          </div>
        </div>

        <div className="card flex flex-col p-6">
          <p className="eyebrow">Export</p>
          <p className="mt-4 flex-1 text-sm text-muted">
            Download the full design system as a package for your build tool.
            Export is coming next — for now, copy any file from the viewer.
          </p>
          <Button variant="secondary" disabled className="mt-6 w-fit opacity-60">
            Export package (soon)
          </Button>
        </div>
      </section>
    </div>
  );
}
