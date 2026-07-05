// Section Reference Library — pure logic. Turns a Vision analysis + user inputs
// into a reusable SectionPattern, matches it to an existing library variant (or
// flags a custom spec), and generates an ORIGINAL section spec from a pattern
// (reference-inspired: same structure idea, brand tokens, original copy, grey
// placeholder assets + AI image prompts — never a copy).

import { getVariantMetas, resolveVariantMeta } from "@/components/sections/catalog";
import { normalizeBlueprint, normalizeDetected, enforcePattern, buildBlueprintFromPattern, validateBlueprintAgainstDetected } from "./blueprint";
import type { SectionType } from "@/components/sections/types";
import type { ReferenceVisionResult } from "@/lib/ai/reference-vision";
import {
  DEFAULT_SIMILARITY_RULES, PURPOSE_CATEGORY_OF, LEGACY_GOAL_TO_PURPOSE,
  VISUAL_STYLE_TAGS, LAYOUT_TAGS, INTERACTION_TAGS,
  type CustomSectionSpec, type GeneratedSectionSpec,
  type ReferenceSectionType, type SectionPattern,
} from "./types";

// Extra keyword hints so auto-tagging still fires when the model doesn't
// return a tag verbatim (also covers the no-API-key keyword fallback).
const TAG_SYNONYMS: Record<string, string[]> = {
  dark: ["dark", "black background", "midnight"], light: ["light background", "white background", "bright"],
  bold: ["bold", "large heading", "oversized", "strong"], minimal: ["minimal", "clean", "whitespace", "sparse"],
  luxury: ["luxury", "premium", "elegant", "refined"], playful: ["playful", "fun", "rounded", "vibrant"],
  editorial: ["editorial", "magazine", "serif"], corporate: ["corporate", "professional", "enterprise"],
  futuristic: ["futuristic", "neon", "glow", "gradient mesh"], soft: ["soft", "pastel", "muted"],
  "high-contrast": ["high contrast", "high-contrast"], premium: ["premium", "polished"],
  "split-layout": ["split", "two column", "two-column", "side by side", "side-by-side"],
  "grid-based": ["grid"], "card-based": ["card"], "image-led": ["image-led", "image led", "large image", "photo-forward"],
  "text-heavy": ["text-heavy", "text heavy", "copy-dense"], "full-width": ["full-width", "full width", "full-bleed", "edge to edge"],
  asymmetric: ["asymmetric", "asymmetrical", "offset"], centered: ["centered", "center-aligned"],
  "multi-column": ["multi-column", "multi column", "columns"], sticky: ["sticky", "pinned"],
  interactive: ["interactive"], accordion: ["accordion", "expand/collapse", "collapsible"], tabs: ["tab"],
  "hover-expand": ["hover expand", "hover-expand", "hover to expand"], "scroll-reveal": ["scroll reveal", "scroll-reveal", "fade in on scroll", "reveal on scroll"],
  "sticky-scroll": ["sticky scroll", "sticky-scroll", "pinned scroll", "scroll pin"], carousel: ["carousel", "slider"],
  marquee: ["marquee", "ticker", "moving strip", "infinite scroll strip"], "motion-heavy": ["motion-heavy", "animation-heavy", "lots of motion"],
  "subtle-motion": ["subtle motion", "subtle-motion", "gentle motion"],
};

/** Auto-tag from Vision suggestions + keyword scan, constrained to a vocab. */
function autoTags(vocab: readonly string[], suggested: string[], text: string): string[] {
  const t = text.toLowerCase();
  const out = new Set(suggested.filter((s) => (vocab as readonly string[]).includes(s)));
  for (const tag of vocab) {
    const keys = TAG_SYNONYMS[tag] ?? [tag];
    if (keys.some((k) => t.includes(k))) out.add(tag);
  }
  return [...out];
}

const union = (a: string[], b: string[]): string[] => [...new Set([...a, ...b])];

/** The pattern's effective primary purpose (maps legacy patternGoal forward). */
function effectivePurpose(p: SectionPattern): string {
  return p.primaryPurpose || (p.patternGoal ? LEGACY_GOAL_TO_PURPOSE[p.patternGoal] ?? p.patternGoal : "");
}

