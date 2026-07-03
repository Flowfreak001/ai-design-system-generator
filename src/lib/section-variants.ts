// Pure design-variant metadata (id, label, component name) per section kind.
// The source of truth for WHICH variants exist. The actual styled React
// components live in components/sections/variants.tsx (keyed by the same ids);
// server-side generators use this pure module to resolve a section's chosen
// variant to its exported component name without pulling client JSX.

import type { SectionKind } from "./sections";

export type VariantMeta = { id: string; label: string; component: string };

export const VARIANT_META: Partial<Record<SectionKind, VariantMeta[]>> = {
  hero: [
    { id: "centered", label: "Centered", component: "CenteredHero" },
    { id: "split", label: "Split", component: "SplitHero" },
    { id: "image-right", label: "Image Right", component: "ImageRightHero" },
    { id: "booking", label: "Booking", component: "BookingHero" },
    { id: "saas", label: "SaaS", component: "SaaSHero" },
    { id: "local", label: "Local Business", component: "LocalBusinessHero" },
  ],
  services: [
    { id: "cards-3", label: "3 Cards", component: "ServiceCards3" },
    { id: "grid-6", label: "6 Grid", component: "ServiceGrid6" },
    { id: "image-cards", label: "Image Cards", component: "ServiceImageCards" },
    { id: "split-list", label: "Split List", component: "ServiceSplitList" },
  ],
  faq: [
    { id: "accordion", label: "Accordion", component: "FAQAccordion" },
    { id: "two-column", label: "Two Column", component: "FAQTwoColumn" },
    { id: "with-cta", label: "With CTA", component: "FAQWithCTA" },
  ],
  cta: [
    { id: "simple", label: "Simple", component: "SimpleCTA" },
    { id: "split", label: "Split", component: "SplitCTA" },
    { id: "banner", label: "Banner", component: "BannerCTA" },
  ],
  footer: [
    { id: "simple", label: "Simple", component: "SimpleFooter" },
    { id: "multi-column", label: "Multi Column", component: "MultiColumnFooter" },
    { id: "newsletter", label: "Newsletter", component: "NewsletterFooter" },
  ],
};

export function variantMetaForKind(kind: SectionKind): VariantMeta[] {
  return VARIANT_META[kind] ?? [];
}

/** Resolve a section's chosen variant id to its metadata (first if unset). */
export function resolveVariant(kind: SectionKind, id: string | undefined): VariantMeta | null {
  const list = VARIANT_META[kind];
  if (!list || list.length === 0) return null;
  return list.find((v) => v.id === id) ?? list[0];
}
