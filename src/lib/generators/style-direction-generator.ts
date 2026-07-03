import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  paletteOf,
  fontsOf,
} from "./context";

// STYLE_DIRECTION.json — a machine-readable style direction produced in the
// BRAND phase, alongside BRAND.md / BRAND_GUIDELINES.md / CREATIVE_DIRECTION.md.
// It captures the color / type / shape direction with explicit source labels so
// downstream stages (Style Guide, Design Canvas, MD files) can consume it
// without re-deriving, and never invent values.
export function generateStyleDirectionMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const m = ctx.tokens?.metrics ?? null;
  const c = (ctx.tokens?.color ?? {}) as Record<string, string>;
  const measured = ctx.tokens?.confidence === "high";
  const host = ctx.tokens?.sourceUrl
    ? String(ctx.tokens.sourceUrl).replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  // Evidence source label, per the accuracy priority order.
  const source = ctx.tokens && measured
    ? "extracted"
    : ctx.ai?.source === "openai_vision"
      ? "vision-detected"
      : ctx.tokens
        ? "inferred"
        : brief.primaryColor
          ? "user-added"
          : "assumed";

  const data = {
    project: ctx.input.projectName,
    business: who(ctx),
    generatedFrom: {
      referenceSite: host,
      renderedStyles: measured,
      openAiVision: ctx.ai?.source === "openai_vision",
      userBrandColor: Boolean(brief.primaryColor),
      source,
    },
    color: {
      source,
      palette: palette.map((p) => ({ name: p.name, value: p.value })),
      bodyInk: c.ink ?? (brief.primaryColor ? null : "#111111"),
      headingInk: c["ink-heading"] ?? null,
      rules: [
        "Neutrals carry surfaces and text.",
        "Chromatic accents for CTAs, links, and state only — never large fills.",
        "Maintain WCAG AA (>=4.5:1) for body text.",
      ],
    },
    typography: {
      source: measured ? "extracted" : "assumed",
      bodyFont: fonts[0] ?? null,
      displayFont: fonts[1] ?? fonts[0] ?? null,
      bodyFontSizePx: m?.bodyFontSizePx ?? 16,
      headingWeight: m?.headingWeight ?? 600,
      textTransform: (m as { textTransform?: string } | null)?.textTransform ?? "none",
    },
    shape: {
      source: measured ? "extracted" : "assumed",
      radiusPx: (m as { radiusPx?: number } | null)?.radiusPx ?? 12,
      spacingBasePx: m?.spacingBase ?? 8,
      containerWidthPx: m?.containerWidth ?? 1200,
    },
    motion: {
      source: ctx.animation ? "extracted" : "assumed",
      rules: ctx.animation?.recommendedAnimationRules ?? [
        "Subtle fade-up on scroll; small hover lifts; honor prefers-reduced-motion.",
      ],
    },
    tone: brief.brandPersonality || brief.toneOfVoice || null,
    referenceLearn: brief.referenceLearn ?? [],
    assumptions: a.list(),
  };

  return { name: "STYLE_DIRECTION.json", content: JSON.stringify(data, null, 2) };
}

function who(ctx: GeneratorContext) {
  return ctx.input.clientName || ctx.input.projectName || "the business";
}
