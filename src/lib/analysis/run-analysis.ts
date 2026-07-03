// Website analysis pipeline: fetch the project's site (or first reference
// URL), run the static extractors, and persist the four analysis artifacts as
// versioned GeneratedFile records with an AgentRun trail. No AI, no browser.

import { prisma } from "@/lib/db/client";
import { toGenerationInput } from "@/lib/projects";
import { fetchSiteSource, analyzeAnimations, extractAnimationAnalysis, fallbackAnimationAnalysis } from "./animation-extractor";
import { analyzeWebsiteStructure, analyzeVisualAndTokens } from "./site-analyzer";
import { runRenderedProbe, scanPages, type RenderedProbeResult } from "./rendered-probe";
import { buildMultiPageAnalysis } from "./section-evidence";

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
  // Heading text color, measured from rendered h1/h2 — often darker than the
  // body ink. Recorded as a distinct token when it meaningfully differs and
  // contrasts the canvas, so the specimen can render headings in their true color.
  const hc = probe.typography.headingColor;
  if (hc && Math.abs(lum(hc) - bgLum) > 0.35 && (!color.ink || Math.abs(lum(hc) - lum(color.ink)) > 0.06)) {
    color["ink-heading"] = hc;
  }

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
      components: probe.components,
      headingTransform: probe.typography.headingTransform,
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
  // Primary page (design-token source): the client's own site first.
  const url =
    input.brief.existingWebsiteUrl?.trim() ||
    input.brief.pageUrls.find(isUrl) ||
    input.brief.referenceUrls.find(isUrl) ||
    project.business?.website ||
    input.brief.brandRefs.find(isUrl) ||
    null;
  // All the client's pages to scan for the real section/component inventory.
  const allPageUrls = [
    ...(input.brief.existingWebsiteUrl?.trim() ? [input.brief.existingWebsiteUrl.trim()] : []),
    ...input.brief.pageUrls.filter(isUrl),
    ...input.brief.referenceUrls.filter(isUrl),
  ]
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter((u, i, arr) => arr.indexOf(u) === i)
    .slice(0, 10);

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
    await step(
      "Analyzed static CSS",
      `${Object.keys(tokens.color ?? {}).length} color tokens, ` +
        `${website.sectionsDetected.length} page sections, ` +
        `${website.navigationLinks?.length ?? 0} nav links detected from the stylesheet + markup.`,
    );
    const animation = source
      ? extractAnimationAnalysis(source, url as string)
      : url
        ? fallbackAnimationAnalysis(url, "site could not be fetched")
        : await analyzeAnimations(null);

    // Rendered-page probe (real browser). Streams live sub-steps as it works.
    // Optional: falls back cleanly when no browser is available (e.g. Railway).
    const probe = url ? await runRenderedProbe(url, async (t, d) => { await step(t, d); }) : null;
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
          `${probe.scrollFindings.length + probe.stickyFindings.length} scroll behaviors verified` +
          (probe.content.faq.length
            ? `, ${probe.content.faq.length} FAQ pairs${probe.content.faqSourceUrl && probe.content.faqSourceUrl !== url ? ` (crawled from ${probe.content.faqSourceUrl.replace(/^https?:\/\//, "")})` : ""}`
            : "") +
          ".",
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

    // ---- Multi-page evidence: scan every provided page for its real sections
    // and components, then build the inventory + accuracy score. ------------
    const pages = allPageUrls.length
      ? await scanPages(allPageUrls, async (t, d) => { await step(t, d); })
      : [];
    const multiPage = buildMultiPageAnalysis(projectId, pages, probe);
    // Make the evidence available to the preview + MD generators (flows via
    // DESIGN_TOKENS.json), so sections are rendered/generated from detection.
    (tokens as unknown as Record<string, unknown>).multiPage = {
      scope: multiPage.scope,
      note: multiPage.note,
      componentInventory: multiPage.componentInventory,
      sectionInventory: multiPage.sectionInventory,
      pagesAnalyzed: multiPage.pagesAnalyzed,
      accuracy: multiPage.accuracy,
      faqDetected: multiPage.faqDetected,
      recommendedPagesMissing: multiPage.recommendedPagesMissing,
    };
    await step(
      "Built section evidence",
      `${multiPage.pagesAnalyzed.filter((p) => p.ok).length}/${allPageUrls.length || 0} page(s) scanned · ` +
        `${multiPage.sectionEvidence.length} section evidence entries · ` +
        `accuracy: ${multiPage.accuracy.level} (${multiPage.accuracy.score}/100). ${multiPage.note}`,
    );

    await saveJsonFile(projectId, "WEBSITE_ANALYSIS.json", website);
    await saveJsonFile(projectId, "VISUAL_ANALYSIS.json", visual);
    await saveJsonFile(projectId, "DESIGN_TOKENS.json", tokens);
    await saveJsonFile(projectId, "ANIMATION_ANALYSIS.json", animation);
    // Rendered-browser artifacts — the highest-priority source, saved as their
    // own traceable files (not just merged) so every value can be audited.
    const savedFiles = ["WEBSITE_ANALYSIS.json", "VISUAL_ANALYSIS.json", "DESIGN_TOKENS.json", "ANIMATION_ANALYSIS.json"];
    if (probe) {
      await saveJsonFile(projectId, "RENDERED_STYLE_ANALYSIS.json", {
        source: "Playwright headless Chromium — computed styles of the rendered page (highest-priority source).",
        url,
        palette: probe.palette,
        typography: probe.typography,
        button: probe.button,
        components: probe.components,
        containerWidth: probe.containerWidth,
        content: probe.content,
      });
      savedFiles.push("RENDERED_STYLE_ANALYSIS.json");
      if (probe.scrollFindings.length || probe.stickyFindings.length) {
        await saveJsonFile(projectId, "SCROLL_ANIMATION_ANALYSIS.json", {
          source: "Verified by scrolling the rendered page (opacity/transform/sticky deltas).",
          scrollAnimations: probe.scrollFindings,
          stickyPinned: probe.stickyFindings,
        });
        savedFiles.push("SCROLL_ANIMATION_ANALYSIS.json");
      }
    }
    await saveJsonFile(projectId, "MULTI_PAGE_WEBSITE_ANALYSIS.json", multiPage);
    savedFiles.push("MULTI_PAGE_WEBSITE_ANALYSIS.json");
    await step("Saved analysis files", `${savedFiles.join(", ")} (versioned).`);

    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        output: { files: savedFiles, confidence: animation.meta.confidence },
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
