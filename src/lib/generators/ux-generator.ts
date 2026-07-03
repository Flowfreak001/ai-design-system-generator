import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  visionBlock,
  who,
  sectionsOf,
  analysisConfidenceNote,
} from "./context";

const UX_BY_TYPE: Record<string, string[]> = {
  "Marketing Website": ["One clear primary CTA per page", "Scannable sections with proof near each ask", "Sticky nav to the main conversion"],
  "SaaS Platform": ["Onboarding to first value fast", "Persistent left nav + top bar", "Empty states that teach, not blank screens"],
  "Directory Platform": ["Prominent search + filters", "List/grid toggle", "Clear result cards with one primary action"],
  Marketplace: ["Search-first home", "Trust signals on listings", "Frictionless checkout / enquiry"],
  "Booking Platform": ["Availability visible early", "Minimal steps to confirm", "Clear confirmation + reminders"],
  "Client Portal": ["Role-appropriate dashboard", "Status at a glance", "Secure, obvious document access"],
  Dashboard: ["Most important metric top-left (F-pattern)", "Progressive disclosure / drill-down", "Skeleton loaders, not spinners"],
  "Mobile App": ["Thumb-reachable primary actions", "Bottom tab nav", "One task per screen"],
  Ecommerce: ["Product clarity + fast add-to-cart", "Trust + returns near the buy button", "Short guest checkout"],
  "Landing Page": ["Single goal, single CTA", "Above-the-fold value + proof", "No nav distractions"],
  "Custom Platform": ["Map the core job-to-be-done", "One primary action per view", "Consistent patterns across screens"],
};

// UX.md — user-experience patterns, flows, and accessibility for the chosen
// design type. Generated in the DESIGN phase (after brand approval).
export function generateUxMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const designType = (brief as { designType?: string }).designType || "Marketing Website";
  const sections = sectionsOf(ctx, a);
  const patterns = UX_BY_TYPE[designType] ?? UX_BY_TYPE["Marketing Website"];
  const m = ctx.tokens?.metrics ?? null;

  const content = `# UX — ${name}

_Design type: **${designType}**. Follows the approved BRAND_GUIDELINES.md._

${analysisConfidenceNote(ctx)}

## Primary user flow
- Entry → orient (who/what) → the one action for a **${designType}**: ${brief.ctaGoal?.trim() || brief.goal?.trim() || "the primary conversion"}.
- Remove every step that doesn't move the visitor toward that action.

## Patterns for a ${designType}
${patterns.map((p) => `- ${p}`).join("\n")}

## Information architecture
${sections.length ? sections.map((s, i) => `${i + 1}. ${s}`).join("\n") : "- Detected from the scanned pages; add page URLs for a truer map."}

## Interaction & states
- Every interactive element: keyboard operable, visible focus ring, ≥44px target.
- Provide loading (skeletons), empty (teach + one action), error (recover), and success states.
- Forms: labels always visible, inline validation on blur, focus moves to first invalid field.

## Responsive behaviour
- Mobile-first across ${m?.breakpoints?.length ? `the measured breakpoints (${m.breakpoints.slice(0, 4).join(" / ")}px)` : "standard breakpoints"}; no horizontal scroll.
- Reflow multi-column sections to a single column; keep the primary action reachable.

## Accessibility
- WCAG AA contrast, semantic landmarks (header/nav/main/footer), one h1 per page.
- Respect \`prefers-reduced-motion\`; content must be fully usable with motion disabled.
${visionBlock(ctx, ["componentStructure", "responsiveNotes"])}
${a.section()}
`;
  return { name: "UX.md", content };
}
