import { type GeneratorContext, type MdArtifact, paletteOf, fontsOf, Assumptions } from "./context";
import { exportPageToPlan } from "@/lib/section-editor/export-section";

// REACT_EXPORT_PLAN.json — a machine-readable handoff plan for a React build.
// It follows the LATEST approved editor state (SITEMAP_CANVAS pages + sections),
// mapping each section to its named React component and labelling every value's
// source. Consumed at export/handoff time.
export function generateReactExportPlanMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const m = ctx.tokens?.metrics ?? null;
  const measured = ctx.tokens?.confidence === "high";
  const tokenSource = measured ? "extracted from rendered styles" : ctx.tokens ? "reference-inspired" : "assumed";

  // Prefer the user's edited canvas; fall back to the brief's selected pages.
  // All section mapping lives in lib/section-editor/export-section.ts — the
  // plan carries the EDITED content, final item order, chosen variants,
  // layout, media assets (placeholders + AI prompts) and motion settings.
  const canvasPages = ctx.canvas?.pages ?? [];
  const pages = canvasPages.length
    ? canvasPages.map(exportPageToPlan)
    : (ctx.input.brief.keyItems.length ? ctx.input.brief.keyItems : ["Home"]).map((name) => ({
        name,
        source: "user-added" as const,
        status: "draft",
        pageType: null,
        sections: [],
      }));

  const plan = {
    project: ctx.input.projectName,
    business: ctx.input.clientName ?? ctx.input.projectName,
    generatedAt: new Date().toISOString(),
    followsEditorState: canvasPages.length > 0,
    styleTokens: {
      source: tokenSource,
      colors: palette.map((c) => ({ name: c.name, value: c.value })),
      fonts: { heading: fonts[1] ?? fonts[0] ?? null, body: fonts[0] ?? null },
      radiusPx: (m as { radiusPx?: number } | null)?.radiusPx ?? 12,
      spacingPx: m?.spacingBase ?? 8,
      containerWidthPx: m?.containerWidth ?? 1200,
    },
    animation: {
      source: ctx.animation ? "extracted" : "assumed",
      rules: ctx.animation?.recommendedAnimationRules ?? [
        "Subtle fade-up on scroll; small hover lifts; honor prefers-reduced-motion.",
      ],
    },
    componentDir: "src/components/sections/",
    // Reference-inspired design patterns (from the Section Reference Library).
    // Build ORIGINAL sections in this direction — never copy the reference.
    referencePatterns: (ctx.references?.patterns ?? []).filter((p) => p.approved).map((p) => ({
      id: p.id,
      name: p.name,
      sectionType: p.sectionType,
      layoutPattern: p.layoutPattern,
      interactionPattern: p.interactionPattern,
      componentName: p.matchedComponent?.componentName ?? p.customSpec?.suggestedComponentName ?? null,
      needsNewComponent: Boolean(p.customSpec?.needsNewComponent),
      customSpec: p.customSpec ?? null,
      styleTags: p.styleTags,
      originalityRules: p.similarityRules,
      imageRule: "Use grey placeholders; every asset carries an aiPrompt; never reuse reference photos/logos/text.",
    })),
    pages,
    exportNotes: [
      "Build each page from its `sections` array, in order.",
      "Import each section's `component` from componentDir.",
      "Sections with `isCustomComponent: true` are admin-authored: create their `customComponent.code` as the component file verbatim (default export receiving { content, theme }); do NOT import from componentDir. Pass styleTokens as `theme` and the section's `content`.",
      "Pass styleTokens as the section theme; do not hardcode colors/fonts.",
      "Skip sections with status 'rejected'; render 'draft'/'approved'.",
      "Every value carries a `source` label — treat 'assumed' as a TODO to confirm.",
    ],
    assumptions: a.list(),
  };

  return { name: "REACT_EXPORT_PLAN.json", content: JSON.stringify(plan, null, 2) };
}
