// Section Reference Library — pure logic. Turns a Vision analysis + user inputs
// into a reusable SectionPattern, matches it to an existing library variant (or
// flags a custom spec), and generates an ORIGINAL section spec from a pattern
// (reference-inspired: same structure idea, brand tokens, original copy, grey
// placeholder assets + AI image prompts — never a copy).

import { getVariantMetas, resolveVariantMeta } from "@/components/sections/catalog";
import type { SectionType } from "@/components/sections/types";
import type { ReferenceVisionResult } from "@/lib/ai/reference-vision";
import {
  DEFAULT_SIMILARITY_RULES, type CustomSectionSpec, type GeneratedSectionSpec,
  type ReferenceSectionType, type SectionPattern,
} from "./types";

const uid = (p: string) => `${p}-${(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10))}`;

/** Map a reference section type to a catalog SectionType (null = no direct match). */
function catalogTypeFor(rt: ReferenceSectionType): SectionType | null {
  const m: Record<string, SectionType> = {
    hero: "hero", features: "features", product: "showcase", services: "services",
    showcase: "showcase", gallery: "gallery", pricing: "pricing", testimonials: "testimonials",
    faq: "faq", cta: "cta", footer: "footer", navbar: "navbar", booking: "booking-form",
    contact: "contact-form", quote: "quote-form", dashboard: "dashboard",
    portfolio: "showcase", blog: "blog", directory: "directory", comparison: "comparison",
    accordion: "faq", process: "features", "social-proof": "social-proof",
  };
  return m[rt] ?? null;
}

/** Pick the closest existing variant from the section library, by keyword. */
export function matchExistingVariant(rt: ReferenceSectionType, text: string): { type: string; variantId: string; componentName: string } | null {
  const t = text.toLowerCase();
  // Scroll-driven / sticky-expand references get the scroll-media component.
  if (/scroll|sticky|expand.*(media|image)|parallax|pin(ned)?/.test(t) && ["gallery", "showcase", "hero", "custom"].includes(rt)) {
    const m = resolveVariantMeta("scroll-media", "expand");
    if (m) return { type: "scroll-media", variantId: m.id, componentName: m.componentName };
  }
  const type = catalogTypeFor(rt);
  if (!type) return null;
  let vid: string | undefined;
  switch (type) {
    case "features": vid = /accordion/.test(t) ? "accordion-visual" : /\btab/.test(t) ? "tabs" : /icon/.test(t) ? "icon-cards" : "grid"; break;
    case "hero": vid = /builder|editor|mockup|tiles|panel/.test(t) ? "builder" : /\bai\b|artificial|neural/.test(t) ? "ai-platform" : /booking|reserv/.test(t) ? "booking" : /split|two.?col|image.?right|side.?by/.test(t) ? "split-visual" : /saas|product|dashboard/.test(t) ? "saas" : /background|full.?bleed|overlay/.test(t) ? "image" : "centered"; break;
    case "gallery": vid = /marquee|moving|carousel|ticker|infinite/.test(t) ? "marquee" : "grid"; break;
    case "showcase": vid = /case.?stud/.test(t) ? "case-studies" : "templates"; break;
    case "cta": vid = /gradient/.test(t) ? "gradient" : /trial|sign.?up|free/.test(t) ? "trial" : /banner/.test(t) ? "banner" : /split/.test(t) ? "split" : "simple"; break;
    case "footer": vid = /newsletter|subscribe/.test(t) ? "newsletter" : /saas|multi|column/.test(t) ? "saas" : "simple"; break;
    case "services": vid = /grid|six|many|\b6\b/.test(t) ? "grid-6" : /image/.test(t) ? "image-cards" : "cards-3"; break;
    case "faq": vid = /two.?col/.test(t) ? "two-column" : /\bcta\b/.test(t) ? "with-cta" : "accordion"; break;
    default: vid = undefined;
  }
  const meta = resolveVariantMeta(type, vid);
  return meta ? { type, variantId: meta.id, componentName: meta.componentName } : null;
}

