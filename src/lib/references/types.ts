// Section Reference Library — data model. Users upload section reference images;
// the system extracts a REUSABLE DESIGN PATTERN (layout/hierarchy/spacing/
// components/interaction/typography/color direction) — never the exact image,
// text, logo, or pixel design. Patterns are stored as SECTION_REFERENCE_LIBRARY.json
// and used to generate original, brand-tokenised sections.

export const SECTION_REFERENCE_LIBRARY_FILE = "SECTION_REFERENCE_LIBRARY.json";

export type ReferenceSectionType =
  | "hero" | "navbar" | "features" | "services" | "product" | "gallery"
  | "portfolio" | "pricing" | "testimonials" | "faq" | "cta" | "footer"
  | "contact" | "booking" | "quote" | "blog" | "directory" | "dashboard"
  | "accordion" | "comparison" | "process" | "social-proof"
  // kept for backward compatibility with earlier saved patterns:
  | "showcase" | "custom";

/** Section-type dropdown options (value = stored slug, label = display). */
export const SECTION_TYPE_OPTIONS: { value: ReferenceSectionType; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "navbar", label: "Navbar / Header" },
  { value: "features", label: "Features" },
  { value: "services", label: "Services" },
  { value: "product", label: "Product Showcase" },
  { value: "gallery", label: "Gallery" },
  { value: "portfolio", label: "Portfolio / Case Studies" },
  { value: "pricing", label: "Pricing" },
  { value: "testimonials", label: "Testimonials / Reviews" },
  { value: "faq", label: "FAQ" },
  { value: "cta", label: "CTA" },
  { value: "footer", label: "Footer" },
  { value: "contact", label: "Contact Form" },
  { value: "booking", label: "Booking Form" },
  { value: "quote", label: "Quote Form" },
  { value: "blog", label: "Blog / Content" },
  { value: "directory", label: "Directory / Listings" },
  { value: "dashboard", label: "Dashboard / App Preview" },
  { value: "accordion", label: "Accordion / Tabs" },
  { value: "comparison", label: "Comparison" },
  { value: "process", label: "Process / How It Works" },
  { value: "social-proof", label: "Social Proof" },
  { value: "custom", label: "Custom" },
];

/** Website-type dropdown options (value = stored, "custom" enables free text). */
export const WEBSITE_TYPE_OPTIONS = [
  "SaaS / Software", "AI Tool / Platform", "Agency / Studio", "Local Service Business",
  "Booking Website", "Ecommerce", "Marketplace", "Directory / Listing Platform",
  "Portfolio / Personal Brand", "Healthcare / Clinic", "Education / Course Platform",
  "Real Estate", "Finance / Fintech", "Restaurant / Hospitality",
  "Automotive / Car Rental / Taxi", "Construction / Maintenance", "Nonprofit / Community",
  "Blog / Media", "Dashboard / Client Portal", "Custom",
] as const;

export const INDUSTRY_OPTIONS = [
  "Digital Marketing", "Web Design / Development", "AI / Automation", "Finance / Fintech",
  "Healthcare", "Legal", "Real Estate", "Travel / Hospitality", "Automotive",
  "Car Rental / Parking / Taxi", "Construction", "Home Services", "Education",
  "Ecommerce / Retail", "Fashion / Apparel", "Fitness / Wellness", "Food / Restaurant",
  "Technology", "Professional Services", "Creative / Media", "Other",
] as const;

/** Grouped "Section Purpose" vocabulary — one primary purpose per pattern,
 *  plus optional secondary purposes. Replaces the old flat Pattern Goal list. */
