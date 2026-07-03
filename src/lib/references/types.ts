// Section Reference Library — data model. Users upload section reference images;
// the system extracts a REUSABLE DESIGN PATTERN (layout/hierarchy/spacing/
// components/interaction/typography/color direction) — never the exact image,
// text, logo, or pixel design. Patterns are stored as SECTION_REFERENCE_LIBRARY.json
// and used to generate original, brand-tokenised sections.

export const SECTION_REFERENCE_LIBRARY_FILE = "SECTION_REFERENCE_LIBRARY.json";

export type ReferenceSectionType =
  | "hero" | "features" | "services" | "showcase" | "gallery" | "pricing"
  | "testimonials" | "faq" | "cta" | "footer" | "navbar" | "booking"
  | "contact" | "product" | "dashboard" | "custom";

export const STYLE_TAGS = [
  "premium", "minimal", "bold", "dark", "light", "SaaS", "ecommerce", "editorial",
  "interactive", "conversion-focused", "image-led", "card-based", "motion-heavy",
  "clean corporate", "playful", "luxury",
] as const;

/** What may / may not be reused from a reference — enforced everywhere. */
export interface SimilarityRules {
  canUseLayoutIdea: boolean;
  canUseColorMood: boolean;
  canUseInteractionIdea: boolean;
  doNotCopyText: boolean;
  doNotCopyImages: boolean;
  doNotCopyLogo: boolean;
  doNotCopyExactDesign: boolean;
}

export const DEFAULT_SIMILARITY_RULES: SimilarityRules = {
  canUseLayoutIdea: true,
  canUseColorMood: true,
  canUseInteractionIdea: true,
  doNotCopyText: true,
  doNotCopyImages: true,
  doNotCopyLogo: true,
  doNotCopyExactDesign: true,
};

/** A spec for a component that doesn't exist in the library yet. */
export interface CustomSectionSpec {
  needsNewComponent: boolean;
  suggestedComponentName: string;
  layoutPattern: string;
  propsNeeded: string[];
  interactionNeeded: string[];
  assetRoles: string[];
  implementationNotes: string;
}

/** A reusable, editable design pattern extracted from a reference image. */
export interface SectionPattern {
  id: string;
  name: string;
  sectionType: ReferenceSectionType;
  source: "uploaded-reference" | "saved-from-canvas";
  referenceImageId: string;
  /** Small thumbnail data URL for display only — NOT a final design asset. */
  referenceImageUrl?: string;
  websiteType?: string;
  industry?: string;
  styleTags: string[];
  bestFor: string[];
  notes?: string;
  layoutPattern: string;
  visualHierarchy: string;
  componentStructure: string[];
  typographyDirection: string[];
  colorDirection: string[];
  spacingDirection: string[];
  buttonStyle: string[];
  cardStyle: string[];
  imageTreatment: string[];
  assetRoles: string[];
  interactionPattern: string[];
  responsiveBehavior: string[];
  contentSlots: string[];
  recommendedVariants: string[];
  /** Matched existing library component, if any. */
  matchedComponent?: { type: string; variantId: string; componentName: string } | null;
  customSpec?: CustomSectionSpec | null;
  similarityRules: SimilarityRules;
  confidence: "high" | "medium" | "low";
  warnings: string[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceLibrary {
  patterns: SectionPattern[];
  updatedAt?: string;
}

/** An original section generated FROM a pattern (reference-inspired, not a copy). */
export interface GeneratedSectionSpec {
  id: string;
  type: string;
  name: string;
  description: string;
  purpose: string;
  layoutPattern: string;
  designVariant: string;
  componentName: string;
  needsNewComponent: boolean;
  content: Record<string, unknown>;
  assetPlacement: string;
  assets: {
    source: "placeholder";
    role: string;
    url: string;
    altText: string;
    aiPrompt: string;
    copyrightStatus: "placeholder";
  }[];
  interactionPattern: string[];
  animationNotes: string;
  responsiveNotes: string;
  source: "reference-inspired";
  referencePatternId: string;
  assumptions: string[];
}
