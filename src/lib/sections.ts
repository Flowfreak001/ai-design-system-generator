// Pure section metadata: kind inference + React component mapping + library
// categories. No JSX here, so both client components (design editor) and
// server-side generators (REACT_EXPORT_PLAN.json, MD files) can import it.

export type SectionKind =
  | "navbar" | "hero" | "features" | "services" | "socialproof" | "workflow"
  | "showcase" | "scrollmedia" | "usecases" | "comparison" | "integrations" | "form" | "booking"
  | "pricing" | "faq" | "testimonials" | "gallery" | "cta" | "footer"
  | "directory" | "dashboard" | "generic";

/** Infer the layout kind from a free-text section name. */
export function sectionKind(name: string): SectionKind {
  const n = name.toLowerCase();
  if (/nav|header|menu/.test(n)) return "navbar";
  if (/hero|banner/.test(n)) return "hero";
  if (/pricing|plans?/.test(n)) return "pricing";
  if (/faq|question/.test(n)) return "faq";
  if (/testimonial|review\b|reviews/.test(n)) return "testimonials";
  // Elementor-style marketing sections (checked before the broader matches).
  if (/social proof|logo cloud|logos|trusted by|as seen|customer count|trust badge|proof/.test(n)) return "socialproof";
  if (/workflow|how it works|process|steps?|timeline/.test(n)) return "workflow";
  if (/integration|ecosystem|works with|app grid/.test(n)) return "integrations";
  if (/compar|why choose|why us|versus|\bvs\b/.test(n)) return "comparison";
  if (/use ?case|industries|industry/.test(n)) return "usecases";
  if (/scroll media|scroll story|sticky media|expanding media|\bjourney\b|scroll reveal/.test(n)) return "scrollmedia";
  if (/showcase|template|case stud/.test(n)) return "showcase";
  if (/stats|metrics|numbers|by the numbers/.test(n)) return "socialproof";
  if (/gallery|portfolio|our work/.test(n)) return "gallery";
  if (/booking|calendar|availab|reserv|appointment/.test(n)) return "booking";
  if (/form|contact|enquir|quote request|sign ?up|login|newsletter/.test(n)) return "form";
  if (/directory|listing|search|filter|map|category/.test(n)) return "directory";
  if (/dashboard|admin|analytics|panel/.test(n)) return "dashboard";
  if (/feature|benefit|value|capabilit/.test(n)) return "features";
  if (/service|card|list/.test(n)) return "services";
  if (/cta|call to action|get started|book now|final/.test(n)) return "cta";
  if (/footer/.test(n)) return "footer";
  return "generic";
}

/** The exported React component name used for a section kind. */
export function componentNameForKind(kind: SectionKind): string {
  const map: Record<SectionKind, string> = {
    navbar: "NavbarSection",
    hero: "HeroSection",
    features: "FeatureGrid",
    services: "ServiceCards3",
    socialproof: "LogoCloud",
    workflow: "StepByStepProcess",
    showcase: "CaseStudyCards",
    scrollmedia: "ScrollExpandMedia",
    usecases: "UseCaseCards",
    comparison: "ComparisonTable",
    integrations: "IntegrationLogoCloud",
    form: "ContactFormSection",
    booking: "BookingFormSection",
    pricing: "PricingCards",
    faq: "FAQAccordion",
    testimonials: "TestimonialCards",
    gallery: "GalleryGrid",
    cta: "SimpleCTA",
    footer: "SimpleFooter",
    directory: "ListingGrid",
    dashboard: "DashboardPreviewSection",
    generic: "FeatureGrid",
  };
  return map[kind];
}

export const componentNameForSection = (name: string) => componentNameForKind(sectionKind(name));

/** Extra context that lets section generation match the site's ambition
 *  (Elementor-grade structures for SaaS/agency/booking sites). */
export type SectionContext = {
  websiteType?: string;
  industry?: string;
  businessType?: string;
  goals?: string[];
};

const includes = (s: string | undefined, ...needles: string[]) =>
  !!s && needles.some((n) => s.toLowerCase().includes(n));

/** True for product/marketing sites that benefit from richer, conversion-first
 *  page structures (hero → proof → benefits → features → workflow → use-cases…). */
function isSaaSLike(ctx: SectionContext): boolean {
  const blob = [ctx.websiteType, ctx.industry, ctx.businessType].filter(Boolean).join(" ").toLowerCase();
  return /saas|platform|software|app\b|ai\b|tool|tech|startup|product|agency|marketing|dashboard/.test(blob);
}

