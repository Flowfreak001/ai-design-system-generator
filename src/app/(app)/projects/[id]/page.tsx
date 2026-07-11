import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getFileVersions, toGenerationInput } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { deriveStatus, STATUS_STYLES } from "@/lib/status";
import {
  generateAction,
  deleteProjectAction,
  updateReferencesAction,
  saveScreenshotsAction,
  updateBriefAction,
} from "../actions";
import {
  addPageAction,
  renamePageAction,
  removePageAction,
  removeSectionFromPageAction,
  addLibrarySectionToPageAction,
} from "./editor/actions";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { WixPublishButton } from "@/components/projects/wix-publish-button";
import { WixExportButton } from "@/components/projects/wix-export-button";
import { WixConnectPanel } from "@/components/projects/wix-connect-panel";
import { getWixConnection } from "@/lib/integrations/wix/connection-store";
import { TypeBadge } from "@/components/projects/status-badge";
import { WorkflowBlueprint } from "@/components/projects/workflow-blueprint";
import { NotesSection } from "@/components/projects/notes-section";
import { AgentRunTimeline } from "@/components/projects/agent-run-timeline";
import { WorkspaceTabs } from "@/components/projects/workspace-tabs";
import { ReferencesEditor } from "@/components/projects/references-editor";
import { ScreenshotUpload } from "@/components/projects/screenshot-upload";
import { ProjectSetup, type SetupPage } from "@/components/projects/project-setup";
import { ProjectBrief } from "@/components/projects/project-brief";
import { SITEMAP_CANVAS_FILE, type SitemapCanvas } from "@/lib/canvas";
import { seedBuiltinsForAgency } from "@/lib/section-library/builtin-seeds";
import { listCatalogSections } from "@/lib/section-library/catalog-store";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { isAdmin, canViewLibrarySection } from "@/lib/section-library/permissions";
import { prisma } from "@/lib/db/client";
import type { Screenshot } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

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

  const status = deriveStatus({ status: project.status, files: project.files, hasReferenceUrls });

  const updateReferences = updateReferencesAction.bind(null, id);
  const generateDelivery = generateAction.bind(null, id);
  const remove = deleteProjectAction.bind(null, id);

  // ---- Setup workspace data: pages (with sections) + the agency Library ------
  const canvasRaw = project.files.find((f) => f.name === SITEMAP_CANVAS_FILE)?.content;
  let setupPages: SetupPage[] = [];
  if (canvasRaw) {
    try {
      setupPages = (JSON.parse(canvasRaw) as SitemapCanvas).pages.map((p) => ({
        id: p.id,
        name: p.name,
        sections: (p.sections ?? []).map((s) => ({ id: s.id, name: s.note || s.name })),
      }));
    } catch { /* no pages yet */ }
  }

  if (user.agencyId) await seedBuiltinsForAgency(user.agencyId);
  const admin = isAdmin(user);
  const catalog = user.agencyId ? await listCatalogSections(user.agencyId) : [];
  const librarySections = catalog
    .filter((d) => {
      const auth = { sourceType: d.sourceType, createdByUserId: d.createdByUserId, status: d.status, visibility: d.visibility };
      if (admin) return true;
      const mine = d.createdByUserId === user.id;
      if (d.status === "ready") return canViewLibrarySection(user, auth);
      return mine;
    })
    .map(dynamicToLibrarySection);

  const wixConn = await getWixConnection(id);

  const overview = (
    <div className="grid gap-4">
      <WixConnectPanel projectId={id} connected={wixConn ? { instanceId: wixConn.instanceId, siteId: wixConn.siteId } : null} />
      <ProjectSetup
        projectId={id}
        pages={setupPages}
        librarySections={librarySections}
        editorHref={`/projects/${id}/editor`}
        actions={{
          addPage: addPageAction,
          renamePage: renamePageAction,
          removePage: removePageAction,
          removeSection: removeSectionFromPageAction,
          addSection: addLibrarySectionToPageAction,
        }}
      />

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
    <ProjectBrief
      projectId={id}
      businessName={gen.clientName}
      initial={{
        businessType: b.businessType,
        industry: b.industry,
        targetAudience: b.targetAudience,
        goal: b.goal,
        notes: b.notes,
      }}
      save={updateBriefAction}
    />
  );

  const references = (
    <div className="grid gap-4">
      <p className="text-[13px] text-muted">Save reference and competitor sites, plus screenshots, to draw inspiration from while you design.</p>
      <ReferencesEditor
        existingWebsiteUrl={b.existingWebsiteUrl ?? undefined}
        referenceUrls={b.referenceUrls}
        competitorUrls={b.competitorUrls}
        save={updateReferences}
      />
      <ScreenshotUpload projectId={id} initial={screenshots} save={saveScreenshotsAction} />
    </div>
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
    <div className="px-5 py-8 sm:px-8">
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
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${id}/editor`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
          >
            ✦ Open Design Editor
          </Link>
          <WixPublishButton projectId={id} />
          <WixExportButton projectId={id} />
          <DeleteProjectButton projectName={project.name} action={remove} />
        </div>
      </FadeUp>

      <WorkspaceTabs
        panels={[
          { id: "overview", label: "Overview", content: overview },
          { id: "inputs", label: "Inputs", content: inputs },
          { id: "references", label: "References", badge: refUrls.length, content: references },
          { id: "notes", label: "Notes", badge: project.notes.length, content: <NotesSection projectId={id} notes={project.notes} /> },
          { id: "activity", label: "Activity", content: activity },
        ]}
      />
    </div>
  );
}
