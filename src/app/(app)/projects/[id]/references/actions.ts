"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { ownsProject } from "@/lib/projects";
import { prisma } from "@/lib/db/client";
import { analyzeSectionReferenceImage } from "@/lib/ai/reference-vision";
import { createSectionPatternFromReferenceImage } from "@/lib/references/pattern";
import { SECTION_REFERENCE_LIBRARY_FILE, type ReferenceLibrary, type ReferenceSectionType, type SectionPattern } from "@/lib/references/types";

async function loadLibrary(projectId: string): Promise<ReferenceLibrary> {
  const file = await prisma.generatedFile.findUnique({ where: { projectId_name: { projectId, name: SECTION_REFERENCE_LIBRARY_FILE } } });
  if (!file?.content) return { patterns: [] };
  try { return JSON.parse(file.content) as ReferenceLibrary; } catch { return { patterns: [] }; }
}

async function saveLibrary(projectId: string, lib: ReferenceLibrary) {
  const content = JSON.stringify({ ...lib, updatedAt: new Date().toISOString() }, null, 2);
  const existing = await prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name: SECTION_REFERENCE_LIBRARY_FILE } },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = (existing?.versions[0]?.version ?? 0) + 1;
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name: SECTION_REFERENCE_LIBRARY_FILE } },
    create: { projectId, name: SECTION_REFERENCE_LIBRARY_FILE, type: "markdown", content },
    update: { content },
  });
  await prisma.fileVersion.create({ data: { fileId: saved.id, version, content } });
}

/** Run Vision on the uploaded image and return a draft pattern (not saved yet). */
export async function analyzeReferenceAction(
  projectId: string,
  input: {
    imageDataUrl: string; thumbnailUrl?: string; sectionType: ReferenceSectionType;
    websiteType?: string; industry?: string; patternGoal?: string;
    styleTags?: string[]; layoutTags?: string[]; interactionTags?: string[];
    conversionTags?: string[]; notes?: string;
  },
): Promise<{ pattern?: SectionPattern; error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  if (!input.imageDataUrl?.startsWith("data:image/")) return { error: "Please upload a valid image." };
  const vision = await analyzeSectionReferenceImage({
    imageDataUrl: input.imageDataUrl,
    sectionType: input.sectionType,
    websiteType: input.websiteType,
    industry: input.industry,
    patternGoal: input.patternGoal,
    styleTags: input.styleTags,
    layoutTags: input.layoutTags,
    interactionTags: input.interactionTags,
    conversionTags: input.conversionTags,
    notes: input.notes,
  });
  const pattern = createSectionPatternFromReferenceImage({
    sectionType: input.sectionType,
    websiteType: input.websiteType,
    industry: input.industry,
    patternGoal: input.patternGoal,
    styleTags: input.styleTags,
    layoutTags: input.layoutTags,
    interactionTags: input.interactionTags,
    conversionTags: input.conversionTags,
    notes: input.notes,
    referenceImageUrl: input.thumbnailUrl,
    vision,
  });
  return { pattern };
}

/** Save (approve) a pattern into the library. */
export async function saveReferencePatternAction(projectId: string, pattern: SectionPattern): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const lib = await loadLibrary(projectId);
  const next: SectionPattern = { ...pattern, approved: true, updatedAt: new Date().toISOString() };
  const i = lib.patterns.findIndex((p) => p.id === pattern.id);
  if (i >= 0) lib.patterns[i] = next; else lib.patterns.unshift(next);
  await saveLibrary(projectId, lib);
  revalidatePath(`/projects/${projectId}/references`);
  return {};
}

export async function deleteReferencePatternAction(projectId: string, patternId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const lib = await loadLibrary(projectId);
  lib.patterns = lib.patterns.filter((p) => p.id !== patternId);
  await saveLibrary(projectId, lib);
  revalidatePath(`/projects/${projectId}/references`);
  return {};
}
