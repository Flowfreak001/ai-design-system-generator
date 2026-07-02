import {
  type GeneratorContext,
  type MdArtifact,
  Assumptions,
  bullets,
  who,
  analysisConfidenceNote,
} from "./context";

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function generateSeoMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const biz = brief.businessType?.trim();
  const services = brief.keyItems;
  if (!biz) a.add("Business type missing — keyword suggestions are generic; confirm the service + location terms.");
  if (!services.length) a.add("No services listed in the brief — keyword and page plans use placeholders.");

  const primary = [
    biz ? `${biz.toLowerCase()} near me` : null,
    biz ? `${biz.toLowerCase()} [city]` : null,
    ...services.slice(0, 3).map((s) => s.toLowerCase()),
  ].filter(Boolean) as string[];

  const secondary = [
    biz ? `emergency ${biz.toLowerCase()}` : null,
    biz ? `${biz.toLowerCase()} prices` : null,
    biz ? `best ${biz.toLowerCase()} [city]` : null,
    "reviews",
    "how much does it cost",
  ].filter(Boolean) as string[];

  const currentTitle = ctx.website?.title;
  const currentMeta = ctx.website?.metaDescription;
  const pages = services.length ? services : ["Home", "Services", "About", "Contact"];

  const content = `# SEO — ${name}

${analysisConfidenceNote(ctx)}

## Primary keywords
${bullets(primary, "- Define after confirming business type + location")}

## Secondary keywords
${bullets(secondary)}

## Page title suggestions
${currentTitle ? `Current title: “${currentTitle}” — keep continuity where rankings exist.\n` : ""}- Home: **${name} — ${biz ?? "[service]"} in [city] | ${brief.goal?.trim() ? "Fast quotes" : "Trusted local service"}** (≤60 chars)
${pages.slice(0, 4).map((p) => `- ${p}: **${p} | ${name}**`).join("\n")}

## Meta description suggestions
${currentMeta ? `Current: “${currentMeta}”\n` : ""}- Home: outcome + trust signal + CTA in ≤155 chars, e.g. “${name} — ${biz?.toLowerCase() ?? "local specialists"} serving [city]. Fast responses, clear pricing. Get your quote today.”

## H1/H2/H3 structure
- One **H1** per page = primary keyword phrased as the customer outcome.
- **H2** per section (services, process, proof, FAQ); **H3** for individual services/questions.
- Never skip levels; headings describe content, not decoration.

## URL structure
${pages.slice(0, 5).map((p) => `- /${slug(p) || "page"}`).join("\n")}
- Lowercase, hyphenated, no IDs or dates in URLs.

## Internal linking plan
- Home links to every service page in the services section.
- Each service page links to: quote/contact, one related service, and FAQ.
- Footer repeats the sitemap for crawl coverage.

## Image alt text rules
- Describe what's shown for a customer ("technician replacing a boiler valve"), never "image1.jpg".
- Include the location/service term only where it's honest.

## Schema suggestions
- \`LocalBusiness\` (or the specific subtype) with address, hours, service area.
- \`Service\` per service page; \`FAQPage\` on the FAQ; \`Review\`/\`AggregateRating\` when real reviews exist.

## Blog topic ideas
${bullets([
    biz ? `How much does a ${biz.toLowerCase()} cost in [city]? (pricing transparency)` : null,
    services[0] ? `${services[0]}: what to expect step by step` : null,
    "Emergency vs routine: when to call immediately",
    "Questions to ask before hiring (position the checklist to favor your strengths)",
    biz ? `Common ${biz.toLowerCase()} problems in [city] homes` : null,
  ])}

${a.section()}
`;
  return { name: "SEO.md", content };
}