/** Purpose-driven guidance for generating an original section from a pattern. */
function purposeGuidance(purpose: string): { cta: string; focus: string; exportNote: string } {
  const p = purpose.toLowerCase();
  if (/booking|reserv/.test(p)) return { cta: "Book now", focus: "booking action + supporting trust copy", exportNote: "Include a booking CTA/form and reassurance copy; conversion-focused layout." };
  if (/quote/.test(p)) return { cta: "Request a quote", focus: "quote form + qualifying fields", exportNote: "Include a quote request form and trust copy; conversion-focused layout." };
  if (/lead|contact sales/.test(p)) return { cta: "Get in touch", focus: "lead capture + value reminder", exportNote: "Include a short lead form or contact CTA; keep friction low." };
  if (/free trial|signup|subscribe/.test(p)) return { cta: "Start free", focus: "primary signup CTA + low-risk reassurance", exportNote: "Emphasise the signup CTA and a no-risk line; conversion-focused layout." };
  if (/buy|purchase/.test(p)) return { cta: "Buy now", focus: "price/value + purchase CTA", exportNote: "Emphasise price/value and a clear purchase CTA." };
  if (/download/.test(p)) return { cta: "Download", focus: "resource value + download CTA", exportNote: "Emphasise the resource's value and a download CTA." };
  if (/drive primary cta|main offer|promote/.test(p)) return { cta: "Get started", focus: "headline hierarchy + prominent primary CTA", exportNote: "Lead with a strong headline and a single prominent CTA; conversion layout." };
  if (/benefit|feature|module|capabilit|technical/.test(p)) return { cta: "See features", focus: "benefit-led heading + feature cards/accordion + supporting visual", exportNote: "Use a benefit-led heading with feature cards or an accordion and a supporting visual placeholder." };
  if (/trust|testimonial|logo|review|case study|certification|statistic/.test(p)) return { cta: "See the results", focus: "proof placement — logos, quotes, stats", exportNote: "Foreground proof (logos/quotes/stats) near the top; trust-building layout." };
  if (/showcase|portfolio|gallery|before|visual impact|brand story/.test(p)) return { cta: "View work", focus: "large media + minimal chrome", exportNote: "Lead with large visual placeholders and minimal surrounding text." };
  if (/process|how it works|guide|educate|answer|pricing|package/.test(p)) return { cta: "Learn more", focus: "clear steps/answers + scannable structure", exportNote: "Use a stepped or Q&A structure that is easy to scan." };
  if (/navigate|categor|location|directory|filter|search|account|login/.test(p)) return { cta: "Browse", focus: "clear navigation/entry points", exportNote: "Prioritise clear navigation, categories or search entry points." };
  if (/newsletter|community|related|keep user|next step/.test(p)) return { cta: "Continue", focus: "next-step nudge + secondary links", exportNote: "Add a gentle next-step nudge and related links; engagement-focused." };
  if (/introduce brand|value proposition|product introduction|service introduction|launch/.test(p)) return { cta: "Learn more", focus: "brand/value headline + supporting visual", exportNote: "Lead with a clear value/brand headline and a supporting visual placeholder." };
  return { cta: "Primary CTA", focus: "clear hierarchy + CTA", exportNote: "Communicate the message with a clear hierarchy and CTA." };
}

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

const REF_TYPES = new Set<ReferenceSectionType>([
  "hero", "navbar", "features", "services", "product", "gallery", "portfolio", "pricing",
  "testimonials", "faq", "cta", "footer", "contact", "booking", "quote", "blog",
  "directory", "dashboard", "accordion", "comparison", "process", "social-proof", "showcase", "custom",
]);

