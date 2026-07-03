import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  inline,
  who,
  paletteOf,
  fontsOf,
  sectionsOf,
  pagesOf,
  analysisConfidenceNote,
} from "./context";

// PROMPT_CODEX.md — a build prompt tuned for OpenAI Codex / GPT coding agents.
// Same evidence and tokens as PROMPT_CLAUDE_CODE.md, phrased for a Codex-style
// agent (explicit file-by-file plan, verification checklist). Generated in the
// DESIGN phase.
export function generateCodexPromptMd(ctx: GeneratorContext): MdArtifact {
  const m = ctx.tokens?.metrics ?? null;
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const sections = sectionsOf(ctx, a);
  const pages = pagesOf(ctx);

  const content = `# PROMPT — Codex / GPT build prompt for ${name}

${analysisConfidenceNote(ctx)}

## Authority order
Follow, in order: **DESIGN.md** → **COMPONENTS.md** → **ANIMATION.md** → **CONTENT.md** → **SEO.md**. Use **BRAND.md**, **BRAND_GUIDELINES.md**, and **CREATIVE_DIRECTION.md** for voice, tone, and mood. Never introduce values outside these files.

## Task
\`\`\`
You are a senior front-end engineer. Build a production-ready website for
${name}${brief.businessType ? `, a ${brief.businessType.toLowerCase()}` : ""}.
Goal: ${brief.goal?.trim() || "convert visitors into enquiries"}.
Audience: ${brief.targetAudience?.trim() || "local customers"}.

Pages: ${inline(pages)}.
Home section flow (only these, in this order): ${inline(sections)}.

Design tokens (exact — do not invent or approximate):
- Colors: ${palette.map((c) => `${c.name}=${c.value}`).join(", ")}
- Fonts: ${inline(fonts)}
- Container: ${m?.containerWidth ?? 1200}px · Spacing base: ${m?.spacingBase ?? 8}px
\`\`\`

## Step-by-step plan
1. Scaffold the project and wire the tokens above into the theme config.
2. Build shared primitives (button, input, card, nav) per COMPONENTS.md.
3. Build each page in \`Pages\` using only the sections listed in its canvas.
4. Apply CONTENT.md copy structure; leave clearly-marked slots for missing content.
5. Apply ANIMATION.md motion (subtle, reduced-motion safe).
6. Apply SEO.md titles, headings, URLs, and schema.
7. Run the verification checklist below before finishing.

## Page requirements
${pages.map((p) => `- ${p}`).join("\n")}

## Verification checklist
- [ ] Build compiles clean with no type errors.
- [ ] Exactly one H1 per page; heading hierarchy is correct.
- [ ] All colors/fonts/radii come from the tokens — nothing hardcoded elsewhere.
- [ ] Body text meets WCAG AA contrast on its background.
- [ ] Keyboard navigable; visible focus states; tap targets >= 44px.
- [ ] No image-driven layout shift (fixed aspect ratios).
- [ ] No sections beyond the approved canvas; no lorem ipsum or fake testimonials.

## What not to do
- No colors, fonts, or radii outside the tokens.
- No stock-photo filler, fake reviews, or placeholder copy.
- No bounce/spin/flash motion; nothing animates without purpose.
- No extra pages or sections without flagging them first.

${a.section()}
`;
  return { name: "PROMPT_CODEX.md", content };
}
