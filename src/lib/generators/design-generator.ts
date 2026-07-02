import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  who,
  paletteOf,
  fontsOf,
  analysisConfidenceNote,
} from "./context";

export function generateDesignMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const radii = Object.values(ctx.tokens?.radius ?? {}).map(String);
  const shadows = Object.values(ctx.tokens?.shadow ?? {}).map(String);
  if (!radii.length) a.add("No border-radius values detected — 8–16px range proposed.");
  if (!shadows.length) a.add("No shadow values detected — a single subtle card shadow proposed.");

  const visualNotes = ctx.visual?.notes ?? [];
  const anim = ctx.animation;

  const content = `# DESIGN — ${who(ctx)}

${analysisConfidenceNote(ctx)}

## Visual style summary
${
    visualNotes[0] ??
    "No visual sample available — aim for a clean, high-contrast, professional look with one confident accent."
  }
${anim ? `Motion character: ${anim.globalMotionStyle}` : ""}

## Color palette and usage rules
${palette.map((c) => `- \`${c.value}\` — ${c.name}`).join("\n")}

Rules:
- First color is the workhorse; use the brightest value only for CTAs and key highlights.
- Large surfaces stay neutral; color explains state or priority, never decorates.
- Body text must hold ≥4.5:1 contrast on its background (WCAG AA).

## Typography rules
- Primary: **${fonts[0]}**${fonts[1] ? ` · Secondary: ${fonts[1]}` : ""}
- Base body 16–17px, line-height 1.5–1.7; headings 600–700 weight with tight (-0.02em) tracking.
- Scale with clear jumps (14 / 16 / 20 / 28 / 40+). One h1 per page.

## Layout system
- Max content width 1180–1240px; 12-column grid on desktop.
- One idea per section; generous vertical rhythm (96–128px between sections on desktop).

## Spacing rules
- 4/8px base rhythm for padding and gaps; section padding steps 24 → 48 → 96.

## Buttons
- Primary: solid accent, 10px radius, medium weight, 150–300ms hover transition.
- Secondary: white with 1px border. Min height 44px, visible focus ring.

## Cards
- White surface, 1px border${radii.length ? `, radius ${radii[0]}` : ", radius 12–16px"}${
    shadows.length ? `, shadow \`${shadows[0]}\`` : ", shadow only when elevation matters"
  }.
- Hover: ≤4px lift, 200–300ms — never bounce.

## Forms
- Visible labels (never placeholder-only), helper text, inline validation on blur.
- Errors below the field in the semantic danger color; focus moves to the first invalid field.

## Navigation
- Sticky header that gains a bottom border on scroll; 4–6 items max; filled accent CTA on the right.

## Footer
- Grouped link columns + one-line brand statement; calm, low-contrast, well-spaced.

## Image treatment
- Real photography/product shots over stock; consistent treatment (one overlay/duotone tied to the palette).
- Fixed aspect-ratio boxes so nothing shifts on load.

## Icon style
- One family (e.g. Lucide), consistent stroke width, 20–24px; never emojis as icons.

## Responsive rules
- Mobile-first; breakpoints 640 / 768 / 1024 / 1280. No horizontal scroll; tap targets ≥44px.

## Design do's and don'ts
**Do:** strong hierarchy, consistent spacing, restrained palette, accessible contrast, real content.
**Don't:** random colors, cramped sections, decorative gradients everywhere, template look.

## AI build instructions
- Use the palette and fonts above as exact tokens — do not invent new colors.
- Implement components per COMPONENTS.md and motion per ANIMATION.md.
- Every page must pass: one h1, AA contrast, keyboard navigable, no layout shift on image load.

${a.section()}
`;
  return { name: "DESIGN.md", content };
}
