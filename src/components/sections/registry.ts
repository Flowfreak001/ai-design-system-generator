// Client-side section registry: attaches the actual React components to the
// pure catalog metadata (catalog.ts) and exposes the lookup helpers the editor
// and render-section use. Server generators should import catalog.ts instead
// (no components) to stay out of the client bundle.
//
// TODO(editor): the editor uses these helpers to (a) list section types,
// (b) list variants per type, (c) resolve the component for a chosen variant.

import type { SectionType, SectionComponent, SectionVariant } from "./types";
import { getVariantMetas, getBestVariantId, resolveVariantMeta, sectionTypeForKind, SECTION_CATALOG, type VariantContext } from "./catalog";

import SimpleNavbar from "./navbar/SimpleNavbar";
import CenterLogoNavbar from "./navbar/CenterLogoNavbar";
import NavbarWithCTA from "./navbar/NavbarWithCTA";
import CenteredHero from "./hero/CenteredHero";
import SplitHero from "./hero/SplitHero";
import HeroWithImage from "./hero/HeroWithImage";
import HeroWithBookingForm from "./hero/HeroWithBookingForm";
import SaaSHero from "./hero/SaaSHero";
import LocalBusinessHero from "./hero/LocalBusinessHero";
import ServiceCards3 from "./services/ServiceCards3";
import ServiceGrid6 from "./services/ServiceGrid6";
import ServiceImageCards from "./services/ServiceImageCards";
import FeatureGrid from "./features/FeatureGrid";
import ContactFormSection from "./forms/ContactFormSection";
import BookingFormSection from "./forms/BookingFormSection";
import QuoteFormSection from "./forms/QuoteFormSection";
import FAQAccordion from "./faq/FAQAccordion";
import FAQTwoColumn from "./faq/FAQTwoColumn";
import FAQWithCTA from "./faq/FAQWithCTA";
import SimpleCTA from "./cta/SimpleCTA";
import SplitCTA from "./cta/SplitCTA";
import BannerCTA from "./cta/BannerCTA";
import SimpleFooter from "./footer/SimpleFooter";
import MultiColumnFooter from "./footer/MultiColumnFooter";
import FooterWithNewsletter from "./footer/FooterWithNewsletter";
import PricingCards from "./pricing/PricingCards";
import TestimonialCards from "./testimonials/TestimonialCards";
import GalleryGrid from "./gallery/GalleryGrid";
import ListingGrid from "./directory/ListingGrid";
import DashboardPreviewSection from "./dashboard/DashboardPreviewSection";
// Elementor-grade marketing sections (folder index files, named exports).
import { AIPlatformHero, SplitVisualHero } from "./hero/marketing";
import { FeatureCardsWithIcons, FeatureTabs } from "./features/marketing";
import { GradientCTA, TrialSignupCTA } from "./cta/marketing";
import { SaaSFooter } from "./footer/marketing";
import { LogoCloud, ReviewStats, TrustBadgeStrip } from "./social-proof";
import { StepByStepProcess, HowItWorksCards, AIWorkflowSection } from "./workflow";
import { TemplateGallery, CaseStudyCards } from "./showcase";
import { UseCaseCards, IndustryGrid } from "./use-cases";
import { ComparisonTable, WhyChooseUsGrid } from "./comparison";
import { IntegrationLogoCloud } from "./integrations";

/** SectionType → variant id → component. Keys mirror catalog.ts ids. */
const COMPONENTS: Partial<Record<SectionType, Record<string, SectionComponent>>> = {
  navbar: { simple: SimpleNavbar, "center-logo": CenterLogoNavbar, "with-cta": NavbarWithCTA },
  hero: { centered: CenteredHero, split: SplitHero, "split-visual": SplitVisualHero, image: HeroWithImage, booking: HeroWithBookingForm, saas: SaaSHero, "ai-platform": AIPlatformHero, local: LocalBusinessHero },
  services: { "cards-3": ServiceCards3, "grid-6": ServiceGrid6, "image-cards": ServiceImageCards },
  features: { grid: FeatureGrid, "icon-cards": FeatureCardsWithIcons, tabs: FeatureTabs },
  "social-proof": { "logo-cloud": LogoCloud, "review-stats": ReviewStats, "trust-badges": TrustBadgeStrip },
  workflow: { steps: StepByStepProcess, cards: HowItWorksCards, ai: AIWorkflowSection },
  showcase: { templates: TemplateGallery, "case-studies": CaseStudyCards },
  "use-cases": { cards: UseCaseCards, industries: IndustryGrid },
  comparison: { table: ComparisonTable, "why-us": WhyChooseUsGrid },
  integrations: { logos: IntegrationLogoCloud },
  "booking-form": { default: BookingFormSection },
  "contact-form": { default: ContactFormSection },
  "quote-form": { default: QuoteFormSection },
  faq: { accordion: FAQAccordion, "two-column": FAQTwoColumn, "with-cta": FAQWithCTA },
  cta: { simple: SimpleCTA, split: SplitCTA, banner: BannerCTA, gradient: GradientCTA, trial: TrialSignupCTA },
  footer: { simple: SimpleFooter, "multi-column": MultiColumnFooter, newsletter: FooterWithNewsletter, saas: SaaSFooter },
  pricing: { cards: PricingCards },
  testimonials: { cards: TestimonialCards },
  gallery: { grid: GalleryGrid },
  directory: { grid: ListingGrid },
  dashboard: { preview: DashboardPreviewSection },
};

/** Full variants (metadata + component) for a section type. */
export function getSectionVariants(type: SectionType): SectionVariant[] {
  const map = COMPONENTS[type];
  return getVariantMetas(type)
    .filter((m) => map?.[m.id])
    .map((m) => ({ ...m, component: map![m.id] }));
}

export function getDefaultVariant(type: SectionType): SectionVariant | undefined {
  return getSectionVariants(type)[0];
}

export function getBestVariant(type: SectionType, ctx: VariantContext = {}): SectionVariant | undefined {
  const id = getBestVariantId(type, ctx);
  const variants = getSectionVariants(type);
  return variants.find((v) => v.id === id) ?? variants[0];
}

/** Resolve the component for a type + chosen variant (falls back to default). */
export function getSectionComponent(type: SectionType, variant?: string): SectionComponent | undefined {
  const map = COMPONENTS[type];
  if (!map) return undefined;
  if (variant && map[variant]) return map[variant];
  const firstId = getVariantMetas(type)[0]?.id;
  return firstId ? map[firstId] : undefined;
}

export { SECTION_CATALOG, getVariantMetas, resolveVariantMeta, getBestVariantId, sectionTypeForKind };
export type { VariantContext };
