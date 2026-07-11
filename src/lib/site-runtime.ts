// Server-only runtime for the hosted storefront (/s/<slug>). Loads a published
// project's canvas + style guide and re-binds ecommerce sections to the live
// Wix catalog at request time, so prices/stock are always current.
import { prisma } from "@/lib/db/client";
import { SITEMAP_CANVAS_FILE, STYLE_GUIDE_CANVAS_FILE, type SitemapCanvas, type StyleGuideCanvas, type CanvasSection } from "@/lib/canvas";
import { fetchWixProducts } from "@/lib/integrations/wix/stores";
import { productsToItems } from "@/lib/integrations/wix/ecommerce-content";

export type PublishedSite = {
  projectId: string;
  name: string;
  sections: CanvasSection[];
  style: StyleGuideCanvas | null;
};

function parse<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

/** Resolve a published site by slug (or null if not found / offline). */
export async function loadPublishedSite(slug: string): Promise<PublishedSite | null> {
  const project = await prisma.project.findFirst({
    where: { siteSlug: slug, sitePublished: true },
    select: { id: true, name: true },
  });
  if (!project) return null;

  const [canvasFile, styleFile] = await Promise.all([
    prisma.generatedFile.findUnique({ where: { projectId_name: { projectId: project.id, name: SITEMAP_CANVAS_FILE } } }),
    prisma.generatedFile.findUnique({ where: { projectId_name: { projectId: project.id, name: STYLE_GUIDE_CANVAS_FILE } } }),
  ]);
  const canvas = parse<SitemapCanvas>(canvasFile?.content);
  if (!canvas) return null;

  const sections = canvas.pages.flatMap((p) => p.sections ?? []);

  // Re-bind ecommerce sections to the live catalog (best-effort).
  if (sections.some((s) => s.sourceLibrarySectionId?.endsWith("ecommerce-product-grid"))) {
    try {
      // Point each card at this site's product route: /product/<x> → /s/<slug>/p/<x>.
      const items = productsToItems(await fetchWixProducts(project.id, 12)).map((it) => ({
        ...it,
        href: it.href ? it.href.replace(/^\/product\//, `/s/${slug}/p/`) : it.href,
      }));
      if (items.length) {
        for (const s of sections) {
          if (s.sourceLibrarySectionId?.endsWith("ecommerce-product-grid") && s.content) s.content.items = items;
        }
      }
    } catch { /* keep stored items */ }
  }

  return { projectId: project.id, name: project.name, sections, style: parse<StyleGuideCanvas>(styleFile?.content) };
}
