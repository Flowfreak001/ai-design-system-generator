// Website analysis pipeline: fetch the project's site (or first reference
// URL), run the static extractors, and persist the four analysis artifacts as
// versioned GeneratedFile records with an AgentRun trail. No AI, no browser.

import { prisma } from "@/lib/db/client";
import { toGenerationInput } from "@/lib/projects";
import { fetchSiteSource, analyzeAnimations, extractAnimationAnalysis, fallbackAnimationAnalysis } from "./animation-extractor";
import { analyzeWebsiteStructure, analyzeVisualAndTokens } from "./site-analyzer";
import { runRenderedProbe, type RenderedProbeResult } from "./rendered-probe";

/** Overlay rendered-probe measurements onto the statically-derived tokens. */
function mergeRendered(
  tokens: ReturnType<typeof analyzeVisualAndTokens>["tokens"],
  probe: RenderedProbeResult,
) {
  const color: Record<string, string> = { ...tokens.color };
  // Rendered palette: accent from the real primary CTA, surfaces from painted areas.
  const accent = probe.palette.find((c) => c.role === "accent");
  if (accent) color.accent = accent.value;
  const bgs = probe.palette.filter((c) => c.role === "background");
  if (bgs[0]) color.background = bgs[0].value;
  // Ink = the heaviest text color that actually contrasts the dominant
  // background (hero sections often make white-on-color the top raw tally).
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  };
  const bgLum = lum(color.background ?? "#ffffff");
  const sat = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return Math.max(r, g, b) - Math.min(r, g, b);
  };
  const texts = probe.palette.filter((c) => c.role === "text");
  const contrasting = texts.filter((t) => Math.abs(lum(t.value) - bgLum) > 0.35);
  // Prefer neutral body text over chromatic link/accent colors.
  const ink = contrasting.find((t) => sat(t.value) < 40) ?? contrasting[0] ?? texts[0];
  if (ink) color.ink = ink.value;

  const typography: Record<string, string> = { ...tokens.typography };
  if (probe.typography.bodyFamily) typography.primary = probe.typography.bodyFamily;
  if (probe.typography.headingFamily && probe.typography.headingFamily !== probe.typography.bodyFamily) {
    typography.display = probe.typography.headingFamily;
  }

  const metrics = {
    ...(tokens.metrics ?? { breakpoints: [], spacingScale: [], typeScale: [] }),
    bodyFontSizePx: probe.typography.bodySizePx ?? tokens.metrics?.bodyFontSizePx,
    bodyLineHeight: probe.typography.bodyLineHeight ?? tokens.metrics?.bodyLineHeight,
    headingWeight: probe.typography.headingWeight ?? tokens.metrics?.headingWeight,
    containerWidth: probe.containerWidth ?? tokens.metrics?.containerWidth,
    typeScale: probe.typography.headingSizesPx.length
      ? [...new Set([...(tokens.metrics?.typeScale ?? []), ...probe.typography.headingSizesPx])].sort((a, b) => a - b).slice(0, 10)
      : tokens.metrics?.typeScale ?? [],
    button: probe.button
      ? {
          radius: probe.button.radius ?? tokens.metrics?.button?.radius,
          fontWeight: probe.button.fontWeight ?? tokens.metrics?.button?.fontWeight,
          paddingY: probe.button.paddingY ?? tokens.metrics?.button?.paddingY,
          paddingX: probe.button.paddingX ?? tokens.metrics?.button?.paddingX,
          transitionMs: probe.button.transitionMs ?? tokens.metrics?.button?.transitionMs,
        }
      : tokens.metrics?.button,
  };

  return {
    ...tokens,
    confidence: "high",
    assumptions: [
      "Measured from the RENDERED page in a real browser (computed styles); static-CSS values used only as fallback.",
    ],
    color,
    typography,
    metrics,
    renderedProbe: {
      palette: probe.palette,
      button: probe.button ?? null,
      content: probe.content,
    },
  };
}

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
    let { visual, tokens } = analyzeVisualAndTokens(source, url);
    const animation = source
      ? extractAnimationAnalysis(source, url as string)
      : url
        ? fallbackAnimationAnalysis(url, "site could not be fetched")
        : await analyzeAnimations(null);

    // Rendered-page probe (real browser). Optional: falls back cleanly when
    // no browser is available in the environment (e.g. web dyno on Railway).
    const probe = url ? await runRenderedProbe(url) : null;
    if (probe) {
      tokens = mergeRendered(tokens, probe) as typeof tokens;
      animation.scrollAnimations.push(...probe.scrollFindings);
      animation.stickyPinnedSections.push(...probe.stickyFindings);
      if (probe.scrollFindings.length || probe.stickyFindings.length) {
        animation.meta.confidence = "high";
      }
      animation.meta.assumptions.push("Scroll/sticky findings verified by rendered scroll probe.");
      await step(
        "Rendered-page probe",
        `Measured computed styles in headless Chromium: ${probe.palette.length} painted colors, ` +
          `body ${probe.typography.bodyFamily ?? "?"} ${probe.typography.bodySizePx ?? "?"}px, ` +
          `${probe.button ? "primary CTA measured" : "no CTA isolated"}, ` +
          `${probe.scrollFindings.length + probe.stickyFindings.length} scroll behaviors verified.`,
      );
    } else {
      await step(
        "Rendered-page probe",
        url
          ? "Browser probe unavailable in this environment — static-CSS heuristics used (values labeled accordingly)."
          : "Skipped — no URL.",
      );
    }

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
