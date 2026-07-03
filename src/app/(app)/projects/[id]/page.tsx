import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getFileVersions, toGenerationInput } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { deriveStatus, recommendedNextAction, STATUS_STYLES } from "@/lib/status";
import {
  generateAction,
  deleteProjectAction,
  analyzeWebsiteAction,
  updateReferencesAction,
  generateMdAction,
  generatePreviewAction,
  saveScreenshotsAction,
  runAiVisionAction,
} from "../actions";
import { TypeBadge } from "@/components/projects/status-badge";
import { GeneratedFilesViewer } from "@/components/projects/generated-files-viewer";
import { PreviewPanel } from "@/components/projects/preview-panel";
import { ExportPanel } from "@/components/projects/export-panel";
import { WorkflowBlueprint } from "@/components/projects/workflow-blueprint";
import { NotesSection } from "@/components/projects/notes-section";
import { AgentRunTimeline } from "@/components/projects/agent-run-timeline";
import { WorkspaceTabs } from "@/components/projects/workspace-tabs";
import { ActionDialog } from "@/components/projects/action-dialog";
import { ReferencesEditor } from "@/components/projects/references-editor";
import { ScreenshotUpload } from "@/components/projects/screenshot-upload";
import { prisma } from "@/lib/db/client";
import { hasOpenAIKey } from "@/lib/ai/openai-client";
import type { Screenshot } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

