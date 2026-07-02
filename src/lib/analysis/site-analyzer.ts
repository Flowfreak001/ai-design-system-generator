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
const RGB_RE = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi;
const VAR_DEF_RE = /(--[\w-]+)\s*:\s*(#(?:[0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\([^)]+\))/gi;
const FONT_RE = /font-family\s*:\s*([^;}]{3,80})/gi;
const BODY_FONT_RE = /(?:^|[}\s])(?:body|html|:root)[^{}]*\{[^}]*?font-family\s*:\s*([^;}]{3,80})/gi;
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

function normalizeHex(h: string): string {
  const x = h.toLowerCase();
  if (x.length === 4) return `#${x[1]}${x[1]}${x[2]}${x[2]}${x[3]}${x[3]}`;
  return x;
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** hex → { s: saturation 0..1, l: lightness 0..1 } */
function hexHsl(hex: string): { s: number; l: number } {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

/** Collect all color occurrences, resolving CSS custom-property usage. */
function collectColors(css: string): { value: string; count: number }[] {
  const raw: string[] = [];
  // direct hex
  for (const m of css.match(HEX_RE) ?? []) raw.push(normalizeHex(m));
  // rgb()/rgba()
  RGB_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RGB_RE.exec(css))) raw.push(rgbToHex(+m[1], +m[2], +m[3]));
  // custom properties: count each var() usage as an occurrence of its color
  const varColors = new Map<string, string>();
  VAR_DEF_RE.lastIndex = 0;
  while ((m = VAR_DEF_RE.exec(css))) {
    let val = m[2];
    const rgb = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(val);
    val = rgb ? rgbToHex(+rgb[1], +rgb[2], +rgb[3]) : normalizeHex(val);
    varColors.set(m[1], val);
  }
  for (const [name, color] of varColors) {
    const uses = css.split(`var(${name}`).length - 1;
    for (let i = 0; i < uses; i++) raw.push(color);
  }
  return topCounts(raw, 40);
}

const SCRIPT_FONT_RE = /script|handwrit|cursive|comic|pen\b|brush|marker/i;
const MONO_FONT_RE = /mono|code|courier|consolas/i;

