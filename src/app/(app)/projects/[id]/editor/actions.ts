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
} from "@/lib/canvas";

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