/** Map Vision's freeform classification to a valid section type. */
function mapVisionType(raw: string): ReferenceSectionType | null {
  const t = raw.trim().toLowerCase();
  if (REF_TYPES.has(t as ReferenceSectionType)) return t as ReferenceSectionType;
  if (/case.?stud|result|logo|\bstat|metric|client|review|proof|trust|award/.test(t)) return "social-proof";
  if (/testimonial|quote/.test(t)) return "testimonials";
  if (/faq|accordion/.test(t)) return "accordion";
  if (/pricing|plan|tier/.test(t)) return "pricing";
  if (/gallery|portfolio|showcase/.test(t)) return "gallery";
  if (/contact|\bform\b|booking/.test(t)) return "contact";
  if (/feature/.test(t)) return "features";
  if (/service/.test(t)) return "services";
  if (/footer/.test(t)) return "footer";
  if (/cta|call.?to.?action/.test(t)) return "cta";
  if (/hero|banner|intro/.test(t)) return "hero";
  return null;
}

/** The user's dropdown type is a WEAK hint — the AI's visual classification wins
 *  when Vision ran and the image clearly says something else. */
function resolveSectionType(userType: ReferenceSectionType, v: ReferenceVisionResult): { type: ReferenceSectionType; overridden: boolean } {
  if (v.source !== "openai_vision") return { type: userType, overridden: false };
  const d = v.detected;
  // Strong visual signals beat the dropdown outright.
  if (d?.hasCarousel && (d.hasStats || d.hasLogos)) return { type: "social-proof", overridden: userType !== "social-proof" };
  const mapped = mapVisionType(v.likelySectionType || "");
  if (mapped) return { type: mapped, overridden: mapped !== userType };
  return { type: userType, overridden: false };
}

