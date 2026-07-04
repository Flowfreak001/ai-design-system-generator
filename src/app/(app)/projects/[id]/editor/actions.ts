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
