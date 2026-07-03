// Pure, server-safe catalog of section variants (no React component imports),
// so server generators (REACT_EXPORT_PLAN.json, COMPONENTS.md, prompts) can
// resolve a section's chosen variant to its component name + import path
// without pulling client JSX into the server bundle. The client registry
// (registry.ts) attaches the actual components to these ids.

import type { SectionType, VariantMeta, SectionCatalogEntry } from "./types";

const DIR = "@/components/sections";

const V = (
  id: string, label: string, componentName: string, importPath: string,
  bestFor: string[], opts: { supportsAssetSwap?: boolean; exportNotes?: string } = {},
): VariantMeta => ({ id, label, componentName, importPath: `${DIR}/${importPath}`, bestFor, ...opts });

export const SECTION_CATALOG: Partial<Record<SectionType, SectionCatalogEntry>> = {
  navbar: {
    label: "Navbar",
    variants: [
      V("simple", "Simple Navbar", "SimpleNavbar", "navbar/SimpleNavbar", ["general", "professional-service", "local-service"]),
      V("center-logo", "Center Logo", "CenterLogoNavbar", "navbar/CenterLogoNavbar", ["agency", "ecommerce", "professional-service"]),
      V("with-cta", "Navbar With CTA", "NavbarWithCTA", "navbar/NavbarWithCTA", ["saas", "platform", "booking"]),
    ],
  },
  hero: {
    label: "Hero",
    variants: [
      V("centered", "Centered Hero", "CenteredHero", "hero/CenteredHero", ["general", "agency", "professional-service"]),
      V("split", "Split Hero", "SplitHero", "hero/SplitHero", ["agency", "professional-service", "construction"], { supportsAssetSwap: true }),
      V("split-visual", "Split Visual Hero", "SplitVisualHero", "hero/marketing", ["saas", "platform", "agency", "software"], { supportsAssetSwap: true }),
      V("image", "Hero With Image", "HeroWithImage", "hero/HeroWithImage", ["ecommerce", "agency", "construction"]),
      V("booking", "Hero With Booking Form", "HeroWithBookingForm", "hero/HeroWithBookingForm", ["booking", "car-rental", "parking", "taxi", "healthcare"], { supportsAssetSwap: true }),
      V("saas", "SaaS Product Hero", "SaaSHero", "hero/SaaSHero", ["saas", "platform", "dashboard"]),
      V("ai-platform", "AI Platform Hero", "AIPlatformHero", "hero/marketing", ["saas", "platform", "ai", "software"]),
      V("builder", "Builder Hero + Editor Mockup", "BuilderHero", "hero/BuilderHero", ["saas", "platform", "builder", "software", "agency"], { supportsAssetSwap: true }),
      V("local", "Local Business Hero", "LocalBusinessHero", "hero/LocalBusinessHero", ["local-service", "construction", "maintenance", "healthcare"], { supportsAssetSwap: true }),
    ],
  },
  "social-proof": {
    label: "Social Proof",
    variants: [
      V("logo-cloud", "Logo Cloud", "LogoCloud", "social-proof", ["saas", "platform", "agency", "software"]),
      V("review-stats", "Review Stats", "ReviewStats", "social-proof", ["general", "agency", "local-service", "ecommerce"]),
      V("trust-badges", "Trust Badge Strip", "TrustBadgeStrip", "social-proof", ["saas", "local-service", "healthcare", "booking"]),
    ],
  },
  workflow: {
    label: "Product Workflow",
    variants: [
      V("steps", "Step-by-step Process", "StepByStepProcess", "workflow", ["saas", "platform", "professional-service"]),
      V("cards", "How It Works Cards", "HowItWorksCards", "workflow", ["saas", "agency", "software"]),
      V("ai", "AI Workflow", "AIWorkflowSection", "workflow", ["ai", "saas", "platform"], { supportsAssetSwap: true }),
    ],
  },
  showcase: {
    label: "Showcase",
    variants: [
      V("templates", "Template Gallery", "TemplateGallery", "showcase", ["saas", "platform", "ecommerce"]),
      V("case-studies", "Case Study Cards", "CaseStudyCards", "showcase", ["agency", "professional-service", "software"]),
    ],
  },
  "use-cases": {
    label: "Use Cases",
    variants: [
      V("cards", "Use Case Cards", "UseCaseCards", "use-cases", ["saas", "platform", "software"]),
      V("industries", "Industry Grid", "IndustryGrid", "use-cases", ["saas", "agency", "platform"]),
    ],
  },
  comparison: {
    label: "Comparison",
    variants: [
      V("table", "Comparison Table", "ComparisonTable", "comparison", ["saas", "platform", "software"]),
      V("why-us", "Why Choose Us", "WhyChooseUsGrid", "comparison", ["agency", "professional-service", "local-service"]),
    ],
  },
  integrations: {
    label: "Integrations",
    variants: [
      V("logos", "Integration Logos", "IntegrationLogoCloud", "integrations", ["saas", "platform", "software", "ai"]),
    ],
  },
  services: {
    label: "Services",
    variants: [
      V("cards-3", "3 Cards", "ServiceCards3", "services/ServiceCards3", ["local-service", "professional-service", "general"]),
      V("grid-6", "6 Grid", "ServiceGrid6", "services/ServiceGrid6", ["agency", "saas", "construction"]),
      V("image-cards", "Image Cards", "ServiceImageCards", "services/ServiceImageCards", ["ecommerce", "local-service", "healthcare"]),
    ],
  },
  features: {
    label: "Features",
    variants: [
      V("grid", "Feature Grid", "FeatureGrid", "features/FeatureGrid", ["saas", "platform", "agency"]),
      V("icon-cards", "Feature Cards With Icons", "FeatureCardsWithIcons", "features/marketing", ["saas", "platform", "agency", "software"]),
      V("tabs", "Feature Tabs", "FeatureTabs", "features/marketing", ["saas", "platform", "software"]),
      V("accordion-visual", "Feature Accordion + Visual", "FeatureSplitAccordion", "features/FeatureSplitAccordion", ["saas", "platform", "builder", "agency"], { supportsAssetSwap: true }),
    ],
  },
  "booking-form": {
    label: "Booking Form",
    variants: [
      V("default", "Booking Form", "BookingFormSection", "forms/BookingFormSection", ["booking", "car-rental", "taxi", "healthcare", "parking"]),
    ],
  },
  "contact-form": {
    label: "Contact Form",
    variants: [
      V("default", "Contact Form", "ContactFormSection", "forms/ContactFormSection", ["general", "professional-service", "agency"]),
    ],
  },
  "quote-form": {
    label: "Quote Form",
    variants: [
      V("default", "Quote Form", "QuoteFormSection", "forms/QuoteFormSection", ["construction", "maintenance", "local-service"], { supportsAssetSwap: true }),
    ],
  },
  faq: {
    label: "FAQ",
    variants: [
      V("accordion", "Accordion", "FAQAccordion", "faq/FAQAccordion", ["general", "saas", "professional-service"]),
      V("two-column", "Two Column", "FAQTwoColumn", "faq/FAQTwoColumn", ["agency", "ecommerce"]),
      V("with-cta", "With CTA", "FAQWithCTA", "faq/FAQWithCTA", ["booking", "local-service", "saas"], { supportsAssetSwap: true }),
    ],
  },
  cta: {
    label: "CTA",
    variants: [
      V("simple", "Simple CTA", "SimpleCTA", "cta/SimpleCTA", ["general", "agency"]),
      V("split", "Split CTA", "SplitCTA", "cta/SplitCTA", ["saas", "professional-service"]),
      V("banner", "Banner CTA", "BannerCTA", "cta/BannerCTA", ["booking", "ecommerce", "local-service"]),
      V("gradient", "Gradient CTA", "GradientCTA", "cta/marketing", ["saas", "platform", "software", "ai"]),
      V("trial", "Trial Signup CTA", "TrialSignupCTA", "cta/marketing", ["saas", "platform", "software"]),
    ],
  },
  footer: {
    label: "Footer",
    variants: [
      V("simple", "Simple Footer", "SimpleFooter", "footer/SimpleFooter", ["local-service", "professional-service"]),
      V("multi-column", "Multi Column", "MultiColumnFooter", "footer/MultiColumnFooter", ["saas", "agency", "ecommerce", "platform"]),
      V("newsletter", "Footer With Newsletter", "FooterWithNewsletter", "footer/FooterWithNewsletter", ["saas", "ecommerce", "blog"]),
      V("saas", "SaaS Footer", "SaaSFooter", "footer/marketing", ["saas", "platform", "software", "ai"]),
    ],
  },
  // Single-variant sections (more variants are Phase 2 TODO).
  pricing: { label: "Pricing", variants: [V("cards", "Pricing Cards", "PricingCards", "pricing/PricingCards", ["saas", "platform"])] },
  testimonials: { label: "Testimonials", variants: [V("cards", "Testimonial Cards", "TestimonialCards", "testimonials/TestimonialCards", ["general", "agency", "local-service"])] },
  gallery: {
    label: "Gallery",
    variants: [
      V("marquee", "Moving Showcase", "GalleryMarquee", "gallery/GalleryMarquee", ["agency", "creative", "portfolio", "ecommerce"], { exportNotes: "Two rows auto-scrolling horizontally in opposite directions; pause on hover; respects prefers-reduced-motion." }),
      V("grid", "Gallery Grid", "GalleryGrid", "gallery/GalleryGrid", ["ecommerce", "agency", "construction"]),
    ],
  },
  directory: { label: "Directory", variants: [V("grid", "Listing Grid", "ListingGrid", "directory/ListingGrid", ["directory", "ecommerce"])] },
  dashboard: { label: "Dashboard", variants: [V("preview", "Dashboard Preview", "DashboardPreviewSection", "dashboard/DashboardPreviewSection", ["saas", "platform", "dashboard"])] },
  // TODO Phase 2: portfolio, blog, testimonials carousel, pricing comparison,
  //   gallery masonry, directory search/filter, stats dashboard, etc.
};