const ANALYSIS_NAMES = [
  "WEBSITE_ANALYSIS.json",
  "VISUAL_ANALYSIS.json",
  "DESIGN_TOKENS.json",
  "ANIMATION_ANALYSIS.json",
  "RENDERED_STYLE_ANALYSIS.json",
  "SCROLL_ANIMATION_ANALYSIS.json",
  "MULTI_PAGE_WEBSITE_ANALYSIS.json",
  "AI_SCREENSHOT_ANALYSIS.json",
];

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3 py-2 text-sm">
      <dt className="font-mono text-[11px] uppercase tracking-wider text-faint pt-0.5">{label}</dt>
      <dd className="text-body">{value?.trim() || <span className="text-faint">— will be assumed</span>}</dd>
    </div>
  );
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (!user.agencyId) notFound();
  const project = await getProject(id, user.agencyId);
  if (!project) notFound();
  const screenshotInput = await prisma.projectInput.findFirst({ where: { projectId: id, category: "screenshots" } });
  const screenshots = ((screenshotInput?.data as { shots?: Screenshot[] } | null)?.shots ?? []) as Screenshot[];
  const lastVisionRun = await prisma.agentRun.findFirst({
    where: { projectId: id, name: "AI Vision analysis" },
    orderBy: { createdAt: "desc" },
    select: { status: true, output: true, createdAt: true },
  });
  const aiStatus = {
    keyConfigured: hasOpenAIKey(),
    screenshots: screenshots.length,
    lastRunStatus: lastVisionRun?.status ?? null,
    lastRunError: (lastVisionRun?.output as { error?: string } | null)?.error ?? null,
    lastRunSource: (lastVisionRun?.output as { source?: string } | null)?.source ?? null,
  };

  const versions = await getFileVersions(id, user.agencyId);
  const gen = toGenerationInput(project);
  const b = gen.brief;
  const isAutomation = project.type === "AUTOMATION_WORKFLOW";
  const workflow = project.workflows[0];

  const refUrls = [
    ...(b.existingWebsiteUrl ? [{ label: "Existing website", url: b.existingWebsiteUrl }] : []),
    ...b.referenceUrls.map((u) => ({ label: "Reference", url: u })),
    ...b.competitorUrls.map((u) => ({ label: "Competitor", url: u })),
  ];
  const hasReferenceUrls = refUrls.length > 0 || Boolean(project.business?.website);

  const statusInput = { status: project.status, files: project.files, hasReferenceUrls };
  const status = deriveStatus(statusInput);
  const next = recommendedNextAction(statusInput);

  const analysisFiles = project.files.filter((f) => ANALYSIS_NAMES.includes(f.name));
  const docFiles = project.files.filter(
    (f) => !ANALYSIS_NAMES.includes(f.name) && !f.name.endsWith(".html"),
  );
  const previewHtml = project.files.find((f) => f.name === "preview.html")?.content ?? null;
  const componentHtml =
    project.files.find((f) => f.name === "component-preview.html")?.content ?? null;

  const generateMd = generateMdAction.bind(null, id);
  const generatePreview = generatePreviewAction.bind(null, id);
  const analyze = analyzeWebsiteAction.bind(null, id);
  const runAiVision = runAiVisionAction.bind(null, id);
  const updateReferences = updateReferencesAction.bind(null, id);
  const generateDelivery = generateAction.bind(null, id);
  const remove = deleteProjectAction.bind(null, id);

  const timeline = [
    { label: "Created", done: true },
    { label: "Files generated", done: docFiles.length > 0 },
    { label: "Preview ready", done: Boolean(previewHtml) },
    { label: "Exported", done: project.status === "DELIVERED" },
  ];

  const nextForm =
    next.action === "generate-md" ? generateMd : next.action === "generate-preview" ? generatePreview : null;

  const overview = (
    <div className="grid gap-4">
      {/* Recommended next action */}
      <FadeUp className="card flex flex-wrap items-center justify-between gap-4 border-accent/25 bg-accent-soft/40 p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Recommended next step</p>
          <p className="mt-1 text-[15px] font-semibold text-ink">{next.title}</p>
          <p className="mt-0.5 max-w-xl text-[13px] text-body">{next.description}</p>
        </div>
        {nextForm ? (
          <ActionDialog
            projectId={id}
            trigger="button"
            title={next.title}
            description={next.description}
            confirmText={`${next.description} Run it now?`}
            runName={next.action === "generate-md" ? "MD design-system generation" : "Preview generation"}
            action={nextForm}
          />
        ) : (
          <ActionDialog
            projectId={id}
            trigger="button"
            title="Download ZIP"
            description="Full package — brief, analysis, design system, prompts, and preview."
            confirmText="Download the full export package and mark this project as Exported?"
            downloadHref={`/api/projects/${id}/export`}
          />
        )}
      </FadeUp>

      {/* Status timeline */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-ink">Progress</p>
        <ol className="mt-4 flex flex-wrap items-center gap-2">
          {timeline.map((t, i) => (
            <li key={t.label} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  t.done ? "bg-success-soft text-success" : "bg-panel text-faint"
                }`}
              >
                {t.done ? "✓" : i + 1} {t.label}
              </span>
              {i < timeline.length - 1 && <span className="h-px w-6 bg-line" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>

      {/* Quick actions — uniform cards; each confirms in a dialog and shows
          its live progress there, so the grid never stretches mid-run. */}
      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionDialog
          projectId={id}
          title="Analyze References"
          description="Scan the reference site for tokens, metrics, and motion"
          confirmText="Scan the reference website in a real browser and refresh the four analysis files (palette, typography, metrics, animation). Existing analysis is versioned, not lost. Run it now?"
          runName="Website analysis run"
          action={analyze}
          disabledNote={hasReferenceUrls ? undefined : "Add reference URLs to improve design accuracy."}
        />
        <ActionDialog
          projectId={id}
          title="Generate MD Files"
          description="8 design-system files from the brief + analysis"
          confirmText="Generate the 8 MD design-system files from the project brief and latest analysis. Existing files get a new version. Run it now?"
          runName="MD design-system generation"
          action={generateMd}
        />
        <ActionDialog
          projectId={id}
          title="Generate Preview"
          description="Visual specimen sheet from tokens + files"
          confirmText="Render the branded preview and component sheet from the current tokens and files. Run it now?"
          runName="Preview generation"
          action={generatePreview}
        />
        <ActionDialog
          projectId={id}
          title="Export Files"
          description="Full ZIP package for your build tool"
          confirmText="Download the full export package (brief, analysis, design system, prompts, preview) and mark this project as Exported?"
          downloadHref={`/api/projects/${id}/export`}
        />
      </div>

      {/* Summary */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-ink">Project summary</p>
        <dl className="mt-2 divide-y divide-line">
          <Row label="Business" value={`${gen.clientName ?? ""}${b.businessType ? ` · ${b.businessType}` : ""}`} />
          <Row label="Goal" value={b.goal} />
          <Row label="Audience" value={b.targetAudience} />
          <Row label="Pages" value={b.keyItems.join(", ")} />
          <Row label="Platform" value={b.platformTarget} />
        </dl>
      </div>

      {isAutomation && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Workflow blueprint</p>
            <form action={generateDelivery}>
              <Button type="submit" variant="ghost">Generate delivery docs</Button>
            </form>
          </div>
          <div className="mt-4">
            {workflow ? (
              <WorkflowBlueprint workflow={workflow} />
            ) : (
              <p className="text-sm text-muted">Generate delivery docs to draft the workflow.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const inputs = (
    <div className="card p-5">
      <dl className="divide-y divide-line">
        <Row label="Business name" value={gen.clientName} />
        <Row label="Business type" value={b.businessType} />
        <Row label="Website goal" value={b.goal} />
        <Row label="Target audience" value={b.targetAudience} />
        <Row label="Style preference" value={b.stylePreference} />
        <Row label="Primary color" value={b.primaryColor} />
        <Row label="Secondary color" value={b.secondaryColor} />
        <Row label="Font preference" value={b.fontPreference} />
        <Row label="Brand personality" value={b.brandPersonality} />
        <Row label="Tone of voice" value={b.toneOfVoice} />
        <Row label="Required pages" value={b.keyItems.join(", ")} />
        <Row label="Services / products" value={b.services} />
        <Row label="CTA goal" value={b.ctaGoal} />
        <Row label="SEO keywords" value={b.seoKeywords.join(", ")} />
        <Row label="Platform target" value={b.platformTarget} />
        <Row label="Animation preference" value={b.animationPreference} />
        <Row label="Notes" value={b.notes} />
      </dl>
    </div>
  );

  const references = (
    <div className="grid gap-4">
      <ReferencesEditor
        projectId={id}
        existingWebsiteUrl={b.existingWebsiteUrl ?? undefined}
        referenceUrls={b.referenceUrls}
        competitorUrls={b.competitorUrls}
        save={updateReferences}
        analyze={analyze}
      />
      <ScreenshotUpload projectId={id} initial={screenshots} save={saveScreenshotsAction} />
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-ink">AI Vision analysis</p>
          <p className="mt-0.5 max-w-xl text-[13px] text-muted">
            {screenshots.length
              ? "Analyze your section screenshots with OpenAI Vision — layout, hierarchy, and component structure. Computed styles stay the factual source; Vision adds visual interpretation."
              : "Add or capture section screenshots first for AI Vision analysis."}
          </p>
        </div>
        <ActionDialog
          projectId={id}
          trigger="button"
          title="Run AI Vision Analysis"
          description="Analyze section screenshots with OpenAI Vision."
          confirmText="Run OpenAI Vision on the uploaded screenshots and save AI_SCREENSHOT_ANALYSIS.json? Runs server-side; needs OPENAI_API_KEY set (falls back cleanly if not)."
          runName="AI Vision analysis"
          action={runAiVision}
          disabledNote={screenshots.length ? undefined : "Add section screenshots above to enable AI Vision analysis."}
        />
      </div>
    </div>
  );

  const hasVisionFile = analysisFiles.some((f) => f.name === "AI_SCREENSHOT_ANALYSIS.json");
  const StatusDot = ({ ok }: { ok: boolean }) => (
    <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-success" : "bg-faint"}`} />
  );
  const aiDebugPanel = (
    <div className="card p-5">
      <p className="text-sm font-semibold text-ink">AI Vision status</p>
      <p className="mt-0.5 text-[13px] text-muted">Diagnostics for the OpenAI Vision flow. The API key is never shown.</p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-[13px]">
          <StatusDot ok={aiStatus.keyConfigured} />
          <span className="text-muted">OpenAI key configured:</span>
          <span className="font-medium text-ink">{aiStatus.keyConfigured ? "Yes" : "No (fallback mode)"}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <StatusDot ok={aiStatus.screenshots > 0} />
          <span className="text-muted">Screenshots available:</span>
          <span className="font-medium text-ink">{aiStatus.screenshots}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <StatusDot ok={hasVisionFile} />
          <span className="text-muted">Vision analysis available:</span>
          <span className="font-medium text-ink">{hasVisionFile ? `Yes${aiStatus.lastRunSource ? ` (${aiStatus.lastRunSource})` : ""}` : "No"}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <StatusDot ok={aiStatus.lastRunStatus === "completed"} />
          <span className="text-muted">Last Vision run:</span>
          <span className="font-medium text-ink">{aiStatus.lastRunStatus ?? "never run"}</span>
        </div>
      </dl>
      {aiStatus.lastRunError && (
        <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">Last error: {aiStatus.lastRunError}</p>
      )}
      {!aiStatus.keyConfigured && (
        <p className="mt-3 text-[12.5px] text-muted">
          Set <code className="font-mono">OPENAI_API_KEY</code> (Railway → App service → Variables) to run real OpenAI Vision. Without it, the flow returns a clearly-labelled fallback.
        </p>
      )}
    </div>
  );

  const analysis = (
    <div className="grid gap-4">
      {aiDebugPanel}
      {analysisFiles.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <p className="text-sm font-medium text-ink">No analysis yet — and that&apos;s fine</p>
          <p className="mt-1 max-w-md text-sm text-muted">
            MD generation works from your inputs alone. Running analysis on
            reference URLs adds real colors, structure, and animation data.
          </p>
          {hasReferenceUrls && (
            <div className="mt-5 w-full max-w-md">
              <ActionDialog
                projectId={id}
                trigger="button"
                title="Analyze References"
                description="Scan the reference site for tokens, metrics, and motion."
                confirmText="Scan the reference website in a real browser and generate the four analysis files. Run it now?"
                runName="Website analysis run"
                action={analyze}
              />
            </div>
          )}
        </div>
      ) : (
        <GeneratedFilesViewer files={analysisFiles} />
      )}
    </div>
  );

  const filesPanel = <GeneratedFilesViewer files={docFiles} />;

  const preview = (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Rendered from the generated tokens and files.</p>
        <ActionDialog
          projectId={id}
          trigger="button"
          title={previewHtml ? "Regenerate Preview" : "Generate Preview"}
          description="Render the branded preview and component sheet from the current tokens and files."
          confirmText="Render the branded preview and component sheet from the current tokens and files. Run it now?"
          runName="Preview generation"
          action={generatePreview}
        />
      </div>
      <PreviewPanel previewHtml={previewHtml} componentHtml={componentHtml} />
    </div>
  );

  const exportPanel = (
    <ExportPanel
      projectId={id}
      files={project.files.map((f) => ({ id: f.id, name: f.name, type: f.type, content: f.content }))}
    />
  );

  const activity = (
    <div className="grid gap-6">
      <AgentRunTimeline runs={project.agentRuns} />
      {versions.length > 0 && (
        <div className="card divide-y divide-line">
          {versions.slice(0, 20).map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-4 px-5 py-2.5">
              <span className="truncate font-mono text-xs text-ink">{v.file.name}</span>
              <span className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-faint">
                <span className="rounded bg-panel px-1.5 py-0.5">v{v.version}</span>
                {new Date(v.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/projects" className="hover:text-ink">Projects</Link>
        <span className="mx-2 text-faint">/</span>
        <span className="text-ink">{project.name}</span>
      </nav>

      <FadeUp className="mt-4 flex flex-wrap items-start justify-between gap-4 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{project.name}</h2>
            <TypeBadge type={project.type} />
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${STATUS_STYLES[status]}`}>
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{project.clientName || "—"}</p>
        </div>
        <form action={remove}>
          <Button type="submit" variant="ghost">Delete</Button>
        </form>
      </FadeUp>

      <WorkspaceTabs
        panels={[
          { id: "overview", label: "Overview", content: overview },
          { id: "inputs", label: "Inputs", content: inputs },
          { id: "references", label: "References", badge: refUrls.length, content: references },
          { id: "analysis", label: "Analysis", badge: analysisFiles.length, content: analysis },
          { id: "files", label: "Generated Files", badge: docFiles.length, content: filesPanel },
          { id: "preview", label: "Preview", content: preview },
          { id: "export", label: "Export", content: exportPanel },
          { id: "notes", label: "Notes", badge: project.notes.length, content: <NotesSection projectId={id} notes={project.notes} /> },
          { id: "activity", label: "Activity", content: activity },
        ]}
      />
    </div>
  );
}
