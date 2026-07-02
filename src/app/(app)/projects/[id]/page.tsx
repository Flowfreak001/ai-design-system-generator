import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getFileVersions, toGenerationInput } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { generateAction, deleteProjectAction, analyzeWebsiteAction, generateMdAction, generatePreviewAction } from "../actions";
import { StatusBadge, TypeBadge } from "@/components/projects/status-badge";
import { ProjectOverview } from "@/components/projects/project-overview";
import { GeneratedFilesViewer } from "@/components/projects/generated-files-viewer";
import { PreviewPanel } from "@/components/projects/preview-panel";
import { ExportPanel } from "@/components/projects/export-panel";
import { WorkflowBlueprint } from "@/components/projects/workflow-blueprint";
import { NotesSection } from "@/components/projects/notes-section";
import { AgentRunTimeline } from "@/components/projects/agent-run-timeline";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (!user.agencyId) notFound();
  const project = await getProject(id, user.agencyId);
  if (!project) notFound();

  const versions = await getFileVersions(id, user.agencyId);
  const gen = toGenerationInput(project);
  const isAutomation = project.type === "AUTOMATION_WORKFLOW";
  const workflow = project.workflows[0];

  const generate = generateAction.bind(null, id);
  const analyze = analyzeWebsiteAction.bind(null, id);
  const generateMd = generateMdAction.bind(null, id);
  const generatePreview = generatePreviewAction.bind(null, id);
  const previewHtml = project.files.find((f) => f.name === "preview.html")?.content ?? null;
  const componentHtml = project.files.find((f) => f.name === "component-preview.html")?.content ?? null;
  const analyzeUrl = project.business?.website || gen.brief.brandRefs.find((r) => /^https?:\/\//i.test(r)) || null;
  const remove = deleteProjectAction.bind(null, id);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "files", label: "Files" },
    ...(isAutomation ? [{ id: "workflow", label: "Workflow" }] : []),
    { id: "preview", label: "Preview" },
    { id: "export", label: "Export" },
    { id: "notes", label: "Notes" },
    { id: "runs", label: "Agent runs" },
    { id: "versions", label: "Versions" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-28 md:pt-32 pb-24">
      <Link href="/projects" className="text-sm text-muted transition-colors hover:text-ink">
        ← Projects
      </Link>

      {/* Header */}
      <FadeUp className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <TypeBadge type={project.type} />
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-2 text-muted">{project.clientName || "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={analyze}>
            <Button type="submit" variant="secondary" title={analyzeUrl ? `Analyzes ${analyzeUrl}` : "Uses safe fallbacks — no URL on this project"}>
              Analyze website
            </Button>
          </form>
          <form action={generateMd}>
            <Button type="submit" title="Runs the MD generator agents using project input + analysis JSON">
              Generate MD Files
            </Button>
          </form>
          <form action={generate}>
            <Button type="submit" variant="secondary">
              {project.files.length ? "Regenerate delivery files" : "Generate delivery files"}
            </Button>
          </form>
          <form action={remove}>
            <Button type="submit" variant="secondary">
              Delete
            </Button>
          </form>
        </div>
      </FadeUp>

      {/* Section nav */}
      <nav aria-label="Project sections" className="sticky top-16 z-30 mt-8 -mx-5 px-5 sm:-mx-8 sm:px-8 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <ul className="flex gap-1 overflow-x-auto py-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted transition-colors duration-200 hover:bg-panel hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="overview" title="Overview">
        <ProjectOverview
          brief={gen.brief}
          automation={gen.automation}
          description={project.description}
        />
      </Section>

      <Section id="files" title={`Generated files (${project.files.length})`}>
        <GeneratedFilesViewer files={project.files} />
      </Section>

      {isAutomation && (
        <Section id="workflow" title="Workflow blueprint">
          {workflow ? (
            <WorkflowBlueprint workflow={workflow} />
          ) : (
            <div className="card p-8 text-center text-sm text-muted">
              No workflow yet — generate files and the blueprint is drafted
              alongside them.
            </div>
          )}
        </Section>
      )}

      <Section id="preview" title="Design preview">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Rendered from the generated tokens and files — brand, palette,
            type, components, and motion notes in one visual sheet.
          </p>
          <form action={generatePreview}>
            <Button type="submit" variant="secondary">
              {previewHtml ? "Regenerate Preview" : "Generate Preview"}
            </Button>
          </form>
        </div>
        <PreviewPanel previewHtml={previewHtml} componentHtml={componentHtml} />
      </Section>

      <Section id="export" title="Export">
        <ExportPanel
          projectId={id}
          files={project.files.map((f) => ({ id: f.id, name: f.name, type: f.type, content: f.content }))}
        />
      </Section>

      <Section id="notes" title="Notes & decisions">
        <NotesSection projectId={id} notes={project.notes} />
      </Section>

      <Section id="runs" title="Agent runs">
        <AgentRunTimeline runs={project.agentRuns} />
      </Section>

      <Section id="versions" title="Versions & activity">
        {versions.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">
            No versions yet. Every generation snapshots each file.
          </div>
        ) : (
          <div className="card divide-y divide-line">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="truncate font-mono text-xs text-ink">{v.file.name}</span>
                <span className="flex shrink-0 items-center gap-4 font-mono text-[11px] text-faint">
                  <span className="rounded bg-panel px-1.5 py-0.5">v{v.version}</span>
                  {new Date(v.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