function buildCustomSpec(rt: ReferenceSectionType, vision: ReferenceVisionResult): CustomSectionSpec {
  const name = rt.charAt(0).toUpperCase() + rt.slice(1);
  return {
    needsNewComponent: true,
    suggestedComponentName: `Custom${name}Section`,
    layoutPattern: vision.layoutPattern,
    propsNeeded: vision.contentSlots.slice(0, 8),
    interactionNeeded: vision.interactionClues.filter((s) => !/no clear/i.test(s)),
    assetRoles: vision.imagePlacement.filter((s) => !/no imagery/i.test(s)).slice(0, 6),
    implementationNotes: `Build an original ${rt} section following this layout: ${vision.layoutPattern}. ${vision.reusableDesignRules.slice(0, 3).join(" ")}`,
  };
}

/** Combine a Vision analysis + user inputs into a reusable SectionPattern (draft). */
export function createSectionPatternFromReferenceImage(input: {
  sectionType: ReferenceSectionType;
  websiteType?: string;
  industry?: string;
  patternGoal?: string;
  styleTags?: string[];
  layoutTags?: string[];
  interactionTags?: string[];
  conversionTags?: string[];
  notes?: string;
  referenceImageUrl?: string;
  vision: ReferenceVisionResult;
}): SectionPattern {
  const v = input.vision;
  const now = new Date().toISOString();
  const styleTags = input.styleTags ?? [];
  const layoutTags = input.layoutTags ?? [];
  const interactionTags = input.interactionTags ?? [];
  const conversionTags = input.conversionTags ?? [];
  const allTags = [...styleTags, ...layoutTags, ...interactionTags, ...conversionTags];
  const matchText = [v.layoutPattern, v.visualHierarchy, ...v.componentStructure, ...v.interactionClues, ...allTags, input.patternGoal ?? "", input.notes ?? ""].join(" ");
  const matchedComponent = matchExistingVariant(input.sectionType, matchText);
  const customSpec = matchedComponent ? null : buildCustomSpec(input.sectionType, v);
  const bestFor = [input.websiteType, input.industry, input.patternGoal, ...allTags].filter(Boolean) as string[];

  return {
    id: uid("pat"),
    name: `${input.sectionType} pattern — ${styleTags[0] ?? input.patternGoal ?? input.websiteType ?? "reference"}`,
    sectionType: input.sectionType,
    source: "uploaded-reference",
    referenceImageId: uid("img"),
    referenceImageUrl: input.referenceImageUrl,
    websiteType: input.websiteType,
    industry: input.industry,
    patternGoal: input.patternGoal,
    styleTags,
    layoutTags,
    interactionTags,
    conversionTags,
    bestFor,
    userNotes: input.notes,
    notes: input.notes,
    layoutPattern: v.layoutPattern,
    visualHierarchy: v.visualHierarchy,
    componentStructure: v.componentStructure,
    typographyDirection: v.typographyObservations,
    colorDirection: v.colorUsage,
    spacingDirection: v.spacingObservations,
    buttonStyle: v.buttonStyle,
    cardStyle: v.cardStyle,
    imageTreatment: v.imagePlacement,
    assetRoles: v.imagePlacement.filter((s) => !/no imagery/i.test(s)),
    interactionPattern: v.interactionClues,
    responsiveBehavior: v.responsiveAssumptions,
    contentSlots: v.contentSlots,
    recommendedVariants: matchedComponent ? [matchedComponent.componentName] : [],
    matchedComponent,
    customSpec,
    similarityRules: DEFAULT_SIMILARITY_RULES,
    confidence: v.confidence,
    warnings: v.originalityWarnings,
    approved: false,
    createdAt: now,
    updatedAt: now,
  };
}

function aiPromptFor(role: string, pattern: SectionPattern): string {
  const mood = pattern.styleTags.join(", ") || pattern.colorDirection.slice(0, 1).join("");
  return `Original ${role} image for a ${pattern.sectionType} section${pattern.industry ? ` in the ${pattern.industry} industry` : ""}. Mood: ${mood || "clean, premium"}. On-brand, no logos or third-party content.`;
}

