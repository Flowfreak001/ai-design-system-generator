"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectSchema, createNoteSchema } from "@/lib/validators/project";
import { createProject, deleteProject, addNote, ownsProject } from "@/lib/projects";
import { startGeneration } from "@/lib/jobs";
import { runWebsiteAnalysis } from "@/lib/analysis/run-analysis";
import { runMdGeneration, runBrandGeneration } from "@/lib/md-generation";
import { runPreviewGeneration } from "@/lib/preview";
import { runAiVisionAnalysis } from "@/lib/ai/ai-flow";
import { DESIGN_TYPES } from "@/lib/validators/project";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : undefined;
};

export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = createProjectSchema.safeParse({
    // Required
    name: str(formData, "name"),
    businessName: str(formData, "businessName"),
    businessType: str(formData, "businessType"),
    industry: str(formData, "industry"),
    goal: str(formData, "goal"),
    websiteType: str(formData, "websiteType"),
    goals: str(formData, "goals"),
    features: str(formData, "features"),
    referenceLearn: str(formData, "referenceLearn"),
    pageCount: str(formData, "pageCount"),
    pageNotes: str(formData, "pageNotes"),
    mainReferenceUrl: str(formData, "mainReferenceUrl"),
    keyItems: str(formData, "keyItems"),
    platformTarget: str(formData, "platformTarget"),
    // Optional
    businessId: str(formData, "businessId"),
    clientName: str(formData, "clientName"),
    type: str(formData, "type"),
    targetAudience: str(formData, "targetAudience"),
    referenceUrls: str(formData, "referenceUrls"),
    existingWebsiteUrl: str(formData, "existingWebsiteUrl"),
    pageUrls: str(formData, "pageUrls"),
    competitorUrls: str(formData, "competitorUrls"),
    stylePreference: str(formData, "stylePreference"),
    primaryColor: str(formData, "primaryColor"),
    secondaryColor: str(formData, "secondaryColor"),
    fontPreference: str(formData, "fontPreference"),
    brandPersonality: str(formData, "brandPersonality"),
    toneOfVoice: str(formData, "toneOfVoice"),
    services: str(formData, "services"),
    ctaGoal: str(formData, "ctaGoal"),
    seoKeywords: str(formData, "seoKeywords"),
    animationPreference: str(formData, "animationPreference"),
    notes: str(formData, "notes"),
    // Automation-only
    currentProcess: str(formData, "currentProcess"),
    mainPainPoint: str(formData, "mainPainPoint"),
    triggerSource: str(formData, "triggerSource"),
    aiShouldDo: str(formData, "aiShouldDo"),
    needsHumanApproval: str(formData, "needsHumanApproval"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await createProject(parsed.data, user.agencyId ?? undefined);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function generateAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await startGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

/** Merge fields into the project's brief input (JSON). */
async function patchBrief(projectId: string, patch: Record<string, unknown>) {
  const input = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  if (!input) return;
  const brief = (input.data ?? {}) as Record<string, unknown>;
  await prisma.projectInput.update({
    where: { id: input.id },
    data: { data: { ...brief, ...patch } as Prisma.InputJsonValue },
  });
}

// ---- Two-phase flow: Brand foundation → approval → Design system ----------

/** Phase 1 — generate BRAND.md, BRAND_GUIDELINES.md, CREATIVE_DIRECTION.md. */
export async function generateBrandAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await runBrandGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

/** User approves the brand guideline — unlocks the design phase. */
export async function approveBrandAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await patchBrief(projectId, { brandApproved: true });
  revalidatePath(`/projects/${projectId}`);
}

export async function setDesignTypeAction(projectId: string, designType: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  if (!(DESIGN_TYPES as readonly string[]).includes(designType)) return { error: "Invalid design type" };
  await patchBrief(projectId, { designType });
  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function runAiVisionAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await runAiVisionAnalysis(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function generateMdAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  // Gate: the design system is generated only after the brand guideline exists
  // and is approved — the brand is the source of truth.
  const brandInput = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  const approved = Boolean((brandInput?.data as { brandApproved?: boolean } | null)?.brandApproved);
  const hasBrand = await prisma.generatedFile.count({ where: { projectId, name: "BRAND_GUIDELINES.md" } });
  if (!approved || !hasBrand) {
    throw new Error("Approve the brand guideline before generating the design system.");
  }
  await runMdGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function generatePreviewAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await runPreviewGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export type Screenshot = { id: string; name: string; dataUrl: string; note?: string };

/** Save reference screenshots (already resized/compressed to data URLs on the
 *  client) into the project's "screenshots" input. Bounded so the row stays
 *  reasonable; upload-to-storage can replace this later without UI changes. */
export async function saveScreenshotsAction(
  projectId: string,
  shots: Screenshot[],
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const clean = shots
    .filter((s) => typeof s.dataUrl === "string" && s.dataUrl.startsWith("data:image/") && s.dataUrl.length < 900_000)
    .slice(0, 12)
    .map((s) => ({ id: s.id, name: String(s.name).slice(0, 80), dataUrl: s.dataUrl, note: s.note?.slice(0, 200) }));
  const existing = await prisma.projectInput.findFirst({ where: { projectId, category: "screenshots" } });
  if (existing) {
    await prisma.projectInput.update({ where: { id: existing.id }, data: { data: { shots: clean } } });
  } else {
    await prisma.projectInput.create({ data: { projectId, category: "screenshots", data: { shots: clean } } });
  }
  revalidatePath(`/projects/${projectId}`);
  return {};
}

const urlListSchema = z.array(z.string().url("Each reference must be a valid URL (https://…)")).max(10);

/** Update the brief's reference/existing/competitor URLs so analysis can be
 *  re-run against a different site without recreating the project. */
export async function updateReferencesAction(
  projectId: string,
  data: { existingWebsiteUrl?: string; referenceUrls: string[]; competitorUrls: string[] },
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };

  const clean = (urls: string[]) => urls.map((u) => u.trim()).filter(Boolean);
  const refs = urlListSchema.safeParse(clean(data.referenceUrls));
  const comps = urlListSchema.safeParse(clean(data.competitorUrls));
  const existing = data.existingWebsiteUrl?.trim() || undefined;
  if (existing && !z.string().url().safeParse(existing).success) return { error: "Existing website must be a valid URL." };
  if (!refs.success) return { error: refs.error.issues[0]?.message ?? "Invalid reference URL" };
  if (!comps.success) return { error: comps.error.issues[0]?.message ?? "Invalid competitor URL" };

  const input = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  if (!input) return { error: "Project brief not found." };
  const brief = (input.data ?? {}) as Record<string, unknown>;
  await prisma.projectInput.update({
    where: { id: input.id },
    data: { data: { ...brief, existingWebsiteUrl: existing ?? null, referenceUrls: refs.data, competitorUrls: comps.data } },
  });
  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function analyzeWebsiteAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await runWebsiteAnalysis(projectId);
  // Each analyze run produces fresh data — flow it straight into the MD files
  // and preview when they already exist, so downstream never shows stale output.
  const existing = await prisma.generatedFile.findMany({
    where: { projectId, name: { in: ["DESIGN.md", "preview.html"] } },
    select: { name: true },
  });
  const names = new Set(existing.map((f) => f.name));
  if (names.has("DESIGN.md")) await runMdGeneration(projectId);
  if (names.has("preview.html")) await runPreviewGeneration(projectId);
  revalidatePath(`/projects/${projectId}`);
}

export async function addNoteAction(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) {
    return { error: "Not allowed" };
  }
  const parsed = createNoteSchema.safeParse({
    projectId,
    title: str(formData, "title"),
    content: str(formData, "content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid note" };
  }
  await addNote(parsed.data.projectId, parsed.data.content, parsed.data.title);
  revalidatePath(`/projects/${projectId}`);
  return undefined;
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId) return;
  await deleteProject(projectId, user.agencyId);
  revalidatePath("/projects");
  redirect("/projects");
}
