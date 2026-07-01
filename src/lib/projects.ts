// Data-access layer for projects + their generated files. Keeps Prisma calls
// out of components and server actions so they stay thin.

import { prisma } from "@/lib/db/client";
import { runPipeline } from "@/lib/agents";
import { generateAll } from "@/lib/generators";
import type { BusinessBrief, GenerationContext } from "@/types";
import type { CreateProjectInput } from "@/lib/validators/project";
import { FileKind } from "@/generated/prisma/enums";

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true, referenceUrls: true } } },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      referenceUrls: true,
      files: { orderBy: { name: "asc" } },
      _count: { select: { files: true } },
    },
  });
}

export async function getProjectFile(projectId: string, name: string) {
  return prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name } },
  });
}

export async function createProject(input: CreateProjectInput) {
  const brief: BusinessBrief = {
    businessName: input.brief?.businessName ?? input.name,
    clientName: input.clientName,
    industry: input.brief?.industry,
    audience: input.brief?.audience,
    goals: input.brief?.goals ?? [],
    tone: input.brief?.tone ?? [],
    notes: input.brief?.notes,
  };

  return prisma.project.create({
    data: {
      name: input.name,
      clientName: input.clientName,
      businessDetails: brief,
      referenceUrls: {
        create: input.referenceUrls.map((r) => ({
          url: r.url,
          type: r.type,
          notes: r.notes,
        })),
      },
    },
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

// Map an output filename to a FileKind for storage/filtering.
function fileKindFor(name: string): FileKind {
  if (name.endsWith(".json")) return FileKind.JSON;
  if (name.endsWith(".css")) return FileKind.CSS;
  if (name.endsWith(".html")) return FileKind.HTML;
  if (name.startsWith("PROMPT_")) return FileKind.PROMPT;
  if (/_REPORT|ANALYSIS/.test(name)) return FileKind.REPORT;
  return FileKind.MARKDOWN;
}

/**
 * Mock generation: runs the (stubbed) agent pipeline, produces every registered
 * artifact, and upserts them as GeneratedFile rows. No real AI yet — the
 * structured files (JSON/CSS/theme/preview) are real; prose is placeholder.
 */
export async function generateMockFiles(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const brief = (project.businessDetails as BusinessBrief | null) ?? {
    businessName: project.name,
  };

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "GENERATING" },
  });

  const baseCtx: GenerationContext = { projectId, brief };
  const ctx = await runPipeline(baseCtx);
  const artifacts = generateAll(ctx);

  await prisma.$transaction([
    ...artifacts.map((a) =>
      prisma.generatedFile.upsert({
        where: { projectId_name: { projectId, name: a.name } },
        create: {
          projectId,
          name: a.name,
          kind: fileKindFor(a.name),
          content: a.content,
          mimeType: a.mimeType,
        },
        update: { content: a.content, mimeType: a.mimeType },
      }),
    ),
    prisma.project.update({
      where: { id: projectId },
      data: { status: "READY" },
    }),
  ]);

  return artifacts.length;
}
