import { notFound } from "next/navigation";
import { getProject, toGenerationInput } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { DesignEditor } from "@/components/editor/design-editor";
import {
  deriveSitemapCanvas,
  deriveStyleGuideCanvas,
  SITEMAP_CANVAS_FILE,
  STYLE_GUIDE_CANVAS_FILE,
  type SitemapCanvas,
  type StyleGuideCanvas,
} from "@/lib/canvas";
import { SECTION_REFERENCE_LIBRARY_FILE, type ReferenceLibrary } from "@/lib/references/types";
import {
  saveSitemapCanvasAction,
  saveStyleGuideCanvasAction,
  approveEditorStageAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = user.agencyId ? await getProject(id, user.agencyId) : null;
  if (!project) notFound();

  const gen = toGenerationInput(project);
  const b = gen.brief;

  const parse = <T,>(name: string): T | null => {
    const raw = project.files.find((f) => f.name === name)?.content;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const multi = parse<Parameters<typeof deriveSitemapCanvas>[1]>("MULTI_PAGE_WEBSITE_ANALYSIS.json");
  const tokens = parse<Parameters<typeof deriveStyleGuideCanvas>[0]>("DESIGN_TOKENS.json");

  // Load saved canvas state, or derive an initial one from real evidence.
  const sitemap: SitemapCanvas =
    parse<SitemapCanvas>(SITEMAP_CANVAS_FILE) ?? deriveSitemapCanvas(b.keyItems ?? [], multi);
  const style: StyleGuideCanvas =
    parse<StyleGuideCanvas>(STYLE_GUIDE_CANVAS_FILE) ??
    deriveStyleGuideCanvas(tokens, { primaryColor: b.primaryColor, secondaryColor: b.secondaryColor });

  // Approved section reference patterns — insertable directly from the editor.
  const refLib = parse<ReferenceLibrary>(SECTION_REFERENCE_LIBRARY_FILE);
  const referencePatterns = (refLib?.patterns ?? []).filter((p) => p.approved);

  return (
    <DesignEditor
      projectId={id}
      projectName={project.name}
      initialSitemap={sitemap}
      initialStyle={style}
      referencePatterns={referencePatterns}
      features={b.features ?? []}
      siteContext={{ websiteType: b.websiteType, industry: b.industry, businessType: b.businessType, goals: b.goals }}
      approvals={{
        sitemap: Boolean(b.sitemapApproved),
        wireframe: Boolean(b.wireframeApproved),
        style: Boolean(b.styleApproved),
        design: Boolean(b.designApproved),
      }}
      saveSitemap={saveSitemapCanvasAction}
      saveStyle={saveStyleGuideCanvasAction}
      approveStage={approveEditorStageAction}
    />
  );
}
