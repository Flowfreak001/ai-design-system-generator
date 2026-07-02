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

// Location-based keyword patterns only make sense for businesses customers
// visit or that serve an area — never for SaaS/online products.
const LOCAL_BUSINESS =
  /plumb|electric|roof|hvac|heating|restaurant|cafe|bakery|salon|barber|spa|gym|clinic|dental|physio|law|legal|account|taxi|real estate|estate agent|property|cleaning|landscap|garden|contractor|builder|repair|garage|mechanic|florist|hotel|venue|studio|school|tutor/i;

export function generateSeoMd(ctx: GeneratorContext): MdArtifact {
  const a = new Assumptions();
  const { brief } = ctx.input;
  const name = who(ctx);
  const biz = brief.businessType?.trim();
  const bizLower = biz?.toLowerCase();
  const isLocal = Boolean(biz && LOCAL_BUSINESS.test(biz));
  const audience = brief.targetAudience?.trim();
  const services = (brief.services ?? "")
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pages = brief.keyItems.length ? brief.keyItems : ["Home", "Services", "About", "Contact"];
  const briefKeywords = brief.seoKeywords.filter(Boolean);

  if (!biz) a.add("Business type missing — keyword suggestions are generic; confirm the core term.");
  if (!briefKeywords.length)
    a.add("No SEO keywords in the brief — suggestions are derived from business type, services, and audience; validate with real search data.");

  // Primary: the brief's own keywords first, then honest derivations.
  const primary = briefKeywords.length
    ? briefKeywords
    : ([
        bizLower,
        ...services.slice(0, 3).map((s) => s.toLowerCase()),
        ...(isLocal ? [`${bizLower} near me`] : audience ? [`${bizLower} for ${audience.toLowerCase()}`] : []),
      ].filter(Boolean) as string[]);

  const secondary = [
    bizLower ? `best ${bizLower}` : null,
    bizLower ? `${bizLower} ${isLocal ? "prices" : "pricing"}` : null,
    bizLower ? `${bizLower} reviews` : null,
    ...(isLocal ? [`emergency ${bizLower}`, `${bizLower} [city]`] : services.slice(3, 5).map((s) => s.toLowerCase())),
  ].filter(Boolean) as string[];

  const currentTitle = ctx.website?.title;
  const currentMeta = ctx.website?.metaDescription;
  const valueProp = brief.ctaGoal?.trim() || brief.goal?.trim() || "clear next step";
  const homeTitle = isLocal
    ? `${name} — ${biz ?? "[service]"} in [city]`
    : `${name} — ${biz ?? "[category]"}${audience ? ` for ${audience}` : ""}`;

  const schema = isLocal
    ? "- `LocalBusiness` (or the specific subtype) with address, hours, service area.\n- `Service` per service page; `FAQPage` on the FAQ; `Review`/`AggregateRating` when real reviews exist."
    : "- `Organization` with logo, sameAs profiles, and contact point.\n- `Product`/`SoftwareApplication` where it genuinely applies; `FAQPage` on the FAQ; `Review`/`AggregateRating` only with real reviews.";

  const blogIdeas = [
    bizLower ? `How to choose a ${bizLower}${audience ? ` (written for ${audience.toLowerCase()})` : ""}` : null,
    services[0] ? `${services[0]}: what to expect step by step` : pages[1] ? `${pages[1]}: a practical guide` : null,
    bizLower ? `${biz} pricing explained — what actually drives cost` : null,
    ...(isLocal
      ? [`Emergency vs routine: when to call immediately`, `Common ${bizLower} problems in [city] homes`]
      : briefKeywords.slice(0, 2).map((k) => `${k}: a practical guide`)),
  ].filter(Boolean) as string[];

  const content = `# SEO — ${name}

${analysisConfidenceNote(ctx)}

## Primary keywords
${briefKeywords.length ? "From the brief (client-provided):\n" : ""}${bullets(primary, "- Define after confirming the core business term")}

## Secondary keywords
${bullets(secondary)}

## Page title suggestions
${currentTitle ? `Current title: “${currentTitle}” — keep continuity where rankings exist.\n` : ""}- Home: **${homeTitle}** (≤60 chars)
${pages.slice(0, 4).map((p) => `- ${p}: **${p} | ${name}**`).join("\n")}

## Meta description suggestions
${currentMeta ? `Current: “${currentMeta}”\n` : ""}- Home: outcome + trust signal + CTA in ≤155 chars, built around: “${valueProp}”.

## H1/H2/H3 structure
- One **H1** per page = primary keyword phrased as the customer outcome.
- **H2** per section; **H3** for individual ${services.length ? "services" : "items"}/questions.
- Never skip levels; headings describe content, not decoration.

## URL structure
${pages.slice(0, 5).map((p) => `- /${slug(p) || "page"}`).join("\n")}
- Lowercase, hyphenated, no IDs or dates in URLs.

## Internal linking plan
- Home links to every key page in its section.
- Each key page links to: the primary CTA, one related page, and FAQ.
- Footer repeats the sitemap for crawl coverage.

## Image alt text rules
- Describe what's shown for the visitor${biz ? ` (in ${bizLower} terms)` : ""}, never "image1.jpg".
- Include a keyword only where it's an honest description.

## Schema suggestions
${schema}

## Blog topic ideas
${bullets(blogIdeas)}

${a.section()}
`;
  return { name: "SEO.md", content };
}