/**
 * Suggest a starter section list for a page, from the page type + selected
 * features + site context. For SaaS/platform/AI/agency sites it produces
 * stronger, Elementor-style marketing structures (strong hero, social proof
 * near the fold, feature/workflow/use-case rhythm, comparison, final CTA).
 * These are AI-suggested — the user edits/approves them.
 */
export function suggestSectionsForPage(
  pageName: string,
  features: string[] = [],
  ctx: SectionContext = {},
): string[] {
  const p = pageName.toLowerCase();
  const has = (re: RegExp) => features.some((f) => re.test(f.toLowerCase()));
  const saas = isSaaSLike(ctx);
  const booking = includes(ctx.websiteType, "booking") || includes(ctx.businessType, "booking", "rental", "taxi", "salon", "clinic") || has(/booking|calendar|appointment/);
  const out: string[] = ["Header"];

  const featureSections = () => {
    const mid: string[] = [];
    if (has(/service|feature/)) mid.push("Services");
    if (booking) mid.push("Booking Form");
    if (has(/pricing/)) mid.push("Pricing");
    if (has(/gallery|portfolio/)) mid.push("Gallery");
    if (has(/testimonial|review/)) mid.push("Testimonials");
    if (has(/faq/)) mid.push("FAQ");
    if (has(/contact|quote|enquir/)) mid.push("Contact Form");
    return mid.length ? mid : ["Services", "Testimonials", "FAQ"];
  };

  if (/^home|homepage/.test(p) || p === "home" || p === "") {
    if (saas) {
      out.push("Hero", "Social Proof", "Key Benefits", "Feature Grid", "Product Workflow", "Use Cases", ...(has(/integration/) ? ["Integrations"] : []), "Testimonials", "FAQ", "Final CTA");
    } else if (booking) {
      out.push("Hero", "Services", "Booking Form", "Social Proof", "Testimonials", "FAQ", "Final CTA");
    } else {
      out.push("Hero", "Social Proof", ...featureSections(), "Final CTA");
    }
  } else if (/feature|product/.test(p)) {
    out.push("Features Hero", "Feature Overview", saas ? "Feature Tabs" : "Feature Grid", "Detailed Feature Blocks", "Comparison / Why Choose Us", "Final CTA");
  } else if (/about/.test(p)) {
    out.push("Hero", "About", "Our Story", "Stats", has(/testimonial|review/) ? "Testimonials" : "Why Choose Us", "Final CTA");
  } else if (/contact/.test(p)) {
    out.push("Contact Hero", "Contact Information", "Contact Form", "FAQ");
  } else if (/service/.test(p)) {
    out.push("Hero", "Services", saas ? "Product Workflow" : "Why Choose Us", ...(has(/pricing/) ? ["Pricing"] : []), "FAQ", "Final CTA");
  } else if (/pricing|plan/.test(p)) {
    out.push("Pricing Hero", "Pricing", "Feature Comparison", "FAQ", "Final CTA");
  } else if (/faq/.test(p)) {
    out.push("FAQ", "Final CTA");
  } else if (/blog|resource|article/.test(p)) {
    out.push("Blog Hero", "Featured Articles", "Category Grid", "Newsletter");
  } else if (/portfolio|case|gallery|showcase|work/.test(p)) {
    out.push("Hero", saas ? "Template Showcase" : "Case Studies", "Final CTA");
  } else if (/booking|reserv|appointment/.test(p)) {
    out.push("Hero", "Booking Form", "Social Proof", "FAQ");
  } else if (/integration/.test(p)) {
    out.push("Hero", "Integrations", "Use Cases", "Final CTA");
  } else {
    out.push("Hero", saas ? "Feature Grid" : "Services", "Final CTA");
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
  { category: "Scroll / motion", items: ["Sticky Media", "Journey"] },
  { category: "Ecommerce", items: ["Product Grid", "Product Detail", "Cart", "Checkout"] },
  { category: "Directory / listing", items: ["Listings", "Search Filters", "Map / Location", "Category Grid"] },
  { category: "Dashboard / SaaS", items: ["Dashboard Preview", "Integrations", "Feature Grid"] },
  { category: "CTA", items: ["CTA", "Get Started"] },
  { category: "Footer", items: ["Footer", "Newsletter Footer", "Contact Footer"] },
];
