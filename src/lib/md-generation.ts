// MD Generator Agent orchestration: load project input + analysis JSON files
// (safely parsed), run all MD generators, persist versioned GeneratedFiles,
// and record an AgentRun with one step per agent. Deterministic — no AI yet.

import { prisma } from "@/lib/db/client";
import { toGenerationInput } from "@/lib/projects";
import { BRAND_GENERATORS, DESIGN_GENERATORS, type GeneratorContext } from "@/lib/generators";
import type { AnimationAnalysis } from "@/lib/analysis/animation-extractor";
import type { AiScreenshotAnalysis } from "@/lib/ai/types";
import type {
  WebsiteAnalysis,
  VisualAnalysis,
  TokensAnalysis,
} from "@/lib/analysis/site-analyzer";

function safeParse<T>(content: string | undefined | null): T | null {
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function loadContext(projectId: string): Promise<{ ctx: GeneratorContext; analysisCount: number }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { inputs: true },
  });
  if (!project) throw new Error("Project not found");

  const jsonFiles = await prisma.generatedFile.findMany({
    where: {
      projectId,
      name: {
        in: [
          "WEBSITE_ANALYSIS.json",
          "VISUAL_ANALYSIS.json",
          "DESIGN_TOKENS.json",
          "ANIMATION_ANALYSIS.json",
          "AI_SCREENSHOT_ANALYSIS.json",
        ],
      },
    },
    select: { name: true, content: true },
  });
  const byName = new Map(jsonFiles.map((f) => [f.name, f.content]));

  const ctx: GeneratorContext = {
    input: toGenerationInput(project),
    website: safeParse<WebsiteAnalysis>(byName.get("WEBSITE_ANALYSIS.json")),
    visual: safeParse<VisualAnalysis>(byName.get("VISUAL_ANALYSIS.json")),
    tokens: safeParse<TokensAnalysis>(byName.get("DESIGN_TOKENS.json")),
    animation: safeParse<AnimationAnalysis>(byName.get("ANIMATION_ANALYSIS.json")),
    ai: safeParse<AiScreenshotAnalysis>(byName.get("AI_SCREENSHOT_ANALYSIS.json")),
  };
  return { ctx, analysisCount: jsonFiles.length };
}

async function saveMdFile(projectId: string, name: string, content: string) {
  const existing = await prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name } },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = (existing?.versions[0]?.version ?? 0) + 1;
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name } },
    create: { projectId, name, type: name.startsWith("PROMPT_") ? "prompt" : "markdown", content },
    update: { content },
  });
  await prisma.fileVersion.create({ data: { fileId: saved.id, version, content } });
  return version;
}

type Gen = { agent: string; run: (ctx: GeneratorContext) => { name: string; content: string } };

async function runGenerators(projectId: string, runName: string, generators: Gen[]) {
  const { ctx, analysisCount } = await loadContext(projectId);

  const run = await prisma.agentRun.create({
    data: { projectId, name: runName, status: "running", input: { analysisFilesFound: analysisCount } },
  });
  const step = (title: string, detail: string) =>
    prisma.agentStep.create({ data: { runId: run.id, title, status: "completed", detail } });

  try {
    await step(
      "Loaded inputs",
      `Project brief + ${analysisCount} analysis file(s)${analysisCount === 0 ? " — no scan yet, values will be marked as assumptions" : ""}.`,
    );

    const produced: string[] = [];
    for (const g of generators) {
      const artifact = g.run(ctx);
      const version = await saveMdFile(projectId, artifact.name, artifact.content);
      produced.push(artifact.name);
      await step(g.agent, `Generated ${artifact.name} (v${version}).`);
    }

    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "completed", output: { files: produced } },
    });
    await prisma.project.update({ where: { id: projectId }, data: { status: "IN_PROGRESS" } });
    return produced;
  } catch (err) {
    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "failed", output: { error: err instanceof Error ? err.message : String(err) } },
    });
    throw err;
  }
}

/** Phase 1 — brand foundation (BRAND.md, BRAND_GUIDELINES.md, CREATIVE_DIRECTION.md). */
export async function runBrandGeneration(projectId: string) {
  return runGenerators(projectId, "Brand guideline generation", BRAND_GENERATORS);
}

/** Phase 2 — full design system. Only after the brand guideline is approved. */
export async function runMdGeneration(projectId: string) {
  return runGenerators(projectId, "MD design-system generation", DESIGN_GENERATORS);
}