/** Generate an ORIGINAL section spec from a pattern (reference-inspired, not a copy). */
export function generateSectionFromReferencePattern(
  pattern: SectionPattern,
  ctx: { businessName?: string } = {},
): GeneratedSectionSpec {
  const match = pattern.matchedComponent;
  const needsNewComponent = !match || Boolean(pattern.customSpec?.needsNewComponent);
  const type = match?.type ?? pattern.sectionType;
  const componentName = match?.componentName ?? pattern.customSpec?.suggestedComponentName ?? "GenericSection";
  const designVariant = match?.variantId ?? "custom";
  const roles = (pattern.assetRoles.length ? pattern.assetRoles : ["primary visual"]).slice(0, 4);
  const who = ctx.businessName ? ` for ${ctx.businessName}` : "";

  return {
    id: uid("sec"),
    type,
    name: `${pattern.sectionType.charAt(0).toUpperCase() + pattern.sectionType.slice(1)} (reference-inspired)`,
    description: `Original ${pattern.sectionType} section${who} inspired by the "${pattern.name}" pattern — same structure idea, original content, brand tokens.`,
    purpose: pattern.visualHierarchy || `Communicate the ${pattern.sectionType} message with a clear hierarchy and CTA.`,
    layoutPattern: pattern.layoutPattern,
    designVariant,
    componentName,
    needsNewComponent,
    content: {
      eyebrowSlot: "Short label",
      headlineSlot: "Write an original, benefit-led headline (do not copy the reference).",
      subheadSlot: "One or two supporting sentences in the brand voice.",
      ctaPrimary: "Primary CTA",
      ctaSecondary: "Secondary CTA",
      slots: pattern.contentSlots,
    },
    assetPlacement: /left/i.test(pattern.layoutPattern) ? "left" : /right/i.test(pattern.layoutPattern) ? "right" : "none",
    assets: roles.map((role) => ({
      source: "placeholder" as const,
      role,
      url: "",
      altText: `${role} — grey placeholder`,
      aiPrompt: aiPromptFor(role, pattern),
      copyrightStatus: "placeholder" as const,
    })),
    interactionPattern: pattern.interactionPattern.filter((s) => !/no clear/i.test(s)),
    animationNotes: pattern.interactionPattern.some((s) => /scroll|sticky|expand|marquee|hover|carousel/i.test(s))
      ? "Subtle, purposeful motion mirroring the reference's interaction idea; honour prefers-reduced-motion."
      : "Subtle fade-up on scroll; no gratuitous motion.",
    responsiveNotes: (pattern.responsiveBehavior[0] && !/no clear/i.test(pattern.responsiveBehavior[0]))
      ? pattern.responsiveBehavior.join(" ")
      : "Mobile-first; multi-column layouts collapse to a single column.",
    source: "reference-inspired",
    referencePatternId: pattern.id,
    assumptions: needsNewComponent ? ["No existing component matched — a custom component spec was created for the builder."] : [],
  };
}

/** Filter/search helper for the library UI. */
export function filterPatterns(patterns: SectionPattern[], q: {
  text?: string; sectionType?: string; websiteType?: string; industry?: string;
  styleTag?: string; approved?: "all" | "approved" | "unapproved"; needsNewComponent?: boolean;
}): SectionPattern[] {
  const text = (q.text ?? "").trim().toLowerCase();
  return patterns.filter((p) => {
    if (q.sectionType && q.sectionType !== "all" && p.sectionType !== q.sectionType) return false;
    if (q.websiteType && !(p.websiteType ?? "").toLowerCase().includes(q.websiteType.toLowerCase())) return false;
    if (q.industry && !(p.industry ?? "").toLowerCase().includes(q.industry.toLowerCase())) return false;
    if (q.styleTag && q.styleTag !== "all" && !p.styleTags.includes(q.styleTag)) return false;
    if (q.approved === "approved" && !p.approved) return false;
    if (q.approved === "unapproved" && p.approved) return false;
    if (q.needsNewComponent && !p.customSpec?.needsNewComponent) return false;
    if (text) {
      const hay = [p.name, p.layoutPattern, p.notes ?? "", ...p.styleTags].join(" ").toLowerCase();
      if (!hay.includes(text)) return false;
    }
    return true;
  });
}
