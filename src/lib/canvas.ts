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
  /** Style scheme name (from the Style Guide colors) applied to this section. */
  scheme?: string;
  /** Asset placement hint (e.g. "left", "right", "background", "none"). */
  asset?: string;
  /** Canvas-editable parts hidden on this section (e.g. "icon", "eyebrow", "button"). */
  hidden?: string[];
  /** Chosen icon key for the section's icon slot (canvas icon picker/shuffle). */
  icon?: string;
  /** Uploaded image (data URL) for the section's image slot. Grey placeholder if unset. */
  image?: string;
  /** Per-section editable content (heading/copy/buttons + repeated items). */
  content?: import("@/lib/section-editor/types").SectionContent;
  /** Layout options (alignment/columns/spacing/background/asset placement). */
  layout?: import("@/lib/section-editor/types").SectionLayout;
  /** Controlled motion preset + intensity. */
  motion?: import("@/lib/section-editor/types").SectionMotion;
  /** Media assets (grey placeholder by default; uploads/alt/AI prompts). */
  assets?: import("@/lib/section-editor/types").SectionAsset[];
  /** Reference-inspired generated blueprint — when present the canvas renders
   *  this via GeneratedSection (composed from the analysis) instead of a library
   *  component. The section stays editable (content/items) like any other. */
  generated?: {
    spec: import("@/lib/references/types").GeneratedSectionSpec;
    pattern: import("@/lib/references/types").SectionPattern;
  };
  /** Admin-authored, component-based section: the canvas renders this via the
   *  dynamic React/TSX (or HTML) engine. Content stays editable like any other. */
  custom?: {
    code: string;
    mode: "react" | "html";
  };
  /** For custom/Library sections: the content fields this component actually
   *  reads (from the library item's editableFields). Drives the Section
   *  Settings Content tab so only the real, editable fields are shown. */
  editableFields?: string[];
  /** Library item this instance was copied from (provenance; the instance is
   *  independent and editing it never touches the library item). */
  sourceLibrarySectionId?: string;
  /** User who added this instance to the page. */
  createdByUserId?: string;
};

/** Sitemap category tabs for the Visual Sitemap board. */
export type PageCategory = "main" | "store" | "members" | "auth" | "custom";

export type CanvasPage = {
  id: string;
  name: string;
  source: CanvasSource;
  sections: CanvasSection[];
  /** Which sitemap tab the page lives under (defaults to "main"). */
  category?: PageCategory;
  /** Coarse page type used for section recommendations (e.g. "home", "about"). */
  pageType?: string;
  /** React Flow node position (persisted so the layout survives reloads). */
  x?: number;
  y?: number;
  /** Parent page id for sitemap hierarchy (optional). */
  parentId?: string;
  status?: SectionStatus;
};

export type SitemapCanvas = {
  pages: CanvasPage[];
  approved: boolean;
  updatedAt?: string;
};

export type CanvasColor = {
  name: string;
  value: string;
  // What the colour is used for. "main" = primary, "text" = font colour,
  // "background" = page background, "border" = lines/dividers.
  role?: "main" | "accent" | "text" | "background" | "border" | "neutral";
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
  /** Semantic design tokens (colours/typography/spacing/radius/shadows).
   *  Built from the raw colours above; see @/lib/style-guide/tokens. */
  tokens?: import("@/lib/style-guide/tokens").SemanticTokens;
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

// Default section blueprint per page. Every page starts with a real, editable
// structure so the sitemap is usable the moment a project is created — the user
// tweaks from here instead of building each page from an empty node.
const DEFAULT_SECTIONS: Record<string, string[]> = {
  home: ["Header / Navigation", "Hero", "Feature highlights", "Services", "Social proof", "Call to action", "Footer"],
  about: ["Header / Navigation", "Page hero", "Our story", "Team", "Values", "Call to action", "Footer"],
  services: ["Header / Navigation", "Hero", "Services grid", "Process", "Pricing", "Call to action", "Footer"],
  "service detail": ["Header / Navigation", "Hero", "Overview", "Key features", "FAQ", "Call to action", "Footer"],
  contact: ["Header / Navigation", "Page hero", "Contact form", "Map / location", "Footer"],
  blog: ["Header / Navigation", "Page hero", "Post grid", "Newsletter signup", "Footer"],
  pricing: ["Header / Navigation", "Hero", "Pricing tiers", "Comparison", "FAQ", "Call to action", "Footer"],
  faq: ["Header / Navigation", "Page hero", "FAQ accordion", "Call to action", "Footer"],
  features: ["Header / Navigation", "Hero", "Feature grid", "Highlights", "Call to action", "Footer"],
  shop: ["Header / Navigation", "Hero", "Category tiles", "Product grid", "Footer"],
  "product detail": ["Header / Navigation", "Product gallery", "Product details", "Reviews", "Related products", "Footer"],
  cart: ["Header / Navigation", "Cart items", "Order summary", "Footer"],
  checkout: ["Header / Navigation", "Checkout form", "Order summary", "Footer"],
  listings: ["Header / Navigation", "Page hero", "Filters", "Listings grid", "Footer"],
  categories: ["Header / Navigation", "Page hero", "Category grid", "Footer"],
  menu: ["Header / Navigation", "Page hero", "Menu categories", "Menu items", "Call to action", "Footer"],
  reservations: ["Header / Navigation", "Page hero", "Reservation form", "Footer"],
  booking: ["Header / Navigation", "Page hero", "Booking form", "Availability", "Footer"],
  gallery: ["Header / Navigation", "Page hero", "Gallery grid", "Call to action", "Footer"],
  "portfolio / case studies": ["Header / Navigation", "Page hero", "Work grid", "Call to action", "Footer"],
  portfolio: ["Header / Navigation", "Page hero", "Work grid", "Call to action", "Footer"],
  team: ["Header / Navigation", "Page hero", "Team grid", "Call to action", "Footer"],
  testimonials: ["Header / Navigation", "Page hero", "Testimonials", "Call to action", "Footer"],
  "login / dashboard": ["Header / Navigation", "Auth form", "Footer"],
  login: ["Header / Navigation", "Auth form", "Footer"],
  dashboard: ["Sidebar", "Topbar", "Overview cards", "Data table"],
};
const GENERIC_SECTIONS = ["Header / Navigation", "Page hero", "Content", "Call to action", "Footer"];

/** Default editable sections for a page, keyed by its friendly name. */
function defaultSectionsFor(pageName: string): CanvasSection[] {
  const key = pageName.trim().toLowerCase();
  const names = DEFAULT_SECTIONS[key] ?? GENERIC_SECTIONS;
  return names.map((name) => ({ id: nodeId("s"), name, source: "assumed" as CanvasSource }));
}

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
    const detected = sectionsByPage.get(key);
    pages.push({ id: nodeId("p"), name: name.trim(), source, sections: detected?.length ? detected : defaultSectionsFor(name) });
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
