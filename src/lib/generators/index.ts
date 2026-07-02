// File generators — produce professional, structured markdown from the actual
// project input (no vague filler). Each generator maps to one output artifact.
// Real AI agents will later replace these deterministic templates.

import type { GenerationInput, GeneratedArtifact, OutputFileName } from "@/types";

type Generator = (input: GenerationInput) => GeneratedArtifact;

// ---- helpers ------------------------------------------------------------

const orNa = (v?: string | null) => (v && v.trim() ? v.trim() : "_Not specified_");
const list = (items: string[], fallback = "_Not specified_") =>
  items.length ? items.map((i) => `- ${i}`).join("\n") : fallback;
const inline = (items: string[], fallback = "not specified") =>
  items.length ? items.join(", ") : fallback;

function biz(input: GenerationInput) {
  return input.businessName || input.projectName || "the business";
}

// ---- BRAND.md -----------------------------------------------------------

const brand: Generator = (input) => {
  const name = biz(input);
  const audience = orNa(input.targetAudience);
  const content = `# BRAND — ${name}

## Brand overview
${name}${input.businessType ? ` is a ${input.businessType.toLowerCase()}` : ""} building a web presence with a clear, conversion-focused design system. This document defines how the brand should sound and feel across every page.

## Business positioning
- **Primary goal:** ${orNa(input.websiteGoal)}
- **Category:** ${orNa(input.businessType)}
- **Offering:** ${orNa(input.servicesProducts)}
- **Positioning statement:** For ${input.targetAudience?.trim() || "its audience"}, ${name} delivers ${input.servicesProducts?.trim() || "its core offering"} with a premium, trustworthy experience.

## Target audience
${audience}

Design and copy decisions should be validated against this audience first.

## Tone of voice
- Confident, clear, and credible — never hypey.
- ${input.animationPreference === "Bold" ? "Energetic and expressive" : input.animationPreference === "Minimal" || input.animationPreference === "None" ? "Calm, precise, and understated" : "Polished and premium"}.
- Short sentences. Concrete benefits over adjectives.

## Trust signals
- Clear outcomes and specifics (numbers, named results) over vague claims.
- Consistent visual system across every page.
- Social proof, security/quality cues, and transparent next steps near each CTA.

## Words to use
${list([
  "clear",
  "premium",
  input.businessType ? input.businessType.toLowerCase() : "professional",
  "trusted",
  "results",
  ...input.seoKeywords.slice(0, 4),
])}

## Words to avoid
- "revolutionary", "world-class", "cutting-edge" (unearned superlatives)
- "cheap", "basic", "simple" when describing the product
- Filler that doesn't state a concrete benefit

## Conversion message
Lead with the outcome for ${input.targetAudience?.trim() || "the visitor"}: what they get, why it's credible, and the single next step. Primary CTA: **${input.websiteGoal?.trim() ? deriveCta(input.websiteGoal) : "Get started"}**.
`;
  return { fileName: "BRAND.md", fileType: "MARKDOWN", content };
};

function deriveCta(goal: string) {
  const g = goal.toLowerCase();
  if (g.includes("lead") || g.includes("contact")) return "Book a call";
  if (g.includes("sign") || g.includes("trial") || g.includes("saas")) return "Start free";
  if (g.includes("sell") || g.includes("ecommerce") || g.includes("buy")) return "Shop now";
  return "Get started";
}

// ---- DESIGN.md ----------------------------------------------------------

const design: Generator = (input) => {
  const colors = input.brandColors;
  const anim = input.animationPreference || "Premium";
  const content = `# DESIGN — ${biz(input)}

## Visual style
A premium, modern, high-contrast system. Generous whitespace, strong typographic
hierarchy, elegant cards, and soft gradients used sparingly for depth.
Animation intensity: **${anim}**.

## Color usage
${colors.length
    ? `Brand palette:\n${list(colors)}\n\n- Use the first color as the primary brand/accent.\n- Reserve accents for CTAs and key highlights; keep large surfaces neutral.`
    : "- No brand colors supplied — default to a neutral base (near-white / near-black) with a single confident accent for CTAs.\n- Maintain WCAG AA contrast (4.5:1 for body text)."}

## Typography direction
- One strong sans for display + body; a monospace for code/file names.
- Scale: clear jumps (e.g. 14 / 16 / 20 / 32 / 48+). Tight leading on headings, 1.5–1.7 on body.
- Weight for hierarchy: 600–800 headings, 400–500 body.

## Layout rules
- Max content width ~1200px; consistent 4/8px spacing rhythm.
- Sections breathe: generous vertical padding, one idea per section.
- Required pages: ${inline(input.requiredPages, "Home (others TBD)")}.

## Buttons
- Primary: solid accent, medium radius, clear hover (subtle lift + shade), 250–300ms.
- Secondary: outline/ghost. Min touch target 44px. Visible focus ring.

## Cards
- Soft border + subtle shadow; elevate slightly on hover (translateY, never bounce).
- Consistent padding and radius across the system.

## Forms
- Visible labels (not placeholder-only), helper text, inline validation on blur.
- Errors below the field; clear focus states; comfortable input height (≥44px).

## Navigation
- Sticky, condenses on scroll. 4–6 primary items max. Clear active state.

## Footer
- Grouped links, brand line, legal. Calm, low-contrast, well-spaced.

## Responsive rules
- Mobile-first. Breakpoints ~640 / 768 / 1024 / 1280.
- No horizontal scroll; stack cards; keep tap targets ≥44px.

## Design do's and don'ts
**Do:** strong hierarchy, consistent spacing, restrained palette, accessible contrast.
**Don't:** random colors, cramped sections, weak hierarchy, cheap/flashy animation.
`;
  return { fileName: "DESIGN.md", fileType: "MARKDOWN", content };
};

