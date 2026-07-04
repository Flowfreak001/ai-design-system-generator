import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getFileVersions, toGenerationInput } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { deriveStatus, STATUS_STYLES } from "@/lib/status";
import {
  generateAction,
  deleteProjectAction,
  analyzeWebsiteAction,
  updateReferencesAction,
  generateMdAction,
  generatePreviewAction,
  saveScreenshotsAction,
  runAiVisionAction,
  generateBrandAction,
  approveBrandAction,
  setDesignTypeAction,
  approveStageAction,
  confirmPagesAction,
} from "../actions";
import { computePipeline } from "@/lib/pipeline";
import {
  ProjectPipeline,
  type DiscoveredPage,
  type CanvasPage,
  type WireframePage,
  type StyleGuide,
} from "@/components/projects/project-pipeline";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { TypeBadge } from "@/components/projects/status-badge";
import { GeneratedFilesViewer } from "@/components/projects/generated-files-viewer";
import { PreviewPanel } from "@/components/projects/preview-panel";
import { ExportPanel } from "@/components/projects/export-panel";
import { SimpleSteps } from "@/components/projects/simple-steps";
import { WorkflowBlueprint } from "@/components/projects/workflow-blueprint";
import { NotesSection } from "@/components/projects/notes-section";
import { AgentRunTimeline } from "@/components/projects/agent-run-timeline";
import { WorkspaceTabs } from "@/components/projects/workspace-tabs";
import { ActionDialog } from "@/components/projects/action-dialog";
import { ExportPanel as PromptExportPanel } from "@/components/editor/export-panel/ExportPanel";
import type { SitemapCanvas, StyleGuideCanvas } from "@/lib/canvas";
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
  const generateBrand = generateBrandAction.bind(null, id);
  const approveBrand = approveBrandAction.bind(null, id);
  const remove = deleteProjectAction.bind(null, id);

  // Two-phase flow: the brand guideline is the foundation, and the design
  // system is only unlocked after that guideline is generated and approved.
  const fileNames = new Set(project.files.map((f) => f.name));
  const hasBrandGuidelines = fileNames.has("BRAND_GUIDELINES.md");
  const brandApproved = Boolean(b.brandApproved);
  const designType = b.designType;

  // ---- Derive pipeline data from real analysis (never hardcoded) -----------
  const parse = <T,>(name: string): T | null => {
    const raw = project.files.find((f) => f.name === name)?.content;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };
  type MultiPage = {
    pagesAnalyzed?: { url: string; pageType: string; ok: boolean; title?: string }[];
    sections?: { sectionName: string; pageType: string; confidence: "high" | "medium" }[];
  };
  const multi = parse<MultiPage>("MULTI_PAGE_WEBSITE_ANALYSIS.json");
  const tokens = parse<{
    color?: Record<string, string>;
    fonts?: string[];
    sourceUrl?: string;
    confidence?: string;
    metrics?: { headingWeight?: number; bodyFontSizePx?: number; spacingBase?: number; radiusPx?: number };
  }>("DESIGN_TOKENS.json");

  const discovered: DiscoveredPage[] = (multi?.pagesAnalyzed ?? []).map((p) => ({
    url: p.url,
    pageType: p.pageType,
    title: p.title,
    ok: p.ok,
  }));

  // Sitemap = every page the user selected (keyItems) + any extra pages the
  // crawl discovered. Pages are named by type (not the raw <title>), Home first,
  // and each is labelled detected (found by the crawl) or user-added.
  const friendlyPageName = (pt?: string) => {
    const map: Record<string, string> = {
      homepage: "Home", home: "Home", about: "About", "about us": "About",
      services: "Services", service: "Services", contact: "Contact", "contact us": "Contact",
      pricing: "Pricing", faq: "FAQ", blog: "Blog", portfolio: "Portfolio",
      booking: "Booking", login: "Login", dashboard: "Dashboard",
    };
    const k = (pt ?? "").toLowerCase().trim();
    return map[k] ?? (pt ? pt.charAt(0).toUpperCase() + pt.slice(1) : "Page");
  };
  const detectedNames = new Set(discovered.filter((d) => d.ok).map((d) => friendlyPageName(d.pageType).toLowerCase()));
  const sitemap: CanvasPage[] = (() => {
    const out: CanvasPage[] = [];
    const seen = new Set<string>();
    const push = (name: string, source: string) => {
      const key = name.trim().toLowerCase();
      if (name.trim() && !seen.has(key)) {
        seen.add(key);
        out.push({ name: name.trim(), source });
      }
    };
    // 1) Every selected page (source of truth for "all pages").
    for (const p of b.keyItems ?? []) push(p, detectedNames.has(p.toLowerCase()) ? "detected" : "user-added");
    // 2) Any extra pages the crawl found that the user didn't list.
    for (const d of discovered.filter((x) => x.ok)) push(friendlyPageName(d.pageType), "detected");
    // Home always leads the tree.
    out.sort((a, b2) => (/^home$/i.test(a.name) ? -1 : /^home$/i.test(b2.name) ? 1 : 0));
    return out;
  })();

  // Wireframe = detected sections grouped by page (source from confidence).
  const wireframe: WireframePage[] = (() => {
    const byPage = new Map<string, { label: string; source: string }[]>();
    for (const s of multi?.sections ?? []) {
      const arr = byPage.get(s.pageType) ?? [];
      arr.push({ label: s.sectionName, source: s.confidence === "high" ? "extracted" : "reference-inspired" });
      byPage.set(s.pageType, arr);
    }
    return [...byPage.entries()].map(([page, sections]) => ({ page, sections }));
  })();

  const styleGuide: StyleGuide = tokens
    ? {
        host: tokens.sourceUrl ? tokens.sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : null,
        source: tokens.confidence === "high" ? "extracted" : "inferred",
        colors: Object.entries(tokens.color ?? {})
          .filter(([, v]) => typeof v === "string" && v.startsWith("#"))
          // Drop duplicate hex values so the same swatch isn't listed twice.
          .filter(([, v], i, arr) => arr.findIndex(([, w]) => w === v) === i)
          .slice(0, 8)
          .map(([name, value]) => ({ name, value })),
        bodyFont: tokens.fonts?.[0] ?? null,
        displayFont: tokens.fonts?.[1] ?? tokens.fonts?.[0] ?? null,
        bodySizePx: tokens.metrics?.bodyFontSizePx ?? 16,
        headingWeight: tokens.metrics?.headingWeight ?? 600,
        radiusPx: tokens.metrics?.radiusPx ?? 12,
        spacingPx: tokens.metrics?.spacingBase ?? 8,
      }
    : null;

  const pipeline = computePipeline({
    fileNames,
    brief: {
      brandApproved: b.brandApproved,
      pagesConfirmed: b.pagesConfirmed,
      sitemapApproved: b.sitemapApproved,
      wireframeApproved: b.wireframeApproved,
      styleApproved: b.styleApproved,
      designApproved: b.designApproved,
    },
    status: project.status,
    hasReference: hasReferenceUrls,
  });

  const crawl = analyze; // the crawl stage reuses the website-analysis action
  const approveStage = approveStageAction.bind(null, id);
  const confirmPages = confirmPagesAction.bind(null, id);

  // Evidence summary shown in the Evidence Review stage (all from real inputs).
  const animationClue =
    (parse<{ recommendedAnimationRules?: string[] }>("ANIMATION_ANALYSIS.json")?.recommendedAnimationRules ?? [])[0] ?? null;
  const multiAssumptions =
    parse<{ assumptions?: string[] }>("MULTI_PAGE_WEBSITE_ANALYSIS.json")?.assumptions ?? [];
  const evidence = {
    refUrls: refUrls.map((r) => r.url),
    crawlTarget: b.mainReferenceUrl?.trim() || refUrls[0]?.url || b.existingWebsiteUrl?.trim() || null,
    screenshots: screenshots.length,
    logoPresent: Boolean(b.logoDataUrl),
    brandColors: [b.primaryColor, b.secondaryColor].filter(Boolean) as string[],
    visionRan: aiStatus.lastRunStatus === "completed",
    visionKeyConfigured: aiStatus.keyConfigured,
    animationClue,
    referenceLearn: b.referenceLearn ?? [],
    assumptions: multiAssumptions,
  };

  const timeline = [
    { label: "Created", done: true },
    { label: "Files generated", done: docFiles.length > 0 },
    { label: "Preview ready", done: Boolean(previewHtml) },
    { label: "Exported", done: project.status === "DELIVERED" },
  ];

  const overview = (
    <div className="grid gap-4">
      {/* Simple 3-step journey (Setup → Design → Export). The full gated
          pipeline with every action lives under its "All steps" toggle. */}
      <SimpleSteps stages={pipeline} editorHref={`/projects/${id}/editor`}>
        <ProjectPipeline
          projectId={id}
          stages={pipeline}
          brandExists={hasBrandGuidelines}
          brandApproved={brandApproved}
          designType={designType}
          hasReference={hasReferenceUrls}
          discovered={discovered}
          confirmedPages={b.confirmedPages ?? []}
          sitemap={sitemap}
          wireframe={wireframe}
          style={styleGuide}
          evidence={evidence}
          previewExists={Boolean(previewHtml)}
          producedFiles={docFiles.map((f) => f.name)}
          exportHref={`/api/projects/${id}/export`}
          actions={{
            generateBrand,
            approveBrand,
            crawl,
            runVision: runAiVision,
            confirmPages,
            approveStage,
            setDesignType: setDesignTypeAction,
            generateMd,
            generatePreview,
          }}
        />
      </SimpleSteps>

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

      {/* Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">Project summary</p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint">from onboarding</span>
        </div>
        <dl className="mt-2 divide-y divide-line">
          <Row label="Business" value={`${gen.clientName ?? ""}${b.businessType ? ` · ${b.businessType}` : ""}`} />
          <Row label="Industry" value={b.industry} />
          <Row label="Website type" value={b.websiteType} />
          <Row label="Goals" value={b.goals.join(", ")} />
          <Row label="Features" value={b.features.join(", ")} />
          <Row label="Pages" value={b.keyItems.join(", ")} />
          <Row label="Audience" value={b.targetAudience} />
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

  // Everything the user selected during onboarding, grouped as it was captured.
  const legacyRows = [
    ["Style preference", b.stylePreference],
    ["Font preference", b.fontPreference],
    ["Brand personality", b.brandPersonality],
    ["Tone of voice", b.toneOfVoice],
    ["Services / products", b.services],
    ["CTA goal", b.ctaGoal],
    ["SEO keywords", b.seoKeywords.join(", ")],
    ["Platform target", b.platformTarget],
    ["Animation preference", b.animationPreference],
  ].filter(([, v]) => v && String(v).trim()) as [string, string][];

  const InputGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-5">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-accent">{title}</p>
      <dl className="divide-y divide-line">{children}</dl>
    </div>
  );

  const inputs = (
    <div className="grid gap-4">
      <InputGroup title="Business basics">
        <Row label="Business name" value={gen.clientName} />
        <Row label="Business type" value={b.businessType} />
        <Row label="Industry" value={b.industry} />
        <Row label="Website goal" value={b.goal} />
        <Row label="Target audience" value={b.targetAudience} />
      </InputGroup>

      <InputGroup title="What you're building">
        <Row label="Website type" value={b.websiteType} />
        <Row label="Goals" value={b.goals.join(", ")} />
        <Row label="Features" value={b.features.join(", ")} />
      </InputGroup>

      <InputGroup title="Pages needed">
        <Row label="Selected pages" value={b.keyItems.join(", ")} />
        <Row label="Approx page count" value={b.pageCount} />
        <Row label="Notes for special pages" value={b.pageNotes} />
      </InputGroup>

      <InputGroup title="Reference sources & brand evidence">
        <Row label="Primary reference" value={b.mainReferenceUrl} />
        <Row label="Additional references" value={b.referenceUrls.filter((u) => u !== b.mainReferenceUrl).join(", ")} />
        <Row label="Existing website" value={b.existingWebsiteUrl} />
        <Row label="Learn from reference" value={b.referenceLearn.join(", ")} />
        <Row label="Primary color" value={b.primaryColor} />
        <Row label="Secondary color" value={b.secondaryColor} />
        <Row label="Logo" value={b.logoDataUrl ? "Uploaded" : undefined} />
        <Row label="Screenshots" value={screenshots.length ? `${screenshots.length} uploaded` : undefined} />
        <Row label="Notes" value={b.notes} />
      </InputGroup>

      {legacyRows.length > 0 && (
        <InputGroup title="Additional (legacy)">
          {legacyRows.map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
        </InputGroup>
      )}
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

  // ── Design-editor-first tab logic: the saved Design canvas is the source of
  // truth. Parse it once for the Export prompts, and flag generated files as
  // outdated whenever the canvas was edited after they were produced.
  const parseFile = <T,>(name: string): T | null => {
    const raw = project.files.find((f) => f.name === name)?.content;
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  };
  const savedCanvas = parseFile<SitemapCanvas>("SITEMAP_CANVAS.json");
  const savedStyle = parseFile<StyleGuideCanvas>("STYLE_GUIDE_CANVAS.json");
  const canvasFile = project.files.find((f) => f.name === "SITEMAP_CANVAS.json");
  const designMdFile = project.files.find((f) => f.name === "DESIGN.md");
  const filesOutdated = Boolean(
    canvasFile && designMdFile && new Date(canvasFile.updatedAt) > new Date(designMdFile.updatedAt),
  );

  const outdatedBanner = filesOutdated && (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-warning-soft px-4 py-3">
      <p className="text-[13px] font-medium text-warning">
        ⚠ Generated files are outdated — the Design canvas was edited after they were generated.
      </p>
      <ActionDialog
        projectId={id}
        trigger="button"
        title="Regenerate from Design"
        description="Regenerate the MD design-system files from the current approved canvases."
        confirmText="Regenerate all design-system files from the latest Design canvas?"
        runName="MD design-system generation"
        action={generateMd}
      />
    </div>
  );

  const filesPanel = (
    <div className="grid gap-4">
      {outdatedBanner}
      <GeneratedFilesViewer files={docFiles} />
    </div>
  );

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
    <div className="grid gap-4">
      {/* Build prompts — straight from the edited Design canvas (source of truth). */}
      {savedCanvas && savedCanvas.pages.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <p className="text-[14px] font-semibold text-ink">Build prompts</p>
            <p className="text-[12px] text-muted">Copy-ready prompts generated from your edited Design canvas — section, page, full site, or platform-specific.</p>
          </div>
          <div className="h-[600px]">
            <PromptExportPanel
              ctx={{
                projectName: project.name,
                businessName: project.clientName ?? undefined,
                websiteType: b.websiteType,
                industry: b.industry,
                goals: b.goals,
                pages: savedCanvas.pages,
                style: savedStyle,
                designApproved: Boolean(b.designApproved),
              }}
              outdated={filesOutdated}
            />
          </div>
        </div>
      ) : (
        <div className="card px-4 py-6 text-center text-[13px] text-muted">
          Save your work in the Design Editor to unlock copy-ready build prompts here.
        </div>
      )}

      {/* Generated file downloads (ZIP + individual files). */}
      <ExportPanel
        projectId={id}
        files={project.files.map((f) => ({ id: f.id, name: f.name, type: f.type, content: f.content }))}
      />
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
          <DeleteProjectButton projectName={project.name} action={remove} />
        </div>
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
