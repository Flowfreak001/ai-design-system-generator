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
import { listCatalogSections } from "@/lib/section-library/catalog-store";
import { seedBuiltinsForAgency } from "@/lib/section-library/builtin-seeds";
import { dynamicToLibrarySection } from "@/lib/section-library/dynamic-section";
import { isAdmin, canViewLibrarySection } from "@/lib/section-library/permissions";
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

  // Section Library catalog — surfaced as an in-editor panel so ready sections
  // drop straight onto the current page (same visibility rules as /references).
  const admin = isAdmin(user);
  if (user.agencyId) await seedBuiltinsForAgency(user.agencyId);
  const catalog = user.agencyId ? await listCatalogSections(user.agencyId) : [];
  const librarySections = catalog.filter((d) => {
    if (admin) return true;
    const auth = { sourceType: d.sourceType, createdByUserId: d.createdByUserId, status: d.status, visibility: d.visibility };
    if (d.status === "ready") return canViewLibrarySection(user, auth);
    return d.createdByUserId === user.id;
  }).map(dynamicToLibrarySection);

  return (
    <DesignEditor
      projectId={id}
      projectName={project.name}
      initialSitemap={sitemap}
      initialStyle={style}
      librarySections={librarySections}
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
