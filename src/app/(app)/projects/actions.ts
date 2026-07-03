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
    logoDataUrl: str(formData, "logoDataUrl"),
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

  // Persist any reference screenshots captured during onboarding as evidence.
  const shotsRaw = str(formData, "screenshots");
  if (shotsRaw) {
    try {
      const parsedShots = JSON.parse(shotsRaw) as Screenshot[];
      const clean = parsedShots
        .filter((s) => typeof s?.dataUrl === "string" && s.dataUrl.startsWith("data:image/") && s.dataUrl.length < 900_000)
        .slice(0, 12)
        .map((s) => ({ id: s.id, name: String(s.name).slice(0, 80), dataUrl: s.dataUrl }));
      if (clean.length) {
        await prisma.projectInput.create({ data: { projectId: project.id, category: "screenshots", data: { shots: clean } } });
      }
    } catch {
      // Ignore malformed screenshot payloads — they are optional evidence.
    }
  }

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

/** Generate BRAND.md, BRAND_GUIDELINES.md, CREATIVE_DIRECTION.md, STYLE_DIRECTION.json.
 *  Gated on the Evidence Review step: the reference pages must be confirmed
 *  first so the brand is built from real, reviewed evidence. */
export async function generateBrandAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  const input = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  const confirmed = Boolean((input?.data as { pagesConfirmed?: boolean } | null)?.pagesConfirmed);
  if (!confirmed) {
    throw new Error("Complete the Evidence Review (confirm discovered pages) before generating the brand guideline.");
  }
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

// Pipeline stage gates. Each approval sets a flag on the brief so the next
// stage unlocks (Brand → Crawl → Sitemap → Wireframe → Style → Design → Files).
const STAGE_FLAGS: Record<string, string> = {
  sitemap: "sitemapApproved",
  wireframe: "wireframeApproved",
  style: "styleApproved",
  design: "designApproved",
};

export async function approveStageAction(projectId: string, stage: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const flag = STAGE_FLAGS[stage];
  if (!flag) return { error: "Unknown stage" };
  await patchBrief(projectId, { [flag]: true });
  revalidatePath(`/projects/${projectId}`);
  return {};
}

/** Confirm the pages discovered by the reference crawl (user can trim/add). */
export async function confirmPagesAction(projectId: string, pages: string[]) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const clean = pages.map((p) => String(p).trim()).filter(Boolean).slice(0, 40);
  await patchBrief(projectId, { confirmedPages: clean, pagesConfirmed: true });
  revalidatePath(`/projects/${projectId}`);
  return {};
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
  // Gate: MD files are generated only after brand + structure + style are ready
  // (brand approved, sitemap + wireframe + style guide + design canvas approved).
  const brandInput = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  const b = (brandInput?.data ?? {}) as {
    brandApproved?: boolean;
    designApproved?: boolean;
  };
  const hasBrand = await prisma.generatedFile.count({ where: { projectId, name: "BRAND_GUIDELINES.md" } });
  if (!b.brandApproved || !hasBrand) {
    throw new Error("Approve the brand guideline before generating the design system.");
  }
  if (!b.designApproved) {
    throw new Error("Approve the design canvas before generating the MD files.");
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
