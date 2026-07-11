// Site templates for the Wix Headless module. Each template is a declarative
// multi-page blueprint: which Wix business solutions it needs, and which
// prebuilt library sections make up each page (referenced by their stable
// built-in raw id — resolved to the agency's seeded catalog id at assemble time).
export type WixSolution = "stores" | "ecom" | "bookings" | "events" | "cms" | "blog";

export type SiteTemplatePage = {
  /** Stable page key used in the URL (/s/<slug>/<key>); "home" is the index. */
  key: string;
  name: string;
  /** Built-in section raw ids (suffix of the agency-seeded catalog id). */
  sections: string[];
};

export type SiteTemplate = {
  id: string;
  name: string;
  tagline: string;
  /** Emoji glyph for the gallery card. */
  glyph: string;
  requiredSolutions: WixSolution[];
  /** False = shown in the gallery as "coming soon" (not yet buildable). */
  available: boolean;
  pages: SiteTemplatePage[];
};

const FOOTER = "footer-columns-logo";

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: "store",
    name: "Online Store",
    tagline: "Storefront backed by your Wix Stores catalog — shop, product pages, Wix-hosted checkout.",
    glyph: "🛍️",
    requiredSolutions: ["stores", "ecom"],
    available: true,
    pages: [
      { key: "home", name: "Home", sections: ["store-hero", "ecommerce-trending-carousel", "store-category-tiles", FOOTER] },
      { key: "shop", name: "Shop", sections: ["ecommerce-product-grid", FOOTER] },
    ],
  },
  {
    id: "bookings",
    name: "Bookings",
    tagline: "Service business — services, availability, and Wix-hosted booking.",
    glyph: "📅",
    requiredSolutions: ["bookings"],
    available: false,
    pages: [],
  },
  {
    id: "events",
    name: "Events",
    tagline: "Events and ticketing — event list, detail, Wix-hosted ticket checkout.",
    glyph: "🎟️",
    requiredSolutions: ["events"],
    available: false,
    pages: [],
  },
  {
    id: "content",
    name: "Content / Blog",
    tagline: "Marketing or content site backed by Wix CMS and Blog posts.",
    glyph: "📰",
    requiredSolutions: ["cms", "blog"],
    available: false,
    pages: [],
  },
];

export function getSiteTemplate(id: string): SiteTemplate | undefined {
  return SITE_TEMPLATES.find((t) => t.id === id);
}
