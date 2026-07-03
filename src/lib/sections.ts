// Pure section metadata: kind inference + React component mapping + library
// categories. No JSX here, so both client components (design editor) and
// server-side generators (REACT_EXPORT_PLAN.json, MD files) can import it.

export type SectionKind =
  | "navbar" | "hero" | "features" | "services" | "form" | "booking" | "pricing"
  | "faq" | "testimonials" | "gallery" | "cta" | "footer" | "directory" | "dashboard" | "generic";

/** Infer the layout kind from a free-text section name. */
export function sectionKind(name: string): SectionKind {
  const n = name.toLowerCase();
  if (/nav|header|menu/.test(n)) return "navbar";
  if (/hero|banner/.test(n)) return "hero";
  if (/pricing|plans?/.test(n)) return "pricing";
  if (/faq|question/.test(n)) return "faq";
  if (/testimonial|review|quote/.test(n)) return "testimonials";
  if (/gallery|portfolio|case|work/.test(n)) return "gallery";
  if (/booking|calendar|availab|reserv|appointment/.test(n)) return "booking";
  if (/form|contact|enquir|quote request|sign ?up|login|newsletter/.test(n)) return "form";
  if (/directory|listing|search|filter|map|category/.test(n)) return "directory";
  if (/dashboard|admin|saas|analytics|panel/.test(n)) return "dashboard";
  if (/feature/.test(n)) return "features";
  if (/service|card|benefit|list/.test(n)) return "services";
  if (/cta|call to action|get started|book now/.test(n)) return "cta";
  if (/footer/.test(n)) return "footer";
  return "generic";
}

/** The exported React component name used for a section kind. */
export function componentNameForKind(kind: SectionKind): string {
  const map: Record<SectionKind, string> = {
    navbar: "NavbarSection",
    hero: "HeroSection",
    features: "FeatureGridSection",
    services: "ServiceCardsSection",
    form: "ContactFormSection",
    booking: "BookingFormSection",
    pricing: "PricingSection",
    faq: "FAQSection",
    testimonials: "TestimonialsSection",
    gallery: "GallerySection",
    cta: "CTASection",
    footer: "FooterSection",
    directory: "DirectoryListingSection",
    dashboard: "DashboardSection",
    generic: "GenericSection",
  };
  return map[kind];
}

export const componentNameForSection = (name: string) => componentNameForKind(sectionKind(name));

/**
 * Suggest a starter section list for a page, from the page type + the features
 * the user selected at onboarding. Used to auto-create the wireframe from the
 * sitemap. These are AI-suggested (the user edits/approves) — not a hardcoded
 * fixed structure: the middle sections come from the selected features.
 */
export function suggestSectionsForPage(pageName: string, features: string[] = []): string[] {
  const p = pageName.toLowerCase();
  const has = (re: RegExp) => features.some((f) => re.test(f.toLowerCase()));
  const out: string[] = ["Navbar"];

  const featureSections = () => {
    const mid: string[] = [];
    if (has(/service|feature/)) mid.push("Services");
    if (has(/booking|calendar/)) mid.push("Booking Form");
    if (has(/pricing/)) mid.push("Pricing");
    if (has(/gallery|portfolio/)) mid.push("Gallery");
    if (has(/testimonial|review/)) mid.push("Testimonials");
    if (has(/faq/)) mid.push("FAQ");
    if (has(/contact|quote|enquir/)) mid.push("Contact Form");
    return mid;
  };

  if (/^home|homepage/.test(p) || p === "home") {
    out.push("Hero", ...featureSections(), "CTA");
  } else if (/about/.test(p)) {
    out.push("Hero", "About", has(/testimonial|review/) ? "Testimonials" : "Stats", "CTA");
  } else if (/contact/.test(p)) {
    out.push("Contact Form", "Map / Location");
  } else if (/service/.test(p)) {
    out.push("Hero", "Services", ...(has(/pricing/) ? ["Pricing"] : []), ...(has(/faq/) ? ["FAQ"] : []), "CTA");
  } else if (/pricing/.test(p)) {
    out.push("Pricing", "FAQ", "CTA");
  } else if (/faq/.test(p)) {
    out.push("FAQ");
  } else if (/blog/.test(p)) {
    out.push("Blog List");
  } else if (/portfolio|case|gallery/.test(p)) {
    out.push("Gallery");
  } else if (/booking|reserv|appointment/.test(p)) {
    out.push("Hero", "Booking Form", "FAQ");
  } else {
    out.push("Hero", "Services", "CTA");
  }

  out.push("Footer");
  // De-dupe while preserving order.
  return out.filter((s, i, arr) => arr.indexOf(s) === i);
}

/** Section library grouped by category (used by the Add-Section drawer). */
export const SECTION_CATEGORIES: { category: string; items: string[] }[] = [
  { category: "Global sections", items: ["Navbar", "Footer", "Announcement Bar"] },
  { category: "Hero", items: ["Hero", "Hero Split", "Hero Centered"] },
  { category: "Content", items: ["About", "Text Block", "Stats", "Logos", "Gallery", "Portfolio", "Blog List"] },
  { category: "Services / features", items: ["Features", "Services", "Service Cards", "Feature Grid"] },
  { category: "Forms / booking", items: ["Contact Form", "Quote Form", "Booking Form", "Calendar Booking", "Newsletter"] },
  { category: "Pricing", items: ["Pricing", "Pricing Tiers"] },
  { category: "FAQ", items: ["FAQ"] },
  { category: "Testimonials / reviews", items: ["Testimonials", "Reviews"] },
  { category: "Gallery / portfolio", items: ["Gallery", "Portfolio", "Case Studies"] },
  { category: "Ecommerce", items: ["Product Grid", "Product Detail", "Cart", "Checkout"] },
  { category: "Directory / listing", items: ["Listings", "Search Filters", "Map / Location", "Category Grid"] },
  { category: "Dashboard / SaaS", items: ["Dashboard Preview", "Integrations", "Feature Grid"] },
  { category: "CTA", items: ["CTA", "Get Started"] },
  { category: "Footer", items: ["Footer", "Newsletter Footer", "Contact Footer"] },
];
