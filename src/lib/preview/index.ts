// Preview orchestration: load project + tokens/animation analysis, generate
// preview.html + component-preview.html, persist as versioned GeneratedFiles,
// and log an AgentRun. Deterministic; safe when analysis is missing.

import { prisma } from "@/lib/db/client";
import { toGenerationInput } from "@/lib/projects";
import { generatePreviewHtml, type PreviewData } from "./preview-generator";
import { generateComponentPreviewHtml } from "./component-preview-generator";
import type { AnimationAnalysis } from "@/lib/analysis/animation-extractor";
import type { TokensAnalysis } from "@/lib/analysis/site-analyzer";

export { generatePreviewHtml, generateComponentPreviewHtml };
export type { PreviewData };

function safeParse<T>(content: string | undefined | null): T | null {
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function saveHtmlFile(projectId: string, name: string, content: string) {
  const existing = await prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name } },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = (existing?.versions[0]?.version ?? 0) + 1;
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name } },
    create: { projectId, name, type: "html", content },
    update: { content, type: "html" },
  });
  await prisma.fileVersion.create({ data: { fileId: saved.id, version, content } });
  return version;
}

export async function runPreviewGeneration(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { inputs: true },
  });
  if (!project) throw new Error("Project not found");

  const jsonFiles = await prisma.generatedFile.findMany({
    where: { projectId, name: { in: ["DESIGN_TOKENS.json", "ANIMATION_ANALYSIS.json"] } },
    select: { name: true, content: true },
  });
  const byName = new Map(jsonFiles.map((f) => [f.name, f.content]));

  const data: PreviewData = {
    input: toGenerationInput(project),
    tokens: safeParse<TokensAnalysis>(byName.get("DESIGN_TOKENS.json")),
    animation: safeParse<AnimationAnalysis>(byName.get("ANIMATION_ANALYSIS.json")),
  };

  const run = await prisma.agentRun.create({
    data: {
      projectId,
      name: "Preview generation",
      status: "running",
      input: { tokens: Boolean(data.tokens), animation: Boolean(data.animation) },
    },
  });
  const step = (title: string, detail: string) =>
    prisma.agentStep.create({ data: { runId: run.id, title, status: "completed", detail } });

  try {
    await step(
      "Loaded design data",
      `Tokens: ${data.tokens ? "found" : "missing (assumed palette)"} · Animation analysis: ${data.animation ? "found" : "missing"}.`,
    );
    const v1 = await saveHtmlFile(projectId, "preview.html", generatePreviewHtml(data));
    const v2 = await saveHtmlFile(projectId, "component-preview.html", generateComponentPreviewHtml(data));
    await step("Rendered previews", `preview.html (v${v1}) and component-preview.html (v${v2}) saved.`);

    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "completed", output: { files: ["preview.html", "component-preview.html"] } },
    });
  } catch (err) {
    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "failed", output: { error: err instanceof Error ? err.message : String(err) } },
    });
    throw err;
  }

  return run.id;
}
