// Curated "Full Sections" library (Phase 1). These reference real, registered
// section components (components/sections/*) resolved through the catalog, so
// each entry is export-ready and theme-driven. This is the section-level twin of
// element-library — a hand-picked, premium set surfaced to the builder.
//
// Sources: our custom sections + 21st.dev/Aceternity-inspired variants,
// normalized. See docs/COMPONENT_SOURCES.md.

import { MOTION_PRESETS, type MotionPreset } from "./motion-presets";
import { resolveVariantMeta } from "@/components/sections/catalog";
import type { SectionType } from "@/components/sections/types";

export interface CuratedSection {
  id: string;
  name: string;
  kind: "section";
  category: string;
  sectionType: SectionType;
  variant: string;
  componentName: string;
  description: string;
  bestFor: string[];
  websiteTypes: string[];
  industries: string[];
  goals: string[];
  styleTags: string[];
  layoutTags: string[];
  interactionTags: string[];
  assetRoles: string[];
  /** Suggested motion preset id (from motion-presets). */
  motionPreset?: string;
  exportNotes: string;
  status: "ready";
}

const cn = (type: SectionType, variant: string) => resolveVariantMeta(type, variant)?.componentName ?? "GenericSection";
const S = (
  id: string, name: string, category: string, sectionType: SectionType, variant: string,
  extra: Partial<CuratedSection> = {},
): CuratedSection => ({
  id, name, kind: "section", category, sectionType, variant, componentName: cn(sectionType, variant),
  description: "", bestFor: [], websiteTypes: [], industries: [], goals: [], styleTags: [],
  layoutTags: [], interactionTags: [], assetRoles: [], exportNotes: "", status: "ready", ...extra,
});

export const SECTION_LIBRARY: CuratedSection[] = [
  S("full-hero-saas", "SaaS Product Hero", "Hero", "hero", "saas", { websiteTypes: ["SaaS / Software"], goals: ["Drive primary CTA"], motionPreset: "fade-up", assetRoles: ["mockup"], exportNotes: "Product hero with headline/subhead/CTA + grey product mockup." }),
  S("full-hero-split", "Split Visual Hero", "Hero", "hero", "split-visual", { layoutTags: ["split-layout"], assetRoles: ["image"], motionPreset: "fade-up", exportNotes: "Two-column hero; grey visual placeholder on one side." }),
  S("full-features-bento", "Feature Cards With Icons", "Features", "features", "icon-cards", { goals: ["Show product features"], motionPreset: "scroll-reveal", exportNotes: "Icon feature cards; reveal on scroll." }),
  S("full-features-tabs", "Feature Tabs", "Features", "features", "tabs", { interactionTags: ["tabs"], exportNotes: "Tabbed feature switcher." }),
  S("full-social-logos", "Logo Cloud", "Social Proof", "social-proof", "logo-cloud", { goals: ["Build trust"], assetRoles: ["logo"], exportNotes: "Client/partner logo cloud; grey logo placeholders." }),
  S("full-testimonials", "Testimonial Cards", "Social Proof", "testimonials", "cards", { goals: ["Build trust"], motionPreset: "scroll-reveal", exportNotes: "Testimonial cards grid." }),
  S("full-pricing", "Pricing Cards", "Pricing", "pricing", "cards", { goals: ["Buy product"], exportNotes: "Pricing tiers with feature lists." }),
  S("full-gallery-marquee", "Moving Showcase", "Showcase", "gallery", "marquee", { interactionTags: ["marquee"], assetRoles: ["image"], motionPreset: "marquee", exportNotes: "Two-row auto-scroll marquee; pause on hover; reduced-motion safe." }),
  S("full-scroll-media", "Sticky Expanding Media", "Showcase", "scroll-media", "expand", { interactionTags: ["sticky-scroll"], assetRoles: ["media"], motionPreset: "sticky-reveal", exportNotes: "Scroll-driven sticky media that expands; reduced-motion renders final state." }),
  S("full-cta-gradient", "Gradient CTA", "Conversion", "cta", "gradient", { goals: ["Drive primary CTA"], styleTags: ["bold"], exportNotes: "Full-width gradient CTA band." }),
];

export const getCuratedSection = (id: string): CuratedSection | undefined => SECTION_LIBRARY.find((s) => s.id === id);
export const getSectionMotion = (s: CuratedSection): MotionPreset | undefined => MOTION_PRESETS.find((m) => m.id === s.motionPreset);
