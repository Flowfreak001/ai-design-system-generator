// Data-access layer. Keeps Prisma out of components and server actions.

import { prisma } from "@/lib/db/client";
import type { CreateProjectInput } from "@/lib/validators/project";
import type { AutomationBrief, GenerationInput, ProjectBrief } from "@/types";
import type { ProjectModel, ProjectInputModel } from "@/generated/prisma/models";

export async function listProjects(agencyId: string) {
  return prisma.project.findMany({
    where: { agencyId },
    orderBy: { updatedAt: "desc" },
    include: {
      inputs: { where: { category: "brief" } },
      files: { select: { name: true, type: true } },
      _count: { select: { files: true, workflows: true } },
    },
  });
}

export async function getProject(id: string, agencyId: string) {
  return prisma.project.findUnique({
    where: { id, agencyId },
    include: {
      inputs: true,
      business: { select: { id: true, name: true, website: true } },
      files: {
        orderBy: { name: "asc" },
        include: { _count: { select: { versions: true } } },
      },
      notes: { orderBy: { createdAt: "desc" } },
      agentRuns: {
        orderBy: { createdAt: "desc" },
        include: { steps: { orderBy: { createdAt: "asc" } } },
      },
      workflows: {
        include: {
          nodes: { orderBy: { createdAt: "asc" } },
          edges: true,
        },
      },
    },
  });
}

export async function getFileVersions(projectId: string, agencyId: string) {
  return prisma.fileVersion.findMany({
    where: { file: { projectId, project: { agencyId } } },
    orderBy: { createdAt: "desc" },
    include: { file: { select: { name: true } } },
    take: 50,
  });
}

export async function createProject(data: CreateProjectInput, agencyId?: string) {
  // Fold the main reference URL into the reference list (deduped) so analysis
  // picks it up, while also keeping it as a labeled primary reference.
  const referenceUrls = Array.from(
    new Set([data.mainReferenceUrl, ...data.referenceUrls].filter(Boolean) as string[]),
  );
  // Derive a human goal sentence from selected goal cards when no free-text goal
  // is provided, so downstream generators that read `goal` still work.
  const goal = data.goal || (data.goals.length ? data.goals.join(", ") : undefined);

  const brief: ProjectBrief = {
    businessType: data.businessType,
    industry: data.industry,
    goal,
    targetAudience: data.targetAudience,
    websiteType: data.websiteType,
    goals: data.goals,
    features: data.features,
    referenceLearn: data.referenceLearn,
    pageCount: data.pageCount,
    pageNotes: data.pageNotes,
    mainReferenceUrl: data.mainReferenceUrl,
    referenceUrls,
    existingWebsiteUrl: data.existingWebsiteUrl,
    pageUrls: data.pageUrls,
    competitorUrls: data.competitorUrls,
    stylePreference: data.stylePreference,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    logoDataUrl: data.logoDataUrl,
    fontPreference: data.fontPreference,
    brandPersonality: data.brandPersonality,
    toneOfVoice: data.toneOfVoice,
    keyItems: data.keyItems,
    services: data.services,
    ctaGoal: data.ctaGoal,
    seoKeywords: data.seoKeywords,
    platformTarget: data.platformTarget,
    animationPreference: data.animationPreference,
    brandRefs: [data.primaryColor, data.secondaryColor].filter(Boolean) as string[],
    currentTools: [],
    notes: data.notes,
  };

  const inputs: { category: string; data: object }[] = [{ category: "brief", data: brief }];

  if (data.type === "AUTOMATION_WORKFLOW") {
    const automation: AutomationBrief = {
      currentProcess: data.currentProcess,
      mainPainPoint: data.mainPainPoint,
      triggerSource: data.triggerSource,
      aiShouldDo: data.aiShouldDo,
      needsHumanApproval: data.needsHumanApproval,
    };
    inputs.push({ category: "automation", data: automation });
  }

  // Attach to a client when provided; inherit its name for display.
  let clientName = data.clientName ?? data.businessName;
  if (data.businessId) {
    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
      select: { name: true, agencyId: true },
    });
    if (!business || (agencyId && business.agencyId !== agencyId)) {
      throw new Error("Client not found");
    }
    clientName = clientName ?? business.name;
  }

  return prisma.project.create({
    data: {
      name: data.name,
      clientName,
      type: data.type,
      description: data.goal,
      agencyId,
      businessId: data.businessId,
      inputs: { create: inputs },
    },
  });
}

/** True when the project exists and belongs to the agency. */
export async function ownsProject(id: string, agencyId: string): Promise<boolean> {
  const found = await prisma.project.findUnique({ where: { id, agencyId }, select: { id: true } });
  return Boolean(found);
}

export async function deleteProject(id: string, agencyId: string) {
  return prisma.project.delete({ where: { id, agencyId } });
}

export async function addNote(projectId: string, content: string, title?: string) {
  return prisma.projectNote.create({ data: { projectId, content, title } });
}

/** Flatten a project + its input records into the generators' input shape. */
export function toGenerationInput(
  project: ProjectModel & { inputs: ProjectInputModel[] },
): GenerationInput {
  const briefRow = project.inputs.find((i) => i.category === "brief");
  const autoRow = project.inputs.find((i) => i.category === "automation");
  const brief = (briefRow?.data ?? {}) as Partial<ProjectBrief>;

  return {
    projectName: project.name,
    clientName: project.clientName,
    type: project.type,
    brief: {
      ...brief,
      keyItems: brief.keyItems ?? [],
      brandRefs: brief.brandRefs ?? [],
      currentTools: brief.currentTools ?? [],
      referenceUrls: brief.referenceUrls ?? [],
      competitorUrls: brief.competitorUrls ?? [],
      pageUrls: brief.pageUrls ?? [],
      seoKeywords: brief.seoKeywords ?? [],
      goals: brief.goals ?? [],
      features: brief.features ?? [],
      referenceLearn: brief.referenceLearn ?? [],
    },
    automation: autoRow ? (autoRow.data as AutomationBrief) : undefined,
  };
}
