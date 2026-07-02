// Static site analysis — Design Intelligence Pipeline (no AI, no browser).
// Produces WEBSITE_ANALYSIS.json, VISUAL_ANALYSIS.json, DESIGN_TOKENS.json
// from fetched HTML/CSS heuristics, with honest confidence + fallbacks.

export type SiteSource = { html: string; css: string };

const strip = (s: string) => s.replace(/\s+/g, " ").trim();

function matchAll(source: string, re: RegExp, cap: number): string[] {
  const out: string[] = [];
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) && out.length < cap) out.push(m[1] ?? m[0]);
  return out;
}

// ---- WEBSITE_ANALYSIS -------------------------------------------------------

export function analyzeWebsiteStructure(source: SiteSource | null, url: string | null) {
  if (!source) {
    return {
      sourceUrl: url,
      confidence: "low",
      assumptions: ["Site could not be fetched; structure unknown."],
      title: null,
      metaDescription: null,
      headings: [],
      navigationLinks: [],
      sectionsDetected: [],
      techSignals: [],
      forms: 0,
      images: 0,
    };
  }
  const { html } = source;
  const title = strip(matchAll(html, /<title[^>]*>([\s\S]*?)<\/title>/i, 1)[0] ?? "");
  const metaDescription = strip(
    matchAll(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, 1)[0] ?? "",
  );
  const headings = matchAll(html, /<h([12])[^>]*>([\s\S]*?)<\/h\1>/gi, 12).map((h) =>
    strip(h.replace(/<[^>]+>/g, "")),
  );
  const navigationLinks = [
    ...new Set(
      matchAll(html, /<a[^>]*>([\s\S]{1,40}?)<\/a>/gi, 40)
        .map((a) => strip(a.replace(/<[^>]+>/g, "")))
        .filter((t) => t && t.length < 30),
    ),
  ].slice(0, 12);
  const sectionsDetected = [
    ["hero", /class=["'][^"']*hero|<section[^>]*hero/i],
    ["features", /features?|benefits/i],
    ["pricing", /pricing|plans/i],
    ["testimonials", /testimonial|review/i],
    ["faq", /\bfaq\b|accordion/i],
    ["contact/booking", /contact|book(ing)?|enquir|quote/i],
    ["footer", /<footer/i],
  ]
    .filter(([, re]) => (re as RegExp).test(html))
    .map(([name]) => name as string);
  const techSignals = [
    ["Next.js", /_next\//i],
    ["React", /react|__NEXT_DATA__|data-reactroot/i],
    ["WordPress", /wp-content|wp-includes/i],
    ["Webflow", /webflow/i],
    ["Wix", /wix\.com|wixstatic/i],
    ["Shopify", /cdn\.shopify/i],
    ["Squarespace", /squarespace/i],
    ["Tailwind CSS", /class=["'][^"']*(flex|grid|px-\d|text-\w+-\d{3})/i],
  ]
    .filter(([, re]) => (re as RegExp).test(html))
    .map(([name]) => name as string);

  return {
    sourceUrl: url,
    confidence: "medium",
    assumptions: ["Derived from static HTML only; client-rendered content may be missed."],
    title: title || null,
    metaDescription: metaDescription || null,
    headings,
    navigationLinks,
    sectionsDetected,
    techSignals,
    forms: (html.match(/<form/gi) ?? []).length,
    images: (html.match(/<img/gi) ?? []).length,
  };
}

// ---- VISUAL_ANALYSIS + DESIGN_TOKENS ----------------------------------------

const HEX_RE = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi;
const FONT_RE = /font-family\s*:\s*([^;}]{3,80})/gi;
const RADIUS_RE = /border-radius\s*:\s*([^;}]{1,40})/gi;
const SHADOW_RE = /box-shadow\s*:\s*([^;}]{5,120})/gi;

function topCounts(values: string[], top: number): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([value, count]) => ({ value, count }));
}

export function analyzeVisualAndTokens(source: SiteSource | null, url: string | null) {
  if (!source) {
    const fallback = {
      sourceUrl: url,
      confidence: "low",
      assumptions: ["Site could not be fetched; propose tokens from the brief instead."],
    };
    return {
      visual: {
        ...fallback,
        colorUsage: [],
        fontFamilies: [],
        borderRadii: [],
        shadows: [],
        notes: ["No visual source available — use brand refs from the project brief."],
      },
      tokens: { ...fallback, color: {}, typography: {}, radius: {}, shadow: {} },
    };
  }

  const css = `${source.css}\n${source.html}`;
  const colors = topCounts(
    (css.match(HEX_RE) ?? []).map((c) => c.toLowerCase()),
    8,
  );
  const fonts = topCounts(
    matchAll(css, FONT_RE, 60).map((f) => strip(f).replace(/["']/g, "").split(",")[0]),
    5,
  ).filter((f) => !/inherit|initial|var\(/.test(f.value));
  const radii = topCounts(matchAll(css, RADIUS_RE, 60).map(strip), 4);
  const shadows = topCounts(matchAll(css, SHADOW_RE, 30).map(strip), 3);

  const visual = {
    sourceUrl: url,
    confidence: colors.length ? "medium" : "low",
    assumptions: ["Frequency-based extraction from static CSS; computed styles not evaluated."],
    colorUsage: colors,
    fontFamilies: fonts,
    borderRadii: radii,
    shadows,
    notes: [
      colors.length
        ? `Dominant palette candidates: ${colors.slice(0, 4).map((c) => c.value).join(", ")}.`
        : "No hex colors found in static CSS (may use CSS variables or utility classes).",
    ],
  };

  const tokens = {
    sourceUrl: url,
    confidence: visual.confidence,
    assumptions: visual.assumptions,
    color: Object.fromEntries(colors.slice(0, 6).map((c, i) => [i === 0 ? "primary" : `color-${i + 1}`, c.value])),
    typography: Object.fromEntries(fonts.slice(0, 3).map((f, i) => [i === 0 ? "primary" : `font-${i + 1}`, f.value])),
    radius: Object.fromEntries(radii.slice(0, 3).map((r, i) => [`radius-${i + 1}`, r.value])),
    shadow: Object.fromEntries(shadows.slice(0, 2).map((s, i) => [`shadow-${i + 1}`, s.value])),
  };

  return { visual, tokens };
}

export type WebsiteAnalysis = ReturnType<typeof analyzeWebsiteStructure>;
export type VisualAnalysis = ReturnType<typeof analyzeVisualAndTokens>["visual"];
export type TokensAnalysis = ReturnType<typeof analyzeVisualAndTokens>["tokens"];
