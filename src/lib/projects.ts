// Data-access layer. Keeps Prisma out of components and server actions.

import { prisma } from "@/lib/db/client";
import type { CreateProjectInput } from "@/lib/validators/project";
import type { AutomationBrief, GenerationInput, ProjectBrief } from "@/types";
import type { ProjectModel, ProjectInputModel } from "@/generated/prisma/models";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { files: true, workflows: true } } },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      inputs: true,
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

export async function getFileVersions(projectId: string) {
  return prisma.fileVersion.findMany({
    where: { file: { projectId } },
    orderBy: { createdAt: "desc" },
    include: { file: { select: { name: true } } },
    take: 50,
  });
}

export async function createProject(data: CreateProjectInput) {
  const brief: ProjectBrief = {
    businessType: data.businessType,
    goal: data.goal,
    targetAudience: data.targetAudience,
    keyItems: data.keyItems,
    brandRefs: data.brandRefs,
    currentTools: data.currentTools,
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

  return prisma.project.create({
    data: {
      name: data.name,
      clientName: data.clientName,
      type: data.type,
      description: data.goal,
      inputs: { create: inputs },
    },
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
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
  const brief = (briefRow?.data ?? { keyItems: [], brandRefs: [], currentTools: [] }) as ProjectBrief;

  return {
    projectName: project.name,
    clientName: project.clientName,
    type: project.type,
    brief: {
      ...brief,
      keyItems: brief.keyItems ?? [],
      brandRefs: brief.brandRefs ?? [],
      currentTools: brief.currentTools ?? [],
    },
    automation: autoRow ? (autoRow.data as AutomationBrief) : undefined,
  };
}
