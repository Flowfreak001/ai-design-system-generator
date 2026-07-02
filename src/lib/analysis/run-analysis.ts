// Website analysis pipeline: fetch the project's site (or first reference
// URL), run the static extractors, and persist the four analysis artifacts as
// versioned GeneratedFile records with an AgentRun trail. No AI, no browser.

import { prisma } from "@/lib/db/client";
import { toGenerationInput } from "@/lib/projects";
import { fetchSiteSource, analyzeAnimations, extractAnimationAnalysis, fallbackAnimationAnalysis } from "./animation-extractor";
import { analyzeWebsiteStructure, analyzeVisualAndTokens } from "./site-analyzer";

async function saveJsonFile(projectId: string, name: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  const existing = await prisma.generatedFile.findUnique({
    where: { projectId_name: { projectId, name } },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  const version = (existing?.versions[0]?.version ?? 0) + 1;
  const saved = await prisma.generatedFile.upsert({
    where: { projectId_name: { projectId, name } },
    create: { projectId, name, type: "json", content },
    update: { content, type: "json" },
  });
  await prisma.fileVersion.create({
    data: { fileId: saved.id, version, content },
  });
}

export async function runWebsiteAnalysis(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { inputs: true, business: { select: { website: true } } },
  });
  if (!project) throw new Error("Project not found");

  const input = toGenerationInput(project);
  const isUrl = (r: string) => /^https?:\/\//i.test(r);
  const url =
    input.brief.existingWebsiteUrl?.trim() ||
    input.brief.referenceUrls.find(isUrl) ||
    project.business?.website ||
    input.brief.brandRefs.find(isUrl) ||
    null;

  const run = await prisma.agentRun.create({
    data: {
      projectId,
      name: "Website analysis run",
      status: "running",
      input: { url },
    },
  });
  const step = (title: string, detail: string) =>
    prisma.agentStep.create({
      data: { runId: run.id, title, status: "completed", detail },
    });

  try {
    await step("Resolved target URL", url ? `Analyzing ${url}` : "No URL on the project — using safe fallbacks.");

    const source = url ? await fetchSiteSource(url) : null;
    await step(
      "Fetched site source",
      source
        ? `Fetched HTML (${source.html.length.toLocaleString()} chars) + CSS (${source.css.length.toLocaleString()} chars).`
        : "Source unavailable — analyzers will report low confidence with assumptions.",
    );

    const website = analyzeWebsiteStructure(source, url);
    const { visual, tokens } = analyzeVisualAndTokens(source, url);
    const animation = source
      ? extractAnimationAnalysis(source, url as string)
      : url
        ? fallbackAnimationAnalysis(url, "site could not be fetched")
        : await analyzeAnimations(null);

    await step(
      "Extracted animation patterns",
      `${animation.detectedLibraries.length} libraries, ` +
        `${animation.scrollAnimations.length + animation.entranceAnimations.length + animation.hoverInteractions.length} motion findings ` +
        `(confidence: ${animation.meta.confidence}).`,
    );

    await saveJsonFile(projectId, "WEBSITE_ANALYSIS.json", website);
    await saveJsonFile(projectId, "VISUAL_ANALYSIS.json", visual);
    await saveJsonFile(projectId, "DESIGN_TOKENS.json", tokens);
    await saveJsonFile(projectId, "ANIMATION_ANALYSIS.json", animation);
    await step(
      "Saved analysis files",
      "WEBSITE_ANALYSIS.json, VISUAL_ANALYSIS.json, DESIGN_TOKENS.json, ANIMATION_ANALYSIS.json (versioned).",
    );

    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        output: {
          files: ["WEBSITE_ANALYSIS.json", "VISUAL_ANALYSIS.json", "DESIGN_TOKENS.json", "ANIMATION_ANALYSIS.json"],
          confidence: animation.meta.confidence,
        },
      },
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
