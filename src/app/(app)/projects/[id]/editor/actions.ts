"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { ownsProject } from "@/lib/projects";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import {
  SITEMAP_CANVAS_FILE,
  STYLE_GUIDE_CANVAS_FILE,
  type SitemapCanvas,
  type StyleGuideCanvas,
  type CanvasSection,
} from "@/lib/canvas";
import type { GeneratedSectionSpec, SectionPattern } from "@/lib/references/types";
import { getLibrarySection, type LibraryDefaultContent } from "@/lib/section-library/manual-sections";
import { type DynamicSectionDef } from "@/lib/section-library/dynamic-section";
import { getCatalogSection, upsertCatalogSection, deleteCatalogSection } from "@/lib/section-library/catalog-store";
import { fetchWixProducts } from "@/lib/integrations/wix/stores";
import { productsToItems } from "@/lib/integrations/wix/ecommerce-content";
import { isAdmin, canEditLibrarySection, canDeleteLibrarySection, canAddLibrarySection } from "@/lib/section-library/permissions";

async function loadCanvas(projectId: string): Promise<SitemapCanvas | null> {
  const file = await prisma.generatedFile.findUnique({ where: { projectId_name: { projectId, name: SITEMAP_CANVAS_FILE } } });
  if (!file?.content) return null;
  try { return JSON.parse(file.content) as SitemapCanvas; } catch { return null; }
}

/** Persist a canvas document as a versioned GeneratedFile JSON record. */
async function saveCanvasFile(projectId: string, name: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  const existing = await prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name } },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = (existing?.versions[0]?.version ?? 0) + 1;
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name } },
    create: { projectId, name, type: "markdown", content },
    update: { content },
  });
  await prisma.fileVersion.create({ data: { fileId: saved.id, version, content } });
}

