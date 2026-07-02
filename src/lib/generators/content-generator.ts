import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  orNa,
  bullets,
  who,
  sectionsOf,
  analysisConfidenceNote,
} from "./context";

export function generateContentMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const sections = sectionsOf(ctx, a);
  const pages = brief.keyItems.length
    ? brief.keyItems
    : ["Home", "Services", "About", "Contact"];
  if (!brief.keyItems.length) a.add("Page list proposed — brief had no key pages/features.");
  const nav = ctx.website?.navigationLinks ?? [];

  const content = `# CONTENT — ${name}

${analysisConfidenceNote(ctx)}

## Sitemap
${pages.map((p) => `- ${p}`).join("\n")}
${nav.length ? `\nCurrent site navigation (for continuity): ${nav.join(" · ")}` : ""}

## Page-by-page section plan (Home)
${sections.map((s, i) => `${i + 1}. **${s}** — one idea, one CTA where relevant`).join("\n")}

## Hero copy direction
- Headline: the outcome for ${brief.targetAudience?.trim() || "the customer"} in ≤9 words.
- Subline: how ${name} delivers it, one sentence, no jargon.
- CTA: action verb + outcome ("Get your quote", "Book a table").

## Services / products section
${bullets(
    brief.keyItems.map((k) => `${k} — headline, 2-line benefit description, one proof point`),
    "- List each core service with a headline, 2-line benefit, and a proof point (confirm services with client)",
  )}

## About section
Short founder/team story focused on credibility: years in business, area served, what customers say. No mission-statement filler.

## CTA sections
- One mid-page CTA after proof; one final CTA at page end.
- Repeat the same primary action everywhere — don't split attention across offers.

## FAQ section
${
    ctx.website?.sectionsDetected.includes("faq")
      ? "The current site has FAQ content — migrate and tighten it (answer in ≤3 sentences each)."
      : "Draft 5–8 questions from real objections: pricing, timing, guarantees, coverage area, process."
  }

## Contact section
- Form: name, contact, message (+ one qualifying field max). Visible response-time promise.
- Phone/WhatsApp displayed as text, not hidden behind icons.

## Footer content
- Grouped links per the sitemap, service area, hours, legal, and one-line brand statement.

## Missing content checklist
${bullets([
    "Real testimonials with names",
    "Photography (team / work / location)",
    "Exact service list + pricing or quote logic",
    "Legal pages (privacy, terms)",
    !brief.targetAudience ? "Target audience definition" : null,
    !brief.goal ? "Primary conversion goal" : null,
  ])}

${a.section()}
`;
  return { name: "CONTENT.md", content };
}