/** Map the editor's inferred section kind to a library SectionType. */
export function sectionTypeForKind(kind: string): SectionType {
  const map: Record<string, SectionType> = {
    navbar: "navbar", hero: "hero", services: "services", features: "features",
    socialproof: "social-proof", workflow: "workflow", showcase: "showcase",
    usecases: "use-cases", comparison: "comparison", integrations: "integrations",
    form: "contact-form", booking: "booking-form", pricing: "pricing", faq: "faq",
    testimonials: "testimonials", gallery: "gallery", cta: "cta", footer: "footer",
    directory: "directory", dashboard: "dashboard", generic: "features",
  };
  return map[kind] ?? "features";
}

export function getVariantMetas(type: SectionType): VariantMeta[] {
  return SECTION_CATALOG[type]?.variants ?? [];
}

/** Resolve a chosen variant id to its metadata (first variant if unset/invalid). */
export function resolveVariantMeta(type: SectionType, variantId?: string): VariantMeta | null {
  const list = getVariantMetas(type);
  if (list.length === 0) return null;
  return list.find((v) => v.id === variantId) ?? list[0];
}

export interface VariantContext {
  websiteType?: string;
  industry?: string;
  businessType?: string;
  goals?: string[];
  features?: string[];
  brandMood?: string;
  sectionPurpose?: string;
  serviceCount?: number;
  pageCount?: number;
}