export async function saveSitemapCanvasAction(
  projectId: string,
  canvas: SitemapCanvas,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function saveStyleGuideCanvasAction(
  projectId: string,
  canvas: StyleGuideCanvas,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  await saveCanvasFile(projectId, STYLE_GUIDE_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

const newPageId = () => `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Add a page to the project's sitemap by name. Creates the canvas if none
 *  exists yet. Sections on other pages are never touched. */
export async function addPageAction(
  projectId: string,
  name: string,
): Promise<{ error?: string; pageId?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const clean = name.trim().slice(0, 60);
  if (!clean) return { error: "Enter a page name." };
  const canvas: SitemapCanvas = (await loadCanvas(projectId)) ?? { pages: [], approved: false };
  if (canvas.pages.some((p) => p.name.trim().toLowerCase() === clean.toLowerCase())) {
    return { error: "That page already exists." };
  }
  const id = newPageId();
  canvas.pages.push({ id, name: clean, source: "user-added", sections: [] });
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return { pageId: id };
}

/** Rename a page. */
export async function renamePageAction(
  projectId: string,
  pageId: string,
  name: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const clean = name.trim().slice(0, 60);
  if (!clean) return { error: "Enter a page name." };
  const canvas = await loadCanvas(projectId);
  const page = canvas?.pages.find((p) => p.id === pageId);
  if (!canvas || !page) return { error: "Page not found." };
  page.name = clean;
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

/** Remove a page and all of its sections. */
export async function removePageAction(
  projectId: string,
  pageId: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const canvas = await loadCanvas(projectId);
  if (!canvas) return { error: "Page not found." };
  canvas.pages = canvas.pages.filter((p) => p.id !== pageId);
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

/** Remove a single section instance from a page. */
export async function removeSectionFromPageAction(
  projectId: string,
  pageId: string,
  sectionId: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const canvas = await loadCanvas(projectId);
  const page = canvas?.pages.find((p) => p.id === pageId);
  if (!canvas || !page) return { error: "Page not found." };
  page.sections = page.sections.filter((s) => s.id !== sectionId);
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}

/** Add a reference-inspired generated section as live, editable canvas data on
 *  a page — so it renders in the Design Canvas and can be edited before export. */
export async function addGeneratedSectionToPageAction(
  projectId: string,
  pageId: string,
  spec: GeneratedSectionSpec,
  pattern: SectionPattern,
): Promise<{ error?: string; pageId?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const canvas = await loadCanvas(projectId);
  if (!canvas || !canvas.pages.length) return { error: "No pages yet — confirm your sitemap first." };
  const page = canvas.pages.find((p) => p.id === pageId) ?? canvas.pages[0];

  const section: CanvasSection = {
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: spec.name,
    source: "reference-inspired",
    variant: spec.designVariant,
    status: "draft",
    asset: spec.assetPlacement === "left" ? "left" : "right",
    content: {
      eyebrow: spec.previewContent?.eyebrow,
      title: spec.previewContent?.title,
      description: spec.previewContent?.description,
      primaryButtonLabel: spec.previewContent?.primaryButtonLabel,
      secondaryButtonLabel: spec.previewContent?.secondaryButtonLabel,
      items: (spec.previewContent?.items ?? []).map((it) => ({ title: it.title, text: it.text })),
    },
    generated: { spec, pattern },
  };
  page.sections.push(section);
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return { pageId: page.id };
}

/** Add a ready-made MANUAL library section as live, editable canvas data on a
 *  page. No AI is involved — the section is a copy of a curated definition with
 *  its default content, rendered by the same catalog component the preview uses. */
export async function addLibrarySectionToPageAction(
  projectId: string,
  pageId: string,
  librarySectionId: string,
): Promise<{ error?: string; pageId?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };

  // Resolve the library item (shipped built-in OR catalog item). Adding creates
  // a NEW editable page instance — it never touches the library item.
  const builtin = getLibrarySection(librarySectionId);
  let name = "", canvasName = "", variant = "", dc: LibraryDefaultContent = {};
  let custom: CanvasSection["custom"];

  if (builtin) {
    if (builtin.status !== "ready") return { error: "This section is not published yet." };
    name = builtin.canvasName; canvasName = builtin.name; variant = builtin.variant; dc = builtin.defaultContent;
  } else {
    const item = await getCatalogSection(librarySectionId, user.agencyId);
    if (!item) return { error: "Section not found in the library." };
    // Server-side gate: must be allowed to add this item.
    if (!canAddLibrarySection(user, { sourceType: item.sourceType, createdByUserId: item.createdByUserId, status: item.status, visibility: item.visibility })) {
      return { error: "You don't have access to add this section." };
    }
    name = item.name; canvasName = item.name; variant = "custom"; dc = item.defaultContent;
    custom = { code: item.componentCode, mode: item.codeMode };
  }

  const canvas = await loadCanvas(projectId);
  if (!canvas || !canvas.pages.length) return { error: "No pages yet — confirm your sitemap first." };
  const page = canvas.pages.find((p) => p.id === pageId) ?? canvas.pages[0];

  const section: CanvasSection = {
    // Unique instance id so multiple copies of the same library section coexist.
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    note: canvasName,
    source: "user-added",
    variant,
    status: "draft",
    // Instance provenance: a copy of the library item, owned by this user/project.
    sourceLibrarySectionId: librarySectionId,
    createdByUserId: user.id,
    content: {
      eyebrow: dc.eyebrow,
      title: dc.title,
      subtitle: dc.subtitle,
      description: dc.description,
      primaryButtonLabel: dc.primaryButtonLabel,
      secondaryButtonLabel: dc.secondaryButtonLabel,
      items: (dc.items ?? []).map((it) => ({ title: it.title, text: it.text, href: it.href, icon: it.icon })),
    },
    ...(custom ? { custom } : {}),
  };
  // Ecommerce binding: when an ecommerce section is added to a project with a
  // connected Wix Store, prefill its items from the LIVE catalog so the section
  // shows the user's real products (falls back to placeholders if the read fails).
  if (librarySectionId.endsWith("ecommerce-product-grid")) {
    try {
      const products = await fetchWixProducts(projectId, 12);
      if (products.length) section.content!.items = productsToItems(products);
    } catch { /* keep placeholder items on any store-read failure */ }
  }

  page.sections.push(section);
  await saveCanvasFile(projectId, SITEMAP_CANVAS_FILE, { ...canvas, updatedAt: new Date().toISOString() });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return { pageId: page.id };
}

// ── Library item authoring (catalog) — permission-checked ──────────────────

/** Create or update a catalog library section/component.
 *  - Anyone may CREATE (their item becomes source "user", private).
 *  - Admins creating → source "admin", public.
 *  - UPDATE requires edit permission (admin on admin-items, or the creator). */
export async function saveAdminSectionAction(
  projectId: string,
  def: DynamicSectionDef,
): Promise<{ error?: string; id?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  if (!def.componentCode?.trim()) return { error: "Component code is required." };

  const existing = await getCatalogSection(def.id, user.agencyId);
  if (existing) {
    if (!canEditLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
      return { error: "You can only edit sections you created." };
    }
    // Preserve ownership/source on update.
    def = { ...def, sourceType: existing.sourceType, visibility: existing.visibility, createdByUserId: existing.createdByUserId };
  } else {
    const admin = isAdmin(user);
    def = {
      ...def,
      sourceType: admin ? "admin" : "user",
      visibility: admin ? "public" : "private",
      createdByUserId: user.id,
    };
  }

  const saved = await upsertCatalogSection(user.agencyId, user.id, def);
  revalidatePath(`/projects/${projectId}/references`);
  return { id: saved.id };
}

/** Edit ONLY the metadata/default content of a catalog item (no code). */
export async function updateLibrarySectionContentAction(
  projectId: string,
  sectionId: string,
  patch: { name?: string; description?: string; tags?: string[]; defaultContent?: LibraryDefaultContent },
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };

  const existing = await getCatalogSection(sectionId, user.agencyId);
  if (!existing) return { error: "Section not found." };
  if (!canEditLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
    return { error: "You can only edit sections you created." };
  }

  const next: DynamicSectionDef = {
    ...existing,
    name: patch.name ?? existing.name,
    description: patch.description ?? existing.description,
    tags: patch.tags ?? existing.tags,
    defaultContent: patch.defaultContent ?? existing.defaultContent,
  };
  await upsertCatalogSection(user.agencyId, user.id, next);
  revalidatePath(`/projects/${projectId}/references`);
  return {};
}

/** Delete a catalog library section — requires delete permission. */
export async function deleteAdminSectionAction(
  projectId: string,
  sectionId: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };

  const existing = await getCatalogSection(sectionId, user.agencyId);
  if (!existing) return {};
  if (!canDeleteLibrarySection(user, { sourceType: existing.sourceType, createdByUserId: existing.createdByUserId })) {
    return { error: "You can only delete sections you created." };
  }
  await deleteCatalogSection(sectionId, user.agencyId);
  revalidatePath(`/projects/${projectId}/references`);
  return {};
}

const STAGE_FLAGS: Record<string, string> = {
  sitemap: "sitemapApproved",
  wireframe: "wireframeApproved",
  style: "styleApproved",
  design: "designApproved",
};

/** Approve a stage from the editor — mirrors the pipeline gate flags on the brief. */
export async function approveEditorStageAction(
  projectId: string,
  stage: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const flag = STAGE_FLAGS[stage];
  if (!flag) return { error: "Unknown stage" };
  const input = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  if (!input) return { error: "Project brief not found." };
  const brief = (input.data ?? {}) as Record<string, unknown>;
  await prisma.projectInput.update({
    where: { id: input.id },
    data: { data: { ...brief, [flag]: true } as Prisma.InputJsonValue },
  });
  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath(`/projects/${projectId}`);
  return {};
}
