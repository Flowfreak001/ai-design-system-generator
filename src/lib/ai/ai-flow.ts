// AI Vision analysis flow. Loads the project's section screenshots + the
// rendered computed styles, runs OpenAI Vision per screenshot, and saves
// AI_SCREENSHOT_ANALYSIS.json with an AgentRun trail. Never blocks normal MD
// generation; degrades to a clearly-labelled fallback when the key is missing.

import { prisma } from "@/lib/db/client";
import { hasOpenAIKey, VISION_MODEL } from "./openai-client";
import { analyzeSectionScreenshotWithOpenAI } from "./openai-vision";
import type { AiScreenshotAnalysis, VisionAnalysis } from "./types";

type Shot = { id: string; name: string; dataUrl: string; note?: string };

const SECTION_KEYWORDS = [
  "hero", "navbar", "nav", "header", "footer", "pricing", "faq", "testimonial",
  "gallery", "portfolio", "form", "contact", "booking", "card", "cta",
];

/** Infer the section type from the screenshot's note/name (e.g. "hero — desktop"). */
function sectionTypeFrom(shot: Shot): string {
  const hay = `${shot.note ?? ""} ${shot.name}`.toLowerCase();
  const hit = SECTION_KEYWORDS.find((k) => hay.includes(k));
  return hit === "nav" || hit === "header" ? "navbar" : hit ?? "section";
}

function pageTypeFrom(shot: Shot): string {
  const hay = `${shot.note ?? ""} ${shot.name}`.toLowerCase();
  if (/about/.test(hay)) return "about";
  if (/service/.test(hay)) return "services";
  if (/pric/.test(hay)) return "pricing";
  if (/contact|booking|form/.test(hay)) return "contact";
  if (/faq/.test(hay)) return "faq";
  return "homepage";
}

async function readJson<T>(projectId: string, name: string): Promise<T | null> {
  const f = await prisma.generatedFile.findUnique({ where: { projectId_name: { projectId, name } } });
  if (!f) return null;
  try {
    return JSON.parse(f.content) as T;
  } catch {
    return null;
  }
}

export async function runAiVisionAnalysis(projectId: string): Promise<string> {
  const run = await prisma.agentRun.create({
    data: { projectId, name: "AI Vision analysis", status: "running", input: {} },
  });
  const step = (title: string, detail: string) =>
    prisma.agentStep.create({ data: { runId: run.id, title, status: "completed", detail } });

  try {
    const shotInput = await prisma.projectInput.findFirst({ where: { projectId, category: "screenshots" } });
    const shots = ((shotInput?.data as { shots?: Shot[] } | null)?.shots ?? []).filter((s) => s.dataUrl?.startsWith("data:image/"));
    await step("Loaded screenshots", `${shots.length} section screenshot(s) found for this project.`);

    const keyPresent = hasOpenAIKey();
    if (!keyPresent) {
      await step("OpenAI key check", "OPENAI_API_KEY not set — running in fallback mode (no real vision analysis).");
    }

    // Factual computed styles from the rendered probe, passed to Vision so it
    // never contradicts measured values.
    const rendered = await readJson<{ button?: unknown; components?: unknown; typography?: unknown; palette?: unknown }>(
      projectId,
      "RENDERED_STYLE_ANALYSIS.json",
    );
    const computedStyles = rendered
      ? { button: rendered.button, components: rendered.components, typography: rendered.typography, palette: rendered.palette }
      : null;

    const sections: VisionAnalysis[] = [];
    for (const shot of shots.slice(0, 12)) {
      const sectionType = sectionTypeFrom(shot);
      const pageType = pageTypeFrom(shot);
      await step("Analyzing screenshot", `${shot.note || shot.name} → section: ${sectionType}, page: ${pageType}${keyPresent ? " (OpenAI Vision)" : " (fallback)"}`);
      const result = await analyzeSectionScreenshotWithOpenAI({
        projectId,
        pageType,
        sectionType,
        screenshotDataUrl: shot.dataUrl,
        computedStyles,
        userNotes: shot.note,
      });
      sections.push({ ...result, label: shot.note || shot.name });
    }

    const source: AiScreenshotAnalysis["source"] = keyPresent && sections.some((s) => s.source === "openai_vision") ? "openai_vision" : "fallback";
    const analysis: AiScreenshotAnalysis = {
      source,
      model: keyPresent ? VISION_MODEL : null,
      generatedAt: new Date().toISOString(),
      keyPresent,
      sectionsAnalyzed: sections.length,
      sections,
      warnings: keyPresent ? [] : ["OPENAI_API_KEY missing — set it to run real OpenAI Vision analysis."],
    };

    const content = JSON.stringify(analysis, null, 2);
    const prior = await prisma.generatedFile.findUnique({
      where: { projectId_name: { projectId, name: "AI_SCREENSHOT_ANALYSIS.json" } },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    const version = (prior?.versions[0]?.version ?? 0) + 1;
    const saved = await prisma.generatedFile.upsert({
      where: { projectId_name: { projectId, name: "AI_SCREENSHOT_ANALYSIS.json" } },
      create: { projectId, name: "AI_SCREENSHOT_ANALYSIS.json", type: "json", content },
      update: { content, type: "json" },
    });
    await prisma.fileVersion.create({ data: { fileId: saved.id, version, content } });

    await step(
      "Saved AI analysis",
      `AI_SCREENSHOT_ANALYSIS.json (versioned) · ${sections.length} section(s) · source: ${source}.`,
    );

    await prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "completed", output: { file: "AI_SCREENSHOT_ANALYSIS.json", source, sections: sections.length } },
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
