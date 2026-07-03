import { type GeneratorContext, type MdArtifact, Assumptions, inline, who, paletteOf, fontsOf, analysisConfidenceNote } from "./context";
import { sectionKind } from "@/lib/sections";

// PROMPT_REPLIT.md and PROMPT_LOVABLE.md — single strong build prompts tuned for
// those AI builders. Both follow the LATEST approved editor structure: each
// page's exact section order comes from the canvas (SITEMAP_CANVAS), never a
// fixed template.

function pageOutline(ctx: GeneratorContext): { name: string; sections: string[] }[] {
  const canvas = ctx.canvas?.pages ?? [];
  if (canvas.length) {
    return canvas.map((p) => ({
      name: p.name,
      sections: p.sections.filter((s) => s.status !== "rejected").map((s) => s.name),
    }));
  }
  const pages = ctx.input.brief.keyItems.length ? ctx.input.brief.keyItems : ["Home"];
  return pages.map((name) => ({ name, sections: [] }));
}

function sharedContext(ctx: GeneratorContext, a: Assumptions) {
  const { brief } = ctx.input;
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const m = ctx.tokens?.metrics ?? null;
  const outline = pageOutline(ctx);
  const animRules = ctx.animation?.recommendedAnimationRules ?? [
    "Subtle fade-up on scroll; small hover lifts; honor prefers-reduced-motion.",
  ];
  return { brief, palette, fonts, m, outline, animRules };
}

function outlineBlock(outline: { name: string; sections: string[] }[]): string {
  return outline
    .map((p) => `- **${p.name}**${p.sections.length ? `: ${p.sections.map((s) => `${s} (${sectionKind(s)})`).join(" → ")}` : " (structure not confirmed)"}`)
    .join("\n");
}

export function generateReplitPromptMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const name = who(ctx);
  const { brief, palette, fonts, m, outline, animRules } = sharedContext(ctx, a);

  const content = `# PROMPT — Replit build prompt for ${name}

${analysisConfidenceNote(ctx)}

Paste this into Replit (Agent / Ghostwriter) to scaffold the site. It follows the approved design structure exactly — build pages and sections in the order below.

## Prompt
\`\`\`
Build a production-ready ${brief.websiteType?.toLowerCase() || "website"} for ${name}${brief.businessType ? `, a ${brief.businessType.toLowerCase()}` : ""}.
Goal: ${brief.goal?.trim() || "convert visitors into enquiries"}.
Audience: ${brief.targetAudience?.trim() || "the target customers"}.

Stack: React + Vite + Tailwind CSS (add shadcn/ui for components). Mobile-first, accessible (WCAG AA), fast.

Design tokens (use exactly, do not invent):
- Colors: ${palette.map((c) => `${c.name}=${c.value}`).join(", ")}
- Fonts: ${inline(fonts)}
- Container ${m?.containerWidth ?? 1200}px, spacing base ${m?.spacingBase ?? 8}px, radius ${(m as { radiusPx?: number } | null)?.radiusPx ?? 12}px

Pages and section order (build EXACTLY this — no extra sections):
${outlineBlock(outline)}

For each section, build a real, polished component (navbar, hero, services, forms, pricing, FAQ, testimonials, CTA, footer as applicable). Use real, specific copy for ${name} — no lorem ipsum, no fake reviews.

Motion: ${animRules[0]}

Do not: invent colors/fonts outside the tokens, add pages/sections beyond the list, or use placeholder filler.
\`\`\`

## Notes
- Every page/section above comes from the user's approved sitemap + wireframe.
- Follow BRAND_GUIDELINES.md for voice and DESIGN.md/COMPONENTS.md for exact specs.
${a.section()}
`;
  return { name: "PROMPT_REPLIT.md", content };
}

export function generateLovablePromptMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const name = who(ctx);
  const { brief, palette, fonts, m, outline, animRules } = sharedContext(ctx, a);

  const content = `# PROMPT — Lovable build prompt for ${name}

${analysisConfidenceNote(ctx)}

Paste this into Lovable to generate the app. Lovable builds React + Tailwind + shadcn/ui — this prompt maps 1:1 to that stack and follows the approved structure.

## Prompt
\`\`\`
Create a ${brief.websiteType?.toLowerCase() || "website"} for ${name}${brief.businessType ? ` (${brief.businessType.toLowerCase()})` : ""} using React, Tailwind, and shadcn/ui.
Goal: ${brief.goal?.trim() || "convert visitors into enquiries"}. Audience: ${brief.targetAudience?.trim() || "the target customers"}.

Theme (apply as Tailwind theme tokens — do not deviate):
- Colors: ${palette.map((c) => `${c.name}=${c.value}`).join(", ")}
- Fonts: ${inline(fonts)}
- Radius ${(m as { radiusPx?: number } | null)?.radiusPx ?? 12}px, spacing base ${m?.spacingBase ?? 8}px

Build these pages, each with exactly these sections in order:
${outlineBlock(outline)}

Use shadcn/ui for buttons, cards, inputs, accordions (FAQ), dialogs. Write real, benefit-led copy for ${name}. Responsive and accessible. Subtle motion only: ${animRules[0]}.

Do not add sections or pages beyond the list. Do not use placeholder text or stock filler.
\`\`\`

## Notes
- Section order is the user's approved design — keep it exact.
- Pair with BRAND_GUIDELINES.md, DESIGN.md, COMPONENTS.md, and CONTENT.md for detail.
${a.section()}
`;
  return { name: "PROMPT_LOVABLE.md", content };
}
