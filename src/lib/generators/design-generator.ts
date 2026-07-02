import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  who,
  paletteOf,
  fontsOf,
  analysisConfidenceNote,
} from "./context";

/** State a measured value, or a clearly-labeled assumption. */
function measured<T>(
  a: Assumptions,
  value: T | undefined | null,
  render: (v: T) => string,
  fallbackText: string,
  assumption: string,
): string {
  if (value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0)) {
    return render(value as T);
  }
  a.add(assumption);
  return `${fallbackText} _(assumed — not measurable from the reference site)_`;
}

export function generateDesignMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const m = ctx.tokens?.metrics ?? null;
  // Only real length values — CSS keywords like "inherit" are extraction noise.
  const probeBtn = (ctx.tokens as unknown as { renderedProbe?: { button?: { textTransform?: string; letterSpacing?: string } | null } } | null)?.renderedProbe?.button;
  const radii = [
    ...(ctx.tokens?.metrics?.button?.radius ? [String(ctx.tokens.metrics.button.radius)] : []),
    ...Object.values(ctx.tokens?.radius ?? {}).map(String).filter((r) => /^\d/.test(r)),
  ];
  const shadows = Object.values(ctx.tokens?.shadow ?? {}).map(String);
  const anim = ctx.animation;
  const visualNotes = ctx.visual?.notes ?? [];
  const styleWish = ctx.input.brief.stylePreference;

  const transitions = anim?.timingAndEasing ?? [];

  const content = `# DESIGN — ${who(ctx)}

${analysisConfidenceNote(ctx)}

## Visual style summary
${visualNotes[0] ?? "No visual sample available — direction below is proposed from the brief."}
${styleWish ? `Client style preference: **${styleWish}**.` : ""}
${anim ? `Motion character (measured): ${anim.globalMotionStyle}` : ""}

## Color palette and usage rules
${palette.map((c) => `- \`${c.value}\` — ${c.name}`).join("\n")}

Rules:
- \`ink\`/neutrals carry text and large surfaces; chromatic accents are for CTAs, links, and state.
- Body text must hold ≥4.5:1 contrast on its background (WCAG AA).

## Typography rules
- Primary: **${fonts[0]}**${fonts[1] ? ` · Display/accent: ${fonts[1]}` : ""}
- Body size: ${measured(a, m?.bodyFontSizePx, (v) => `**${v}px** (measured)`, "16px", "Body font size not measurable — 16px proposed.")}
- Line height: ${measured(a, m?.bodyLineHeight, (v) => `**${v}** (measured)`, "1.5–1.7", "Body line-height not measurable — 1.5–1.7 proposed.")}
- Heading weight: ${measured(a, m?.headingWeight, (v) => `**${v}** (measured from h1/h2)`, "600–700", "Heading weight not measurable — 600–700 proposed.")}
- Type scale in use: ${measured(a, m?.typeScale, (v) => v.map((x) => `${x}px`).join(" / ") + " (measured)", "14 / 16 / 20 / 28 / 40+", "Type scale not measurable — a standard scale is proposed.")}
- One h1 per page.

## Layout system
- Container width: ${measured(a, m?.containerWidth, (v) => `**${v}px** (measured)`, "1180–1240px", "Container width not measurable — 1180–1240px proposed.")}
- Breakpoints: ${measured(a, m?.breakpoints, (v) => v.map((x) => `${x}px`).join(" / ") + " (measured from media queries)", "640 / 768 / 1024 / 1280", "No media queries found — standard breakpoints proposed.")}
- One idea per section; generous vertical rhythm between sections.

## Spacing rules
- Base rhythm: ${measured(a, m?.spacingBase, (v) => `**${v}px** grid (measured — most spacing values divide by ${v})`, "4/8px", "Spacing rhythm not measurable — 4/8px grid proposed.")}
- Common spacing values: ${measured(a, m?.spacingScale, (v) => v.map((x) => `${x}px`).join(", ") + " (measured)", "8, 16, 24, 48, 96", "Spacing values not measurable — a standard progression is proposed.")}

## Buttons
- Radius: ${measured(a, m?.button?.radius, (v) => `**${v}** (measured)`, "10px", "Button radius not measurable — 10px proposed.")}
- Weight: ${measured(a, m?.button?.fontWeight, (v) => `**${v}** (measured)`, "500–600", "Button weight not measurable — medium proposed.")}
- Padding: ${measured(a, m?.button ? (m.button.paddingY !== undefined ? m.button : undefined) : undefined, (v) => `**${v.paddingY}px${v.paddingX !== undefined ? ` / ${v.paddingX}px` : ""}** (measured)`, "12px / 22px", "Button padding not measurable — 12/22px proposed.")}
- Hover transition: ${measured(a, m?.button?.transitionMs, (v) => `**${v}ms** (measured)`, "150–300ms", "Button transition not measurable — 150–300ms proposed.")}
${probeBtn ? `- Text casing: ${probeBtn.textTransform && probeBtn.textTransform !== "none" ? `**${probeBtn.textTransform}** (measured)` : "sentence case (measured — no transform on the live CTA)"}${probeBtn.letterSpacing && probeBtn.letterSpacing !== "normal" ? `, letter-spacing **${probeBtn.letterSpacing}** (measured)` : ""}.\n` : ""}- Primary uses the \`accent\` token; secondary is bordered on white. Min height 44px, visible focus ring.

## Cards
- White surface, 1px border${radii.length ? `, radius **${radii[0]}** (measured)` : ""}${shadows.length ? `, shadow \`${shadows[0]}\` (measured)` : ""}.
- Hover: ≤4px lift — never bounce.

## Forms
- Visible labels (never placeholder-only), helper text, inline validation on blur.
- Errors below the field in the semantic danger color; focus moves to the first invalid field.

## Navigation
- Sticky header, gains a bottom border on scroll; ≤6 items; accent CTA on the right.

## Footer
- Grouped link columns + one-line brand statement; calm, low-contrast, well-spaced.

## Image treatment
- Real product/team photography over stock; one consistent treatment tied to the palette.
- Fixed aspect-ratio boxes so nothing shifts on load.

## Icon style
- One family, consistent stroke width, 20–24px; never emojis as icons.

## Responsive rules
- Mobile-first across the ${m?.breakpoints?.length ? "measured breakpoints above" : "proposed breakpoints"}; no horizontal scroll; tap targets ≥44px.

## Design do's and don'ts
**Do:** strong hierarchy, consistent spacing, restrained palette, accessible contrast, real content.
**Don't:** invent values outside the measured tokens above; cramped sections; template look.

## AI build instructions
- Use the palette, fonts, and measured values above as exact tokens — do not invent new ones.
- Implement components per COMPONENTS.md and motion per ANIMATION.md${transitions.length ? ` (site's measured timing samples: ${transitions.slice(0, 3).join("; ")})` : ""}.
- Every page must pass: one h1, AA contrast, keyboard navigable, no layout shift on image load.

${a.section()}
`;
  return { name: "DESIGN.md", content };
}
