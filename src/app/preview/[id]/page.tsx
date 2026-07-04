// Full-page live preview of a project's designed pages. Rendered outside the
// dashboard shell so it scrolls the window (no editor zoom / nested scroller),
// which lets scroll-driven sections (e.g. Sticky Expanding Media) animate for real.

import { notFound } from "next/navigation";
import { getProject, toGenerationInput } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { PagePreview } from "@/components/preview/page-preview";
import {
  deriveSitemapCanvas,
  deriveStyleGuideCanvas,
  SITEMAP_CANVAS_FILE,
  STYLE_GUIDE_CANVAS_FILE,
  type SitemapCanvas,
  type StyleGuideCanvas,
} from "@/lib/canvas";

export const dynamic = "force-dynamic";

export default async function LivePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; frame?: string }>;
}) {
  const { id } = await params;
  const { page, frame } = await searchParams;
  const user = await requireUser();
  const project = user.agencyId ? await getProject(id, user.agencyId) : null;
  if (!project) notFound();

  const gen = toGenerationInput(project);
  const b = gen.brief;
  const parse = <T,>(name: string): T | null => {
    const raw = project.files.find((f) => f.name === name)?.content;
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  };

  const multi = parse<Parameters<typeof deriveSitemapCanvas>[1]>("MULTI_PAGE_WEBSITE_ANALYSIS.json");
  const tokens = parse<Parameters<typeof deriveStyleGuideCanvas>[0]>("DESIGN_TOKENS.json");
  const sitemap: SitemapCanvas = parse<SitemapCanvas>(SITEMAP_CANVAS_FILE) ?? deriveSitemapCanvas(b.keyItems ?? [], multi);
  const style: StyleGuideCanvas =
    parse<StyleGuideCanvas>(STYLE_GUIDE_CANVAS_FILE) ??
    deriveStyleGuideCanvas(tokens, { primaryColor: b.primaryColor, secondaryColor: b.secondaryColor });

  return <PagePreview projectId={id} pages={sitemap.pages} style={style} initialPageId={page} framed={frame === "1"} />;
}