export const PURPOSE_GROUPS: { category: string; options: string[] }[] = [
  {
    category: "Hero / Intro",
    options: [
      "Introduce brand", "Explain main value proposition", "Promote main offer",
      "Drive primary CTA", "Launch announcement", "Product introduction", "Service introduction",
    ],
  },
  {
    category: "Feature / Product",
    options: [
      "Explain key features", "Show product benefits", "Demonstrate product workflow",
      "Highlight use cases", "Compare capabilities", "Explain technical advantage", "Show platform modules",
    ],
  },
  {
    category: "Trust / Proof",
    options: [
      "Build trust", "Show testimonials", "Show client logos", "Show reviews / ratings",
      "Show case study results", "Show certifications / awards", "Show statistics / numbers",
    ],
  },
  {
    category: "Conversion",
    options: [
      "Generate leads", "Get bookings", "Request a quote", "Contact sales",
      "Start free trial", "Buy product", "Subscribe / signup", "Download resource",
    ],
  },
  {
    category: "Education / Content",
    options: [
      "Explain process", "Answer common questions", "Educate visitors", "Explain pricing",
      "Explain service packages", "Explain how it works", "Guide decision making",
    ],
  },
  {
    category: "Visual / Showcase",
    options: [
      "Showcase work", "Showcase product images", "Showcase portfolio", "Show before / after",
      "Show gallery", "Create visual impact", "Present brand story",
    ],
  },
  {
    category: "Navigation / Utility",
    options: [
      "Help users navigate", "Show categories", "Show locations", "Show directory/listings",
      "Filter/search content", "Support account/login flow",
    ],
  },
  {
    category: "Retention / Engagement",
    options: [
      "Encourage next step", "Promote related services", "Keep user exploring",
      "Push newsletter signup", "Promote community/social",
    ],
  },
];

/** Flat list of every purpose option. */
export const PURPOSE_OPTIONS: string[] = PURPOSE_GROUPS.flatMap((g) => g.options);

/** Map a purpose option → its group/category name. */
export const PURPOSE_CATEGORY_OF: Record<string, string> = Object.fromEntries(
  PURPOSE_GROUPS.flatMap((g) => g.options.map((o) => [o, g.category])),
);

/** Best-effort remap of legacy flat Pattern Goal values → new purpose options. */
export const LEGACY_GOAL_TO_PURPOSE: Record<string, string> = {
  "Explain product/service": "Explain key features",
  "Generate leads": "Generate leads",
  "Get bookings": "Get bookings",
  "Showcase work": "Showcase work",
  "Build trust": "Build trust",
  "Compare options": "Compare capabilities",
  "Educate visitors": "Educate visitors",
  "Show process": "Explain process",
  "Show product features": "Explain key features",
  "Improve conversion": "Drive primary CTA",
  "Create visual impact": "Create visual impact",
};

// Grouped, meaningful tag vocabularies. Each group maps to a field on the pattern.
export const VISUAL_STYLE_TAGS = [
  "premium", "minimal", "bold", "dark", "light", "luxury", "playful",
  "editorial", "corporate", "futuristic", "soft", "high-contrast",
] as const;

export const LAYOUT_TAGS = [
  "split-layout", "grid-based", "card-based", "image-led", "text-heavy",
  "full-width", "asymmetric", "centered", "multi-column", "sticky",
] as const;

export const INTERACTION_TAGS = [
  "interactive", "accordion", "tabs", "hover-expand", "scroll-reveal",
  "sticky-scroll", "carousel", "marquee", "motion-heavy", "subtle-motion",
] as const;

export const CONVERSION_TAGS = [
  "conversion-focused", "lead-generation", "booking-focused", "sales-focused",
  "trust-building", "social-proof", "product-education",
] as const;

/** @deprecated Flat legacy tag list. Kept so old saved patterns still parse. */
export const STYLE_TAGS = VISUAL_STYLE_TAGS;


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
  /** What the section is mainly trying to achieve. Replaces legacy `patternGoal`. */
  primaryPurpose?: string;
  secondaryPurposes?: string[];
  purposeCategory?: string;
  /** @deprecated legacy flat goal — read-only for backward compatibility. */
  patternGoal?: string;
  /** Grouped tag vocabularies. `styleTags` == visual style (legacy name kept). */
  styleTags: string[];
  layoutTags: string[];
  interactionTags: string[];
  conversionTags: string[];
  bestFor: string[];
  /** Free-text "what do you like about it" — `notes` kept as legacy alias. */
  userNotes?: string;
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
  /** Structured renderable blueprint from Vision (preferred) — dynamic layout. */
  blueprint?: SectionBlueprint;
  /** Visual-pattern detection (layout type + component detectors). */
  detected?: DetectedPattern;
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

