"use server";

// Hosted "Wix Site" module — assemble + publish a storefront.
// Assemble builds the project's canvas from a template blueprint (prebuilt
// library sections), binding ecommerce sections to the connected store's live
// catalog. Publish flips the project live at /s/<slug> via our multi-tenant
// renderer. Backend data + hosted checkout stay on Wix; we host the frontend.
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { ownsProject } from "@/lib/projects";
import { prisma } from "@/lib/db/client";
import {
  SITEMAP_CANVAS_FILE,
  type SitemapCanvas,
  type CanvasPage,
  type CanvasSection,
} from "@/lib/canvas";
import { getSiteTemplate } from "@/lib/site-templates";
import { seedBuiltinsForAgency } from "@/lib/section-library/builtin-seeds";
import { listCatalogSections, getCatalogSection } from "@/lib/section-library/catalog-store";
import { getWixConnection } from "@/lib/integrations/wix/connection-store";
import { fetchWixProducts } from "@/lib/integrations/wix/stores";
import { productsToItems } from "@/lib/integrations/wix/ecommerce-content";
import { buildDesignBundle } from "@/lib/integrations/wix/design-bundle";

async function saveCanvas(projectId: string, canvas: SitemapCanvas) {
  const content = JSON.stringify({ ...canvas, updatedAt: new Date().toISOString() }, null, 2);
  const existing = await prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name: SITEMAP_CANVAS_FILE } },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = (existing?.versions[0]?.version ?? 0) + 1;
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name: SITEMAP_CANVAS_FILE } },
    create: { projectId, name: SITEMAP_CANVAS_FILE, type: "markdown", content },
    update: { content },
  });
  await prisma.fileVersion.create({ data: { fileId: saved.id, version, content } });
}

const rid = () => `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export type AssembleResult = { ok: true; pages: number; sections: number } | { ok: false; error: string };

/** Build the project's canvas from a template, binding ecommerce sections to live data. */
export async function createSiteFromTemplateAction(projectId: string, templateId: string): Promise<AssembleResult> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { ok: false, error: "Not found." };

  const template = getSiteTemplate(templateId);
  if (!template) return { ok: false, error: "Unknown template." };

  const conn = await getWixConnection(projectId);
  if (!conn) return { ok: false, error: "Connect a Wix site to this project first." };

  // Resolve each template raw section id → this agency's seeded catalog id.
  await seedBuiltinsForAgency(user.agencyId);
  const catalog = await listCatalogSections(user.agencyId);
  const resolveId = (rawId: string) =>
    catalog.find((d) => d.id === rawId || d.id.endsWith(`-${rawId}`))?.id ?? null;

  // Live catalog for ecommerce binding (best-effort — placeholders on failure).
  let productItems: ReturnType<typeof productsToItems> = [];
  try {
    productItems = productsToItems(await fetchWixProducts(projectId, 12));
  } catch { /* keep placeholders */ }

  let sectionCount = 0;
  const pages: CanvasPage[] = [];
  for (const tp of template.pages) {
    const sections: CanvasSection[] = [];
    for (const rawId of tp.sections) {
      const id = resolveId(rawId);
      if (!id) continue;
      const def = await getCatalogSection(id, user.agencyId);
      if (!def || def.status !== "ready") continue;
      const dc = def.defaultContent ?? {};
      const isProductGrid = rawId === "ecommerce-product-grid";
      sections.push({
        id: rid(),
        name: def.name,
        note: def.name,
        source: "user-added",
        variant: "custom",
        status: "draft",
        sourceLibrarySectionId: id,
        createdByUserId: user.id,
        content: {
          eyebrow: dc.eyebrow,
          title: dc.title,
          subtitle: dc.subtitle,
          description: dc.description,
          primaryButtonLabel: dc.primaryButtonLabel,
          secondaryButtonLabel: dc.secondaryButtonLabel,
          items:
            isProductGrid && productItems.length
              ? productItems
              : (dc.items ?? []).map((it) => ({ title: it.title, text: it.text, href: it.href, icon: it.icon })),
        },
        custom: { code: def.componentCode, mode: def.codeMode },
      });
      sectionCount++;
    }
    pages.push({ id: tp.key, name: tp.name, source: "user-added", sections });
  }

  await saveCanvas(projectId, { pages, approved: true });
  await prisma.project.update({ where: { id: projectId }, data: { siteTemplate: templateId } });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, pages: pages.length, sections: sectionCount };
}

export type PublishResult = { ok: true; slug: string; url: string } | { ok: false; error: string };

/** Publish the assembled site live at /s/<slug>. */
export async function publishSiteAction(projectId: string, rawSlug: string): Promise<PublishResult> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { ok: false, error: "Not found." };

  const slug = slugify(rawSlug);
  if (slug.length < 3) return { ok: false, error: "Slug must be at least 3 characters (a–z, 0–9, hyphens)." };

  const clash = await prisma.project.findFirst({ where: { siteSlug: slug, NOT: { id: projectId } }, select: { id: true } });
  if (clash) return { ok: false, error: "That URL is taken — try another." };

  const canvas = await prisma.generatedFile.findUnique({ where: { projectId_name: { projectId, name: SITEMAP_CANVAS_FILE } } });
  if (!canvas?.content) return { ok: false, error: "Assemble a site before publishing." };

  await prisma.project.update({ where: { id: projectId }, data: { siteSlug: slug, sitePublished: true } });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, slug, url: `/s/${slug}` };
}

export type DesignFileResult = { ok: true; filename: string; markdown: string; pages: number; sections: number } | { ok: false; error: string };

/** Build a downloadable design file (all pages' sections + theme + Wix wiring). */
export async function downloadDesignFileAction(projectId: string): Promise<DesignFileResult> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { ok: false, error: "Not found." };
  const bundle = await buildDesignBundle(projectId);
  if (!bundle) return { ok: false, error: "Assemble a site first." };
  return { ok: true, ...bundle };
}

/** Take the site offline (keeps the assembled canvas + slug). */
export async function unpublishSiteAction(projectId: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { ok: false };
  await prisma.project.update({ where: { id: projectId }, data: { sitePublished: false } });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}
