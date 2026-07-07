"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectSchema, createNoteSchema } from "@/lib/validators/project";
import { createProject, deleteProject, addNote, ownsProject } from "@/lib/projects";
import { startGeneration } from "@/lib/jobs";
import { runWebsiteAnalysis } from "@/lib/analysis/run-analysis";
import { runMdGeneration } from "@/lib/md-generation";
import { runPreviewGeneration } from "@/lib/preview";
import { runAiVisionAnalysis } from "@/lib/ai/ai-flow";
import { requireUser } from "@/lib/auth";
import { deriveSitemapCanvas, SITEMAP_CANVAS_FILE } from "@/lib/canvas";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : undefined;
};

/** Persist a canvas document as a versioned GeneratedFile JSON record. */
async function saveGeneratedCanvas(projectId: string, name: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name } },
    create: { projectId, name, type: "markdown", content },
    update: { content },
  });
  await prisma.fileVersion.create({ data: { fileId: saved.id, version: 1, content } });
}

export async function createProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  // Minimal-onboarding defaults: only a project name is truly required. Business
  // name falls back to the project name; business type to a neutral default.
  const projName = str(formData, "name");
  const parsed = createProjectSchema.safeParse({
    // Required
    name: projName,
    businessName: str(formData, "businessName") || projName,
    businessType: str(formData, "businessType") || "Website",
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

  // Auto-build the sitemap from the selected pages so the very next step is a
  // ready-to-edit sitemap (each page pre-populated with default sections),
  // rather than an empty canvas the user has to assemble by hand.
  const pages = (parsed.data.keyItems ?? []).map((p) => String(p).trim()).filter(Boolean);
  if (pages.length) {
    try {
      const sitemap = deriveSitemapCanvas(pages, null);
      await saveGeneratedCanvas(project.id, SITEMAP_CANVAS_FILE, { ...sitemap, updatedAt: new Date().toISOString() });
    } catch { /* sitemap can still be derived lazily in the editor */ }
  }

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

  // Auto-build: if a reference URL was given, analyse it now so the user lands
  // on a project that's already learned the brand (best-effort — never blocks).
  const ref = str(formData, "mainReferenceUrl") || str(formData, "existingWebsiteUrl");
  if (ref) {
    try { await runWebsiteAnalysis(project.id); } catch { /* analysis can be re-run from the project */ }
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


export async function runAiVisionAction(projectId: string) {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return;
  await runAiVisionAnalysis(projectId);
  revalidatePath(`/projects/${projectId}`);
}

/** Update the editable project brief (business type, industry, audience, goal,
 *  notes) from the Inputs tab. Merges into the brief input JSON. */
export async function updateBriefAction(
  projectId: string,
  patch: { businessType?: string; industry?: string; targetAudience?: string; goal?: string; notes?: string },
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!user.agencyId || !(await ownsProject(projectId, user.agencyId))) return { error: "Not found" };
  const input = await prisma.projectInput.findFirst({ where: { projectId, category: "brief" } });
  if (!input) return { error: "Brief not found" };
  const brief = (input.data ?? {}) as Record<string, unknown>;
  const next: Record<string, unknown> = { ...brief };
  for (const [k, v] of Object.entries(patch)) next[k] = typeof v === "string" ? v.trim() : v;
  await prisma.projectInput.update({
    where: { id: input.id },
    data: { data: next as Prisma.InputJsonValue },
  });
  revalidatePath(`/projects/${projectId}`);
  return {};
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
  // Keep the primary reference in sync with the edited list so the crawl always
  // targets the current first reference — not a stale onboarding value.
  const mainReferenceUrl = refs.data[0] ?? existing ?? null;
  await prisma.projectInput.update({
    where: { id: input.id },
    data: { data: { ...brief, existingWebsiteUrl: existing ?? null, referenceUrls: refs.data, competitorUrls: comps.data, mainReferenceUrl } },
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
