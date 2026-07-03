// Canvas state for the visual Design Editor (/projects/[id]/editor).
// Persisted as GeneratedFile JSON records (SITEMAP_CANVAS.json,
// STYLE_GUIDE_CANVAS.json) and consumed by MD generation so the generated
// files always follow the latest editor structure — never a hardcoded template.

export type CanvasSource =
  | "detected"
  | "reference-inspired"
  | "AI-suggested"
  | "user-added"
  | "extracted"
  | "vision-detected"
  | "assumed";

export type SectionStatus = "draft" | "approved" | "rejected";

export type CanvasSection = {
  id: string;
  name: string;
  note?: string;
  source: CanvasSource;
  global?: boolean;
  status?: SectionStatus;
  /** Layout variant hint for the wireframe/design (e.g. "split", "centered"). */
  variant?: string;
};

export type CanvasPage = {
  id: string;
  name: string;
  source: CanvasSource;
  sections: CanvasSection[];
  /** React Flow node position (persisted so the layout survives reloads). */
  x?: number;
  y?: number;
};

export type SitemapCanvas = {
  pages: CanvasPage[];
  approved: boolean;
  updatedAt?: string;
};

export type CanvasColor = {
  name: string;
  value: string;
  role?: "main" | "accent" | "neutral";
  source: CanvasSource;
};

export type StyleGuideCanvas = {
  colors: CanvasColor[];
  headingFont: string | null;
  bodyFont: string | null;
  bodySizePx: number;
  headingWeight: number | string;
  radiusPx: number;
  spacingPx: number;
  source: CanvasSource;
  host: string | null;
  approved: boolean;
  updatedAt?: string;
};

export const SITEMAP_CANVAS_FILE = "SITEMAP_CANVAS.json";
export const STYLE_GUIDE_CANVAS_FILE = "STYLE_GUIDE_CANVAS.json";

let counter = 0;
/** Stable-ish id for server-derived nodes; the client uses crypto.randomUUID. */
export function nodeId(prefix = "n"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

const PAGE_NAME_MAP: Record<string, string> = {
  homepage: "Home", home: "Home", about: "About", "about us": "About",
  services: "Services", service: "Services", contact: "Contact", "contact us": "Contact",
  pricing: "Pricing", faq: "FAQ", blog: "Blog", portfolio: "Portfolio",
  booking: "Booking", login: "Login", dashboard: "Dashboard",
};
export function friendlyPageName(pt?: string): string {
  const k = (pt ?? "").toLowerCase().trim();
  return PAGE_NAME_MAP[k] ?? (pt ? pt.charAt(0).toUpperCase() + pt.slice(1) : "Page");
}

type MultiPage = {
  pagesAnalyzed?: { url: string; pageType: string; ok: boolean; title?: string }[];
  sections?: { sectionName: string; pageType: string; confidence: "high" | "medium" }[];
};
type Tokens = {
  color?: Record<string, string>;
  fonts?: string[];
  sourceUrl?: string;
  confidence?: string;
  metrics?: { headingWeight?: number; bodyFontSizePx?: number; spacingBase?: number; radiusPx?: number };
};

/** Build the initial sitemap canvas from selected pages + detected sections. */
export function deriveSitemapCanvas(keyItems: string[], multi: MultiPage | null): SitemapCanvas {
  const detectedNames = new Set(
    (multi?.pagesAnalyzed ?? []).filter((p) => p.ok).map((p) => friendlyPageName(p.pageType).toLowerCase()),
  );

  // Detected sections grouped by friendly page name.
  const sectionsByPage = new Map<string, CanvasSection[]>();
  for (const s of multi?.sections ?? []) {
    const key = friendlyPageName(s.pageType).toLowerCase();
    const arr = sectionsByPage.get(key) ?? [];
    arr.push({
      id: nodeId("s"),
      name: s.sectionName,
      source: s.confidence === "high" ? "detected" : "reference-inspired",
    });
    sectionsByPage.set(key, arr);
  }

  const seen = new Set<string>();
  const pages: CanvasPage[] = [];
  const add = (name: string, source: CanvasSource) => {
    const key = name.trim().toLowerCase();
    if (!name.trim() || seen.has(key)) return;
    seen.add(key);
    pages.push({ id: nodeId("p"), name: name.trim(), source, sections: sectionsByPage.get(key) ?? [] });
  };

  for (const p of keyItems) add(p, detectedNames.has(p.toLowerCase()) ? "detected" : "user-added");
  for (const p of multi?.pagesAnalyzed ?? []) if (p.ok) add(friendlyPageName(p.pageType), "detected");

  pages.sort((a, b) => (/^home$/i.test(a.name) ? -1 : /^home$/i.test(b.name) ? 1 : 0));
  return { pages, approved: false };
}

/** Build the initial style guide canvas from rendered tokens. */
export function deriveStyleGuideCanvas(
  tokens: Tokens | null,
  brief: { primaryColor?: string; secondaryColor?: string },
): StyleGuideCanvas {
  const measured = tokens?.confidence === "high";
  const source: CanvasSource = measured ? "extracted" : tokens ? "reference-inspired" : "assumed";
  const seenHex = new Set<string>();
  const colors: CanvasColor[] = [];

  for (const [name, value] of Object.entries(tokens?.color ?? {})) {
    if (typeof value !== "string" || !value.startsWith("#")) continue;
    const hex = value.toLowerCase();
    if (seenHex.has(hex)) continue;
    seenHex.add(hex);
    colors.push({ name, value, source, role: name.startsWith("accent") ? "accent" : undefined });
    if (colors.length >= 8) break;
  }
  // Fold in user-provided brand colors (front of list).
  for (const [i, c] of [brief.primaryColor, brief.secondaryColor].entries()) {
    if (c && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) && !seenHex.has(c.toLowerCase())) {
      seenHex.add(c.toLowerCase());
      colors.unshift({ name: i === 0 ? "primary" : "secondary", value: c, source: "user-added", role: i === 0 ? "main" : "accent" });
    }
  }

  return {
    colors,
    headingFont: tokens?.fonts?.[1] ?? tokens?.fonts?.[0] ?? null,
    bodyFont: tokens?.fonts?.[0] ?? null,
    bodySizePx: tokens?.metrics?.bodyFontSizePx ?? 16,
    headingWeight: tokens?.metrics?.headingWeight ?? 600,
    radiusPx: tokens?.metrics?.radiusPx ?? 12,
    spacingPx: tokens?.metrics?.spacingBase ?? 8,
    source,
    host: tokens?.sourceUrl ? tokens.sourceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : null,
    approved: false,
  };
}
