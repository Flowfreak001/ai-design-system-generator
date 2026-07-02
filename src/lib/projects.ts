// Data-access layer for projects. Keeps Prisma calls out of components/actions.

import { prisma } from "@/lib/db/client";
import { slugify, shortId } from "@/lib/utils/slug";
import type { CreateProjectInput } from "@/lib/validators/project";
import type { GenerationInput } from "@/types";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true } } },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      input: true,
      files: { orderBy: { fileName: "asc" } },
      agentRuns: {
        orderBy: { createdAt: "desc" },
        include: { steps: { orderBy: { startedAt: "asc" } } },
      },
    },
  });
}

export async function getProjectFile(projectId: string, fileName: string) {
  return prisma.generatedFile.findUnique({
    where: { projectId_fileName: { projectId, fileName } },
  });
}

export async function createProject(data: CreateProjectInput) {
  const slug = `${slugify(data.name) || "project"}-${shortId()}`;

  return prisma.project.create({
    data: {
      name: data.name,
      slug,
      clientName: data.clientName,
      businessName: data.businessName,
      businessType: data.businessType,
      input: {
        create: {
          websiteGoal: data.websiteGoal,
          targetAudience: data.targetAudience,
          existingWebsiteUrl: data.existingWebsiteUrl,
          referenceUrls: data.referenceUrls,
          competitorUrls: data.competitorUrls,
          brandColors: data.brandColors,
          requiredPages: data.requiredPages,
          servicesProducts: data.servicesProducts,
          seoKeywords: data.seoKeywords,
          platformTarget: data.platformTarget,
          animationPreference: data.animationPreference,
          notes: data.notes,
        },
      },
    },
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

/** Flatten a project + its input into the shape generators consume. */
export function toGenerationInput(project: {
  name: string;
  clientName: string | null;
  businessName: string | null;
  businessType: string | null;
  input: {
    websiteGoal: string | null;
    targetAudience: string | null;
    existingWebsiteUrl: string | null;
    referenceUrls: string[];
    competitorUrls: string[];
    brandColors: string[];
    requiredPages: string[];
    servicesProducts: string | null;
    seoKeywords: string[];
    platformTarget: string | null;
    animationPreference: string | null;
    notes: string | null;
  } | null;
}): GenerationInput {
  const i = project.input;
  return {
    projectName: project.name,
    clientName: project.clientName,
    businessName: project.businessName,
    businessType: project.businessType,
    websiteGoal: i?.websiteGoal ?? null,
    targetAudience: i?.targetAudience ?? null,
    existingWebsiteUrl: i?.existingWebsiteUrl ?? null,
    referenceUrls: i?.referenceUrls ?? [],
    competitorUrls: i?.competitorUrls ?? [],
    brandColors: i?.brandColors ?? [],
    requiredPages: i?.requiredPages ?? [],
    servicesProducts: i?.servicesProducts ?? null,
    seoKeywords: i?.seoKeywords ?? [],
    platformTarget: i?.platformTarget ?? null,
    animationPreference: i?.animationPreference ?? null,
    notes: i?.notes ?? null,
  };
}
