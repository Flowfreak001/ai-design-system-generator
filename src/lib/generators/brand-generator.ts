import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  orNa,
  bullets,
  who,
  analysisConfidenceNote,
} from "./context";

export function generateBrandMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const audience = brief.targetAudience?.trim();
  if (!audience) a.add("Target audience not specified — positioning is written generically; confirm with the client.");

  const siteTitle = ctx.website?.title;
  const siteMeta = ctx.website?.metaDescription;
  if (!ctx.website) a.add("No website analysis — existing brand voice could not be sampled.");

  const probeCta = (ctx.tokens as unknown as { renderedProbe?: { content?: { ctaText?: string } } } | null)?.renderedProbe?.content?.ctaText;
  const liveCta = probeCta ?? brief.ctaGoal?.trim() ?? deriveCta(brief.goal);
  const anim = ctx.animation?.globalMotionStyle;
  const toneWords = brief.toneOfVoice?.trim()
    ? `Client-specified: ${brief.toneOfVoice.trim()}.`
    : anim && /expressive|choreographed/i.test(anim)
      ? "Confident and energetic — the current site leans expressive; keep copy punchy."
      : "Confident, clear, and credible — short sentences, concrete benefits, no hype.";

  const useWords = [
    brief.businessType?.toLowerCase(),
    ...(brief.keyItems.slice(0, 3).map((k) => k.toLowerCase())),
    "trusted",
    "clear",
    "results",
  ].filter(Boolean) as string[];

  const content = `# BRAND — ${name}

${analysisConfidenceNote(ctx)}

## Brand overview
${name}${brief.businessType ? ` is a ${brief.businessType.toLowerCase()}` : ""}. ${
    siteMeta
      ? `The current site describes itself as: “${siteMeta}”.`
      : "No existing self-description was found on the site."
  }

## Business positioning
- **Primary goal:** ${orNa(brief.goal)}
- **Category:** ${orNa(brief.businessType)}
${siteTitle ? `- **Current site title:** “${siteTitle}”` : ""}
- **Positioning statement:** For ${audience || "its customers"}, ${name} delivers ${
    brief.services?.trim()?.toLowerCase() || brief.businessType?.toLowerCase() || "its core offering"
  } with a dependable, professional experience.

## Target audience
${orNa(audience)}

Every design and copy decision below should be validated against this audience first.

## Tone of voice
- ${toneWords}
${brief.brandPersonality?.trim() ? `- Brand personality: ${brief.brandPersonality.trim()}.` : ""}
- Speak to outcomes (primary CTA: "${liveCta}"), not features.
- Plain language over jargon; technical detail only where it builds trust.

## Trust signals
${bullets([
    ctx.website?.sectionsDetected.includes("testimonials")
      ? "Testimonials exist on the current site — carry them over prominently."
      : "Add testimonials/reviews near every primary CTA (none detected on the current site).",
    "Concrete numbers and named results over vague claims.",
    "Clear response-time promises near contact points.",
    brief.currentTools.length ? `Existing tools worth surfacing: ${brief.currentTools.join(", ")}.` : null,
  ])}

## Words to use
${bullets(useWords)}

## Words to avoid
- "revolutionary", "world-class", "cutting-edge" (unearned superlatives)
- "cheap", "basic" when describing the offering
- Filler that doesn't state a concrete benefit

## Conversion message
Lead with the outcome for ${audience || "the visitor"}: what they get, why it's credible, and one unambiguous next step. Primary CTA direction: **${liveCta}**${probeCta ? " (measured from the live site)" : ""}.

${a.section()}
`;
  return { name: "BRAND.md", content };
}

function deriveCta(goal?: string | null): string {
  const g = (goal ?? "").toLowerCase();
  if (/lead|contact|quote|enquir/.test(g)) return "Get a quote / Book a call";
  if (/sign|trial|saas/.test(g)) return "Start free";
  if (/sell|shop|buy|order/.test(g)) return "Order now";
  if (/book|appoint|reserv/.test(g)) return "Book now";
  return "Get started";
}