const has = (s: string | undefined, ...needles: string[]) =>
  !!s && needles.some((n) => s.toLowerCase().includes(n));
const any = (arr: string[] | undefined, ...needles: string[]) =>
  !!arr && arr.some((v) => needles.some((n) => v.toLowerCase().includes(n)));

/** Pick the best variant id for a section type given the project context. */
export function getBestVariantId(type: SectionType, ctx: VariantContext = {}): string {
  const list = getVariantMetas(type);
  if (list.length === 0) return "default";
  const first = list[0].id;
  const blob = [ctx.websiteType, ctx.industry, ctx.businessType].filter(Boolean).join(" ");
  const saas = has(blob, "saas", "platform", "software", "app", "tool", "tech", "startup", "product", "dashboard");
  const ai = has(blob, "ai", "artificial", "ml", "gpt", "llm");
  const agency = has(blob, "agency", "studio", "consult", "marketing");
  const booking = has(ctx.websiteType, "booking") || has(ctx.businessType, "booking", "rental", "taxi", "parking", "salon", "clinic") || any(ctx.goals, "booking", "book");
  const local = has(ctx.businessType, "local", "service", "trade") || has(ctx.industry, "construction", "maintenance", "clinic", "healthcare", "plumb", "electric");

  switch (type) {
    case "hero":
      if (booking) return "booking";
      if (ai) return "ai-platform";
      if (saas) return "saas";
      if (agency) return "split-visual";
      if (local) return "local";
      return "centered";
    case "social-proof":
      return saas || agency ? "logo-cloud" : "review-stats";
    case "workflow":
      return ai ? "ai" : "steps";
    case "showcase":
      return agency ? "case-studies" : "templates";
    case "use-cases":
      return "cards";
    case "comparison":
      return saas ? "table" : "why-us";
    case "features":
      return saas || agency ? "icon-cards" : "grid";
    case "services":
      return (ctx.serviceCount ?? 3) > 3 ? "grid-6" : "cards-3";
    case "faq":
      return "accordion";
    case "footer":
      return saas ? "saas" : (ctx.pageCount ?? 0) > 5 ? "multi-column" : "simple";
    case "cta":
      if (booking) return "banner";
      if (saas || ai) return any(ctx.goals, "trial", "signup", "sign up") ? "trial" : "gradient";
      return "split";
    default:
      return first;
  }
}