// ---- CREATIVE.md --------------------------------------------------------

const creative: Generator = (input) => {
  const name = biz(input);
  const anim = input.animationPreference || "Premium";
  const content = `# CREATIVE — ${name}

## Creative direction
Position ${name} as a premium, credible ${input.businessType?.toLowerCase() || "brand"}.
Every section should feel intentional and product-ready — editorial, not template.

## Visual mood
${anim === "Bold" ? "Confident and expressive; larger type, richer gradients." : anim === "Minimal" || anim === "None" ? "Quiet and precise; lots of space, minimal ornament." : "Premium and polished; soft gradients, elegant depth, restrained motion."}

## Homepage story
1. Hook: the outcome for ${input.targetAudience?.trim() || "the visitor"}.
2. Proof: why it's credible.
3. How it works.
4. What they get.
5. Clear final call to action: ${orNa(input.websiteGoal)}.

## Hero concept
A bold headline stating the core value, a one-line subhead, two CTAs, and a
supporting visual (product/preview). Entrance animation: staggered fade-up.

## Section flow
${list(
  input.requiredPages.length
    ? input.requiredPages
    : ["Hero", "Features", "How it works", "Output / proof", "Trust", "Final CTA"],
)}

## Image direction
- Real product/preview imagery over generic stock.
- Consistent treatment (duotone or soft-gradient overlays) tied to the palette.

## Animation feel
- ${anim} intensity. Fade-up on sections, subtle card lift, button micro-interactions.
- Smooth (250–400ms), controlled easing. No bouncing, spinning, or flashy effects.
- Respect \`prefers-reduced-motion\`.

## Creative do's and don'ts
**Do:** one orchestrated moment per view, cohesive mood, purposeful motion.
**Don't:** decorative-only animation, clashing styles, stock-photo clutter.
`;
  return { fileName: "CREATIVE.md", fileType: "MARKDOWN", content };
};

// ---- PROMPT_CLAUDE_CODE.md ---------------------------------------------

const promptClaudeCode: Generator = (input) => {
  const name = biz(input);
  const platform = input.platformTarget || "Claude Code";
  const content = `# PROMPT — Claude Code build prompt for ${name}

## Full build prompt
> Build a production-ready ${input.businessType?.toLowerCase() || "marketing"} website for **${name}**
> targeting ${input.targetAudience?.trim() || "its audience"}. Primary goal:
> ${input.websiteGoal?.trim() || "convert visitors"}. Target platform: ${platform}.
> Apply the accompanying BRAND.md, DESIGN.md, and CREATIVE.md exactly.

## Page requirements
${list(input.requiredPages.length ? input.requiredPages : ["Home"], "- Home")}

Offering to represent: ${orNa(input.servicesProducts)}.

## Design rules
- Follow DESIGN.md: palette (${inline(input.brandColors, "neutral base + one accent")}), typographic hierarchy, elegant cards, soft gradients.
- High contrast, generous spacing, consistent 4/8px rhythm.

## Animation rules
- Intensity: ${input.animationPreference || "Premium"}. Fade-up on sections, subtle card lift, button micro-interactions, smooth tab/preview transitions.
- 250–400ms, controlled easing. No bounce/spin/flash. Respect \`prefers-reduced-motion\`.

## SEO rules
- Unique title + meta description per page. One \`<h1>\` per page; semantic headings.
- Target keywords: ${inline(input.seoKeywords, "derive from services + audience")}.
- Open Graph + Twitter tags; clean slugs; sitemap + robots.

## Responsive rules
- Mobile-first; breakpoints 640 / 768 / 1024 / 1280. No horizontal scroll. Tap targets ≥44px.

## What not to do
- No generic template look, no random colors, no weak hierarchy.
- No cheap/flashy animation. No unrelated placeholder content.

## Output expectations
- A clean, componentized ${platform} project that matches the design system.
- Accessible (WCAG AA), responsive, and production-ready — not a rough draft.
${input.existingWebsiteUrl ? `\n_Reference the existing site for continuity: ${input.existingWebsiteUrl}_` : ""}
${input.competitorUrls.length ? `\n_Competitors to differentiate from: ${inline(input.competitorUrls)}_` : ""}
`;
  return { fileName: "PROMPT_CLAUDE_CODE.md", fileType: "PROMPT", content };
};

// ---- registry -----------------------------------------------------------

export const generators: Record<OutputFileName, Generator> = {
  "BRAND.md": brand,
  "DESIGN.md": design,
  "CREATIVE.md": creative,
  "PROMPT_CLAUDE_CODE.md": promptClaudeCode,
};

export const OUTPUT_ORDER: OutputFileName[] = [
  "BRAND.md",
  "DESIGN.md",
  "CREATIVE.md",
  "PROMPT_CLAUDE_CODE.md",
];

export function generateAll(input: GenerationInput): GeneratedArtifact[] {
  return OUTPUT_ORDER.map((name) => generators[name](input));
}
