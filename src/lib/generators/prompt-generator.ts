import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  visionBlock,
  inline,
  who,
  paletteOf,
  fontsOf,
  sectionsOf,
  pagesOf,
  analysisConfidenceNote,
  DESIGN_QUALITY_RULES,
} from "./context";

export function generatePromptMd(ctx: GeneratorContext): MdArtifact {
  const m = ctx.tokens?.metrics ?? null;
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const sections = sectionsOf(ctx, a);
  const pages = pagesOf(ctx);
  const animRules = ctx.animation?.recommendedAnimationRules ?? [
    "Fade-up sections, hero entrance stagger, subtle hover lifts; honor prefers-reduced-motion.",
  ];

  const content = `# PROMPT — Claude Code build prompt for ${name}

${analysisConfidenceNote(ctx)}

## Files to follow
Apply, in order of authority: **DESIGN.md** (tokens/rules) → **COMPONENTS.md** → **ANIMATION.md** → **CONTENT.md** → **SEO.md**, with **BRAND.md** and **CREATIVE.md** as voice/mood context.

## Full build prompt
\`\`\`
Build a production-ready website for ${name}${brief.businessType ? `, a ${brief.businessType.toLowerCase()}` : ""}.
Goal: ${brief.goal?.trim() || "convert visitors into enquiries"}.
Audience: ${brief.targetAudience?.trim() || "local customers"}.

Pages: ${inline(pages)}.
Home section flow: ${inline(sections)}.

Design tokens (exact, do not invent):
- Colors: ${palette.map((c) => `${c.name}=${c.value}`).join(", ")}
- Fonts: ${inline(fonts)}

Follow COMPONENTS.md for every component spec and CONTENT.md for copy
structure. Apply the SEO.md titles, headings, URLs, and schema.
\`\`\`

## Page requirements
${pages.map((p) => `- ${p}`).join("\n")}

## Section variants
- Use the exact section VARIANT for each section from **REACT_EXPORT_PLAN.json** (sectionType, component, importPath, designVariant). Build that specific layout — do not substitute a generic block.

## Design rules
- Use the exact tokens above; neutral surfaces, accent for CTAs/state only.
- ${m?.containerWidth ? `${m.containerWidth}px container (measured)` : "1180–1240px container (assumed)"}, 12-col grid, ${m?.spacingBase ? `${m.spacingBase}px spacing rhythm (measured)` : "4/8px spacing rhythm (assumed)"}, WCAG AA contrast.

${DESIGN_QUALITY_RULES}

## Animation rules
${animRules.map((r) => `- ${r}`).join("\n")}

## SEO rules
- One H1 per page (primary keyword as customer outcome); titles ≤60 chars; metas ≤155.
- Clean hyphenated URLs; LocalBusiness/Service/FAQPage schema per SEO.md.

## Responsive rules
- Mobile-first; 640/768/1024/1280 breakpoints; no horizontal scroll; ≥44px tap targets.

## What not to do
- No colors, fonts, or radii outside the tokens.
- No stock-photo filler, no fake testimonials, no placeholder lorem ipsum.
- No bounce/spin/flash animation; nothing animates without purpose.
- No pages or sections beyond this scope without flagging it.

## Output expectations
- Componentized, typed, production-ready code that passes: build clean,
  one H1 per page, AA contrast, keyboard navigable, no image layout shift.
- Real content slots clearly marked where client material is still missing
  (see CONTENT.md → Missing content checklist).

${visionBlock(ctx, ["componentStructure", "visualLayout"])}
${a.section()}
`;
  return { name: "PROMPT_CLAUDE_CODE.md", content };
}