// ─────────────────────────────────────────────────────────────────────────
// Structured, renderable BLUEPRINT — the dynamic layout the generated section
// is rendered from. Produced by Vision (preferred) or derived deterministically
// from the extracted pattern. One generic renderer draws any blueprint, so new
// reference shapes render without adding per-type templates. Media = grey
// placeholders only; copy is original slot text (never the reference's words).
// ─────────────────────────────────────────────────────────────────────────

export type BlueprintBlock =
  | { type: "eyebrow"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "buttons"; items: { label: string; variant?: "primary" | "secondary" }[] }
  | { type: "chips"; items: string[] }
  | { type: "cardGrid"; columns?: number; cards: { title: string; body?: string; icon?: boolean; image?: boolean }[] }
  | { type: "media"; ratio?: string; label?: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "logos"; count?: number }
  | { type: "accordion"; items: { question: string; answer?: string }[] }
  | { type: "linkColumns"; columns: { heading: string; links: string[] }[] }
  // Composition primitives — capture WHERE things sit, not just what exists.
  /** Two-column intro: a heading on one side, paragraph + buttons on the other.
   *  eyebrow renders above the heading; subheading above the paragraph. */
  | { type: "splitIntro"; eyebrow?: string; heading?: string; subheading?: string; paragraph?: string; buttons?: { label: string; variant?: "primary" | "secondary" }[]; headingSide?: "left" | "right" }
  /** Deliberate vertical whitespace between areas. */
  | { type: "spacer"; size?: "small" | "medium" | "large" }
  /** A lead/contact/booking/newsletter form (grey inputs + submit). */
  | { type: "form"; heading?: string; fields?: string[]; submitLabel?: string }
  /** Pricing plan cards. */
  | { type: "pricing"; plans: { name: string; price?: string; features?: string[]; featured?: boolean }[] };

/** Structured visual-pattern detection from Vision — the "what UI pattern is
 *  this" signal, used to drive and validate the blueprint (not content category). */
export interface DetectedPattern {
  layoutType?: string;
  patternFamily?: string;
  shortDescription?: string;
  isDark?: boolean;
  mediaSide?: "left" | "right";
  cardCount?: number;
  hasMedia?: boolean;
  /** Cards are large image tiles (image on top, text below). */
  hasImageCards?: boolean;
  /** Cards are small icon + text cards. */
  hasIconCards?: boolean;
  hasAccordion?: boolean;
  hasForm?: boolean;
  hasPricing?: boolean;
  hasTestimonials?: boolean;
  hasStats?: boolean;
  hasLogos?: boolean;
  hasGallery?: boolean;
  hasSplitIntro?: boolean;
  mustNotFlattenInto?: string[];
}

export interface SectionBlueprint {
  /** Background colour direction (hex) from the reference; grey placeholders for media. */
  background?: string;
  /** Accent colour (hex) for buttons/icons. */
  accent?: string;
  /** Text colour (hex). */
  textColor?: string;
  align?: "left" | "center";
  /** stack = single column; split = text column + media column. */
  layout?: "stack" | "split";
  mediaSide?: "left" | "right";
  /** Ordered blocks that make up the section (the text column when split). */
  blocks: BlueprintBlock[];
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
  /** Library component this generated section was inspired by (never reused). */
  inspiredByComponent?: string;
  /** Structured layout the section is rendered from (dynamic; drives the canvas). */
  blueprint?: SectionBlueprint;
  /** Visual-pattern detection surfaced in the result panel. */
  detected?: DetectedPattern;
  /** Result of checking the final blueprint against the detected pattern.
   *  Sections with warnings should be saved as drafts, not marked Ready. */
  validation?: { status: "passed" | "warning"; warnings: string[] };
  needsNewComponent: boolean;
  content: Record<string, unknown>;
  /** Original starter copy for the created section preview — grey placeholders
   *  only, never the uploaded reference. Editable after adding. */
  previewContent?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;
    items?: { title?: string; text?: string }[];
  };
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
