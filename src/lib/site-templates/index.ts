// Site templates for the hosted "Wix Site" module. Each template is a
// declarative blueprint: which Wix business solutions it needs, and which
// prebuilt library sections make up each page (referenced by their stable
// built-in raw id — resolved to the agency's seeded catalog id at assemble time).
export type WixSolution = "stores" | "ecom" | "cms" | "bookings" | "blog";

export type SiteTemplatePage = {
  name: string;
  /** Built-in section raw ids (suffix of the agency-seeded catalog id). */
  sections: string[];
};

export type SiteTemplate = {
  id: string;
  name: string;
  tagline: string;
  requiredSolutions: WixSolution[];
  pages: SiteTemplatePage[];
};

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: "store",
    name: "Online Store",
    tagline: "A storefront backed by your Wix Stores catalog — grid, product pages, checkout.",
    requiredSolutions: ["stores"],
    pages: [
      {
        name: "Home",
        sections: ["site-header-nav-cta", "centered-hero-product-shot", "ecommerce-product-grid", "footer-columns-logo"],
      },
    ],
  },
];

export function getSiteTemplate(id: string): SiteTemplate | undefined {
  return SITE_TEMPLATES.find((t) => t.id === id);
}