/** Combine a Vision analysis + user inputs into a reusable SectionPattern (draft). */
export function createSectionPatternFromReferenceImage(input: {
  sectionType: ReferenceSectionType;
  websiteType?: string;
  industry?: string;
  primaryPurpose?: string;
  secondaryPurposes?: string[];
  purposeCategory?: string;
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
  // Classify by the image, not the dropdown (weak hint).
  const { type: sectionType, overridden } = resolveSectionType(input.sectionType, v);
  // Text the keyword auto-tagger scans (image-derived observations + notes).
  const visionText = [
    v.layoutPattern, v.visualHierarchy, ...v.componentStructure, ...v.interactionClues,
    ...v.animationClues, ...v.backgroundStyle, ...v.cardStyle, ...v.reusableDesignRules,
    ...v.typographyObservations, input.notes ?? "",
  ].join(" ");
  // Merge the user's picks with what the AI detected from the image.
  const styleTags = union(input.styleTags ?? [], autoTags(VISUAL_STYLE_TAGS, v.suggestedStyleTags, visionText));
  const layoutTags = union(input.layoutTags ?? [], autoTags(LAYOUT_TAGS, v.suggestedLayoutTags, visionText));
  const interactionTags = union(input.interactionTags ?? [], autoTags(INTERACTION_TAGS, v.suggestedInteractionTags, visionText));
  const conversionTags = input.conversionTags ?? [];
  const secondaryPurposes = input.secondaryPurposes ?? [];
  const purposeCategory = input.primaryPurpose ? PURPOSE_CATEGORY_OF[input.primaryPurpose] ?? input.purposeCategory : input.purposeCategory;
  const allTags = [...styleTags, ...layoutTags, ...interactionTags, ...conversionTags];
  const matchText = [v.layoutPattern, v.visualHierarchy, ...v.componentStructure, ...v.interactionClues, ...allTags, input.primaryPurpose ?? "", ...secondaryPurposes, input.notes ?? ""].join(" ");
  const matchedComponent = matchExistingVariant(sectionType, matchText);
  const customSpec = matchedComponent ? null : buildCustomSpec(sectionType, v);
  const bestFor = [input.websiteType, input.industry, input.primaryPurpose, ...secondaryPurposes, ...allTags].filter(Boolean) as string[];

  return {
    id: uid("pat"),
    name: `${sectionType} pattern — ${input.primaryPurpose ?? styleTags[0] ?? input.websiteType ?? "reference"}`,
    sectionType,
    source: "uploaded-reference",
    referenceImageId: uid("img"),
    referenceImageUrl: input.referenceImageUrl,
    websiteType: input.websiteType,
    industry: input.industry,
    primaryPurpose: input.primaryPurpose,
    secondaryPurposes,
    purposeCategory,
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
    blueprint: v.blueprint,
    detected: v.detected,
    visionDebug: v.debug ? { ...v.debug, userSectionType: input.sectionType, aiSectionType: sectionType, overridden } : undefined,
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
/** Original, purpose-driven starter copy for the created-section preview.
 *  Derived from the reference's section type + purpose — grey placeholders only,
 *  never the uploaded image. Fully editable once added to the canvas. */
function buildPreviewContent(
  pattern: SectionPattern,
  cta: string,
  ctx: { businessName?: string },
): GeneratedSectionSpec["previewContent"] {
  const who = ctx.businessName?.trim() || "your business";
  const type = pattern.sectionType;
  const slotCount = Math.min(6, Math.max(3, pattern.contentSlots.filter(Boolean).length || 3));
  const items = (labels: [string, string][]) =>
    Array.from({ length: slotCount }, (_, i) => labels[i % labels.length]).map(([title, text]) => ({ title, text }));

  switch (type) {
    case "hero":
      return { eyebrow: "Introducing", title: `A clear headline for ${who}`, description: "One or two supporting sentences that explain the value and invite the next step.", primaryButtonLabel: cta, secondaryButtonLabel: "Learn more" };
    case "features":
      return { eyebrow: "Why us", title: "Everything you need, in one place", description: "Group the key benefits into clear, scannable points.", items: items([["Fast setup", "Get started in minutes with a guided flow."], ["Built to scale", "Grows with you from day one."], ["Always supported", "Help whenever you need it."], ["Secure by default", "Your data stays protected."]]) };
    case "services":
      return { eyebrow: "What we do", title: "Services built around your goals", description: "A short line introducing the services below.", items: items([["Consultation", "We map a clear plan forward."], ["Delivery", "Hands-on execution, transparent updates."], ["Support", "Ongoing help so results compound."], ["Strategy", "Align every step to your outcome."]]) };
    case "testimonials":
      return { eyebrow: "Loved by clients", title: "What our clients say", items: items([["Sarah Mitchell", "They delivered exactly what we needed, on time."], ["James Carter", "The whole process was smooth and stress-free."], ["Aisha Khan", "Our results improved within the first months."]]) };
    case "pricing":
      return { eyebrow: "Pricing", title: "Simple, transparent pricing", description: "Pick the plan that fits — change anytime.", primaryButtonLabel: cta };
    case "faq":
      return { eyebrow: "FAQ", title: "Frequently asked questions", items: items([["How does it work?", "A short, reassuring answer goes here."], ["How long does it take?", "Set expectations clearly and simply."], ["Can I change later?", "Yes — everything stays flexible."]]) };
    case "cta":
      return { title: `Ready to get started with ${who}?`, description: "A single, compelling line that drives the primary action.", primaryButtonLabel: cta, secondaryButtonLabel: "Talk to us" };
    case "footer":
      return { title: who, description: "Helpful navigation, contact and legal links — organised into clear columns.", primaryButtonLabel: "Subscribe" };
    case "showcase":
      return { eyebrow: "Our work", title: "Selected projects", description: "Lead with large visual placeholders and minimal chrome." };
    default:
      return { eyebrow: "Section", title: `A ${type} section for ${who}`, description: "Original starter copy — edit everything after adding.", primaryButtonLabel: cta };
  }
}

export function generateSectionFromReferencePattern(
  pattern: SectionPattern,
  ctx: { businessName?: string } = {},
): GeneratedSectionSpec {
  const match = pattern.matchedComponent;
  const needsNewComponent = !match || Boolean(pattern.customSpec?.needsNewComponent);
  // The old matched component must NOT control the created section: type comes
  // from the analysis, the variant is always "custom", and the match survives
  // only as inspiredByComponent (Advanced/debug info).
  const type = pattern.sectionType;
  const inspiredBy = match?.componentName ?? pattern.customSpec?.suggestedComponentName;
  // A reference-created section is always a NEW generated section, rendered by
  // the blueprint renderer — never a reused library component.
  const componentName = "GeneratedSectionRenderer";
  const designVariant = "custom";
  const roles = (pattern.assetRoles.length ? pattern.assetRoles : ["primary visual"]).slice(0, 4);
  const who = ctx.businessName ? ` for ${ctx.businessName}` : "";
  const primary = effectivePurpose(pattern);
  const g = purposeGuidance(primary);
  const secondary = pattern.secondaryPurposes ?? [];

  // Prefer Vision's blueprint (cleaned); else derive one from the analysis.
  // Then enforce the detected UI pattern so it never flattens (e.g. accordion
  // stays an accordion, dark stays dark) — general across all references.
  const blueprint = enforcePattern(
    (pattern.blueprint ? normalizeBlueprint(pattern.blueprint) : null) ?? buildBlueprintFromPattern(pattern, buildPreviewContent(pattern, g.cta, ctx) ?? {}),
    pattern,
  );
  const warnings = validateBlueprintAgainstDetected(blueprint, pattern.detected);

  // Keep the editable content in lockstep with what the blueprint renders —
  // items come from the blueprint's cards/accordion rows (not generic
  // defaults), so the drawer edits exactly what the user sees.
  const preview = buildPreviewContent(pattern, g.cta, ctx) ?? {};
  for (const blk of blueprint.blocks) {
    if (blk.type === "cardGrid") { preview.items = blk.cards.map((c) => ({ title: c.title, text: c.body })); break; }
    if (blk.type === "accordion") { preview.items = blk.items.map((it) => ({ title: it.question, text: it.answer })); break; }
    if (blk.type === "pricing") { preview.items = blk.plans.map((p) => ({ title: p.name, text: (p.features ?? []).join(", ") })); break; }
  }
  for (const blk of blueprint.blocks) {
    if (blk.type === "heading") preview.title = blk.text;
    else if (blk.type === "eyebrow") preview.eyebrow = blk.text;
    else if (blk.type === "paragraph") preview.description = blk.text;
    else if (blk.type === "splitIntro") {
      if (blk.eyebrow) preview.eyebrow = blk.eyebrow;
      if (blk.heading) preview.title = blk.heading;
      if (blk.paragraph) preview.description = blk.paragraph;
      if (blk.buttons?.[0]) preview.primaryButtonLabel = blk.buttons[0].label;
      if (blk.buttons?.[1]) preview.secondaryButtonLabel = blk.buttons[1].label;
    }
  }

  return {
    id: uid("sec"),
    type,
    name: `${pattern.sectionType.charAt(0).toUpperCase() + pattern.sectionType.slice(1)} (reference-inspired)`,
    description: `Original ${pattern.sectionType} section${who} inspired by the "${pattern.name}" pattern — same structure idea, original content, brand tokens.`,
    purpose: primary
      ? `Primary purpose: ${primary}. Focus on ${g.focus}.${secondary.length ? ` Secondary: ${secondary.join(", ")}.` : ""}`
      : pattern.visualHierarchy || `Communicate the ${pattern.sectionType} message with a clear hierarchy and CTA.`,
    layoutPattern: pattern.layoutPattern,
    designVariant,
    componentName,
    inspiredByComponent: inspiredBy,
    blueprint,
    // Re-normalize so stored detections (incl. generic layoutType names from
    // older analyses) get the same safe defaults as fresh Vision output.
    detected: pattern.detected ? normalizeDetected(pattern.detected) : undefined,
    validation: { status: warnings.length ? "warning" : "passed", warnings },
    needsNewComponent,
    content: {
      eyebrowSlot: "Short label",
      headlineSlot: "Write an original, benefit-led headline (do not copy the reference).",
      subheadSlot: "One or two supporting sentences in the brand voice.",
      ctaPrimary: g.cta,
      ctaSecondary: "Secondary CTA",
      slots: pattern.contentSlots,
    },
    previewContent: preview,
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
    assumptions: [
      ...(primary ? [`Purpose "${primary}": ${g.exportNote}`] : []),
      ...(needsNewComponent ? ["No existing component matched — a custom component spec was created for the builder."] : []),
    ],
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