/** Rank fonts: body/html/:root declarations dominate; script fonts can't be primary. */
function collectFonts(css: string): { primary?: string; display?: string; mono?: string; all: string[] } {
  const clean = (f: string) => f.replace(/["']/g, "").split(",")[0].trim();
  const score = new Map<string, number>();
  FONT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FONT_RE.exec(css))) {
    const f = clean(m[1]);
    if (!f || /inherit|initial|var\(|-apple|system-ui|sans-serif$|serif$/i.test(f)) continue;
    score.set(f, (score.get(f) ?? 0) + 1);
  }
  const GENERIC_RE = /^(inherit|initial|unset|-apple[\w-]*|system-ui|ui-sans-serif|ui-serif|ui-monospace|sans-serif|serif|monospace|cursive|fantasy)$/i;
  BODY_FONT_RE.lastIndex = 0;
  while ((m = BODY_FONT_RE.exec(css))) {
    // take the first non-generic family in the body stack
    const stack = m[1].replace(/["']/g, "").split(",").map((x) => x.trim());
    const f = stack.find((x) => x && !GENERIC_RE.test(x) && !/var\(/.test(x));
    if (!f) continue;
    score.set(f, (score.get(f) ?? 0) + 1000); // body-level declarations dominate
  }
  // purge generics that slipped in from the global pass
  for (const key of [...score.keys()]) if (GENERIC_RE.test(key)) score.delete(key);
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f);
  const primary = ranked.find((f) => !SCRIPT_FONT_RE.test(f) && !MONO_FONT_RE.test(f));
  const display = ranked.find((f) => f !== primary && !MONO_FONT_RE.test(f));
  const mono = ranked.find((f) => MONO_FONT_RE.test(f));
  return { primary, display, mono, all: ranked.slice(0, 6) };
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
        colorUsage: [] as { value: string; count: number }[],
        fontFamilies: [] as { value: string; count: number }[],
        borderRadii: [] as { value: string; count: number }[],
        shadows: [] as { value: string; count: number }[],
        notes: ["No visual source available — use brand refs from the project brief."],
      },
      tokens: {
        ...fallback,
        color: {} as Record<string, string>,
        typography: {} as Record<string, string>,
        radius: {} as Record<string, string>,
        shadow: {} as Record<string, string>,
      },
    };
  }

  const css = `${source.css}\n${source.html}`;
  const colors = collectColors(css);
  const fonts = collectFonts(css);
  const radii = topCounts(matchAll(css, RADIUS_RE, 60).map(strip), 4).filter(
    (r) => !/var\(/.test(r.value),
  );
  const shadows = topCounts(matchAll(css, SHADOW_RE, 30).map(strip), 3).filter(
    (s2) => !/var\(/.test(s2.value),
  );

  // Semantic color slots: chromatic accents vs neutrals.
  const chromatic = colors.filter((c) => {
    const { s: sat, l } = hexHsl(c.value);
    return sat > 0.3 && l > 0.15 && l < 0.9;
  });
  const neutrals = colors.filter((c) => !chromatic.includes(c));
  const dark = neutrals.filter((c) => hexHsl(c.value).l < 0.35);
  const light = neutrals.filter((c) => hexHsl(c.value).l > 0.85);

  const tokenColor: Record<string, string> = {};
  if (dark[0]) tokenColor.ink = dark[0].value;
  if (light[0]) tokenColor.background = light[0].value;
  chromatic.slice(0, 3).forEach((c, i) => {
    tokenColor[i === 0 ? "accent" : `accent-${i + 1}`] = c.value;
  });
  neutrals
    .filter((c) => c !== dark[0] && c !== light[0])
    .slice(0, 2)
    .forEach((c, i) => {
      tokenColor[`neutral-${i + 1}`] = c.value;
    });

  const tokenTypography: Record<string, string> = {};
  if (fonts.primary) tokenTypography.primary = fonts.primary;
  if (fonts.display && fonts.display !== fonts.primary) tokenTypography.display = fonts.display;
  if (fonts.mono) tokenTypography.mono = fonts.mono;

  const visual = {
    sourceUrl: url,
    confidence: colors.length ? "medium" : "low",
    assumptions: [
      "Frequency-based extraction from static CSS (custom properties resolved); computed styles not evaluated.",
      "Brand colors living only in images/SVG are not captured — the visual probe adds those later.",
    ],
    colorUsage: colors.slice(0, 10),
    fontFamilies: fonts.all.map((f) => ({ value: f, count: 0 })),
    borderRadii: radii,
    shadows,
    notes: [
      chromatic.length
        ? `Chromatic brand candidates: ${chromatic.slice(0, 3).map((c) => c.value).join(", ")} · neutrals: ${[dark[0]?.value, light[0]?.value].filter(Boolean).join(", ")}.`
        : "No chromatic brand color found in CSS — brand color may live in imagery; confirm with the client.",
      fonts.primary ? `Body font: ${fonts.primary}${fonts.display ? ` · display/accent: ${fonts.display}` : ""}.` : "No fonts detected.",
    ],
  };

  const tokens = {
    sourceUrl: url,
    confidence: visual.confidence,
    assumptions: visual.assumptions,
    color: tokenColor,
    typography: tokenTypography,
    radius: Object.fromEntries(radii.slice(0, 3).map((r, i) => [`radius-${i + 1}`, r.value])),
    shadow: Object.fromEntries(shadows.slice(0, 2).map((s2, i) => [`shadow-${i + 1}`, s2.value])),
  };

  return { visual, tokens };
}

export type WebsiteAnalysis = ReturnType<typeof analyzeWebsiteStructure>;
export type VisualAnalysis = ReturnType<typeof analyzeVisualAndTokens>["visual"];
export type TokensAnalysis = ReturnType<typeof analyzeVisualAndTokens>["tokens"];
