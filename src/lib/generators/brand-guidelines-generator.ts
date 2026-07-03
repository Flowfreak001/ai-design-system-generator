import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  visionBlock,
  who,
  paletteOf,
  fontsOf,
  analysisConfidenceNote,
} from "./context";

// BRAND_GUIDELINES.md — the foundation document. A comprehensive brand guide
// (logo, color system, typography direction, tone, imagery, do/don't) built
// from real evidence where available, assumptions clearly flagged. Generated in
// the BRAND phase, before any design-system file.
export function generateBrandGuidelinesMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const c = (ctx.tokens?.color ?? {}) as Record<string, string>;
  const bodyInk = c.ink;
  const headingInk = c["ink-heading"];
  const accents = Object.entries(c).filter(([k]) => k.startsWith("accent")).map(([, v]) => v);
  const host = ctx.tokens?.sourceUrl ? String(ctx.tokens.sourceUrl).replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
  const measured = ctx.tokens?.confidence === "high";

  const tone = brief.brandPersonality?.trim() || brief.toneOfVoice?.trim();
  if (!tone) a.add("No brand personality/tone provided — a dependable, clear voice is proposed.");
  if (!brief.primaryColor && !accents.length) a.add("No brand color provided or extracted — neutral system proposed until brand assets exist.");

  const content = `# BRAND GUIDELINES — ${name}

_The foundation of the design system. Everything downstream (DESIGN, COMPONENTS, CONTENT, UX) must follow this._

${analysisConfidenceNote(ctx)}

## 1. Brand at a glance
- **Business:** ${name}${brief.businessType ? ` — ${brief.businessType}` : ""}
- **Goal:** ${brief.goal?.trim() || "_Not specified_"}
- **Audience:** ${brief.targetAudience?.trim() || "_Not specified_"}
${host ? `- **Reference site (evidence):** ${host}${measured ? " — styles measured from the rendered page" : ""}` : "- **Reference site:** none provided — guidance is assumption-based."}

## 2. Logo usage
- Clear space: keep at least the logo's cap-height of padding on all sides.
- Minimum size: 24px tall (digital). Never stretch, recolor, rotate, or add effects.
- On busy imagery use the single-color (mono) lockup with a subtle scrim.
_${brief.notes?.trim() ? `Brand note: ${brief.notes.trim()}` : "No logo file provided — upload one on the References tab; these rules apply once it exists."}_

## 3. Color system
${palette.map((p) => `- \`${p.value}\` — **${p.name}**`).join("\n")}
- Body text: ${bodyInk ? `\`${bodyInk}\`${measured ? " (measured)" : ""}` : "`#111111` (assumed)"}${headingInk ? ` · Headings: \`${headingInk}\` (measured)` : ""}
Rules:
- Neutrals carry surfaces and text; chromatic accents are for CTAs, links, and state — never large fills.
- Maintain WCAG AA (≥4.5:1) for body text on its background.

## 4. Typography direction
- **Body font:** ${fonts[0]}${fonts[1] ? ` · **Display/heading:** ${fonts[1]}` : ""}
- Heading weight ${ctx.tokens?.metrics?.headingWeight ?? "600–700"}${ctx.tokens?.metrics?.headingWeight ? " (measured)" : " (assumed)"}, body ${ctx.tokens?.metrics?.bodyFontSizePx ?? 16}px${ctx.tokens?.metrics?.bodyFontSizePx ? " (measured)" : ""}.
- Keep a clear size hierarchy; one h1 per page; sentence case unless the brand explicitly uppercases.

## 5. Tone of voice
- ${tone || "Confident, clear, and credible — short sentences, concrete benefits, no hype."}
- Speak to outcomes for ${brief.targetAudience?.trim() || "the audience"}; plain language over jargon.
- Avoid unearned superlatives ("revolutionary", "world-class").

## 6. Visual mood & imagery
- ${accents.length ? `Grounded in the measured palette (accents ${accents.slice(0, 3).join(", ")}).` : "Calm, premium mood: light surfaces, one confident accent, real photography."}
- Real product/team photography over stock; one consistent treatment tied to the palette.
- Fixed aspect-ratio media so nothing shifts on load.

## 7. Do / Don't
**Do:** consistent spacing, restrained palette, accessible contrast, real content, one idea per section.
**Don't:** invent colors outside this system, stock-photo clutter, competing accents, decorative-only motion.
${visionBlock(ctx, ["visualLayout", "colorUsage", "imageTreatment"])}
${a.section()}
`;
  return { name: "BRAND_GUIDELINES.md", content };
}
