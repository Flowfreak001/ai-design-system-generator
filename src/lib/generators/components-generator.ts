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

export function generateComponentsMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const palette = paletteOf(ctx, a);
  const fonts = fontsOf(ctx, a);
  const accent = palette[1]?.value ?? palette[0]?.value;
  const m = ctx.tokens?.metrics ?? null;
  const radius = m?.button?.radius ?? Object.values(ctx.tokens?.radius ?? {})[0];
  if (!radius) a.add("No radius measurable — 12px proposed for cards/buttons.");
  const radiusText = radius ? `${String(radius)} (measured)` : "12px (assumed)";
  const btnBits = [
    m?.button?.fontWeight ? `weight ${m.button.fontWeight} (measured)` : null,
    m?.button?.transitionMs ? `${m.button.transitionMs}ms transitions (measured)` : null,
  ].filter(Boolean).join(", ");
  const hasTestimonials = ctx.website?.sectionsDetected.includes("testimonials");
  const hasPricing = ctx.website?.sectionsDetected.includes("pricing");
  const hasFaq = ctx.website?.sectionsDetected.includes("faq");
  const hover = ctx.animation?.hoverInteractions.length
    ? `Match the reference site's measured hover behavior${m?.button?.transitionMs ? ` (~${m.button.transitionMs}ms)` : ""} — keep it consistent everywhere.`
    : "150–300ms color/shadow transitions; ≤4px lift on cards (assumed — no hover data measured).";

  const content = `# COMPONENTS — ${who(ctx)}

${analysisConfidenceNote(ctx)}

Shared rules: font **${fonts[0]}**, accent \`${accent}\`, radius ${radiusText}${btnBits ? `, ${btnBits}` : ""}, ${m?.spacingBase ? `${m.spacingBase}px spacing rhythm (measured)` : "4/8px spacing rhythm (assumed)"}, 44px minimum touch targets, visible focus rings.

## Navbar
- Sticky; transparent → bordered on scroll. Logo left, ≤5 links, filled accent CTA right.
- Mobile: drawer with the same items; Escape closes; focus trapped.

## Hero section
- Grid: copy (5 cols) + visual (7 cols) on desktop; stacked on mobile.
- Headline, one supporting line, primary + secondary CTA, optional proof strip.

## Service cards
- One card per service from the brief; icon, name, 2-line benefit, "from" price or quote CTA.
- Equal heights; 3-up desktop, 1-up mobile.

## Feature cards
- Icon chip + title + 2-line description; 4-up max; ${hover}

## Process section
- Numbered 3-step strip (mono numerals) with a connecting line on desktop.

## Testimonials
${
    hasTestimonials
      ? "- Current site has testimonials — migrate real quotes (name + context), one highlighted quote max per view."
      : "- No testimonials detected — build the component but populate with real quotes before launch (never fake them)."
  }

## Pricing / offer block
${
    hasPricing
      ? "- Pricing exists on the current site — rebuild as cards with one highlighted tier."
      : "- No pricing detected — use a quote-request block instead: 3 bullet promises + form CTA."
  }

## FAQ accordion
- ${hasFaq ? "Migrate existing FAQ content." : "5–8 real objections."} One open by default; button semantics with aria-expanded; chevron rotates 180° in 200ms.

## Contact form
- Name, contact, message + max one qualifying field; visible labels, inline validation on blur, success state with response-time promise.

## CTA banner
- Full-width band before the footer: one sentence + one button. Accent-tinted surface, not a new color.

## Footer
- Grouped link columns, service area/hours, legal, one-line brand statement.

## Reusable component rules
- Props-driven; no copy hard-coded inside components.
- One source of truth for tokens; components never invent colors or radii.
- Every interactive element: keyboard operable, focus-visible, ≥44px target.

${visionBlock(ctx, ["componentStructure", "buttonStyles", "cardStyles", "formStyles"])}
${a.section()}
`;
  return { name: "COMPONENTS.md", content };
}
