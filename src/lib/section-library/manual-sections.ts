// Manual Section Library (Phase 1 — controlled, no user-facing AI).
//
// Users browse these ready-made section designs and click "Add Section". Each
// entry is hand-curated and maps to a real, registered, theme-driven section
// component (components/sections/*) resolved through the catalog — so preview
// and the live editor render the exact same component. NOTHING here is produced
// by AI at runtime; AI-assisted section creation is admin-only and must be
// promoted through review before it can appear as a `ready` section (see the
// safety rule in section-library/README notes / the references admin panel).

import type { SectionKind } from "@/lib/sections";
import type { SectionType } from "@/components/sections/types";
import { resolveVariantMeta } from "@/components/sections/catalog";

/** User-facing categories the library can be grouped/filtered by. */
export const SECTION_LIBRARY_CATEGORIES = [
  "hero", "features", "services", "pricing", "testimonials", "case-studies",
  "logos", "stats", "faq", "contact", "cta", "gallery", "process",
  "comparison", "dashboard", "ecommerce", "custom",
] as const;

export type SectionLibraryCategory = (typeof SECTION_LIBRARY_CATEGORIES)[number];

export type SectionLibraryStatus = "draft" | "ready" | "archived";

/** A single editable content item inside a section (card/feature/faq/logo…). */
export interface LibraryContentItem {
  title?: string;
  text?: string;
  href?: string;
  icon?: string;
}

/** Default, editable placeholder content a section starts with. */
export interface LibraryDefaultContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  items?: LibraryContentItem[];
}

/** A curated, ready-to-add section definition. */
export interface LibrarySection {
  id: string;
  name: string;
  category: SectionLibraryCategory;
  layoutType: string;
  description: string;
  tags: string[];
  /** Resolved React component name (for export/debug/admin display). */
  componentName: string;
  /** How the preview is produced. Only "component" is supported today. */
  previewType: "component";
  editable: boolean;
  responsive: boolean;
  status: SectionLibraryStatus;
  defaultContent: LibraryDefaultContent;
  /** Content fields the user can edit once the section is on a page. */
  editableFields: string[];
  createdAt: string;
  updatedAt: string;

  // ── Rendering wiring (internal) ─────────────────────────────────────────
  /** Editor section-kind (drives sectionKind() inference on the canvas). */
  kind: SectionKind;
  /** Catalog SectionType used to render + resolve the component. */
  sectionType: SectionType;
  /** Catalog variant id. */
  variant: string;
  /** Kind-safe name written onto the CanvasSection so the editor infers the
   *  correct kind via sectionKind(). The display `name` is separate. */
  canvasName: string;

  // ── Component-based (admin-authored) sections ───────────────────────────
  /** Author's React/TSX (or HTML) source. When set, the section renders via
   *  the dynamic component engine instead of the catalog registry. */
  componentCode?: string;
  codeMode?: "react" | "html";
  /** Where the section came from — shipped built-in vs the editable catalog. */
  origin?: "builtin" | "catalog";
  /** admin | user | built-in — drives permission-aware card actions. */
  sourceType?: string;
  /** Creator (catalog items only) for ownership checks. */
  createdByUserId?: string | null;
}

const T0 = "2026-07-01T00:00:00.000Z";

// Small builder that resolves componentName from the catalog and fills the
// repetitive boilerplate fields with sensible, consistent defaults.
function make(s: {
  id: string; name: string; category: SectionLibraryCategory; layoutType: string;
  description: string; tags: string[];
  kind: SectionKind; sectionType: SectionType; variant: string; canvasName: string;
  defaultContent: LibraryDefaultContent; editableFields: string[];
  status?: SectionLibraryStatus;
}): LibrarySection {
  return {
    previewType: "component",
    editable: true,
    responsive: true,
    status: s.status ?? "ready",
    createdAt: T0,
    updatedAt: T0,
    origin: "builtin",
    sourceType: "built-in",
    componentName: resolveVariantMeta(s.sectionType, s.variant)?.componentName ?? "GenericSection",
    ...s,
  };
}

const CARDS = (labels: [string, string][]): LibraryContentItem[] =>
  labels.map(([title, text]) => ({ title, text }));

export const MANUAL_SECTION_LIBRARY: LibrarySection[] = [
  make({
    id: "sec-hero-centered", name: "Centered Hero", category: "hero",
    layoutType: "centered-hero", description: "Big centered headline, subtext and two CTAs — the classic conversion hero.",
    tags: ["hero", "centered", "cta", "landing"],
    kind: "hero", sectionType: "hero", variant: "centered", canvasName: "Centered Hero",
    editableFields: ["eyebrow", "title", "description", "primaryButtonLabel", "secondaryButtonLabel"],
    defaultContent: {
      eyebrow: "Introducing",
      title: "Build beautiful websites, faster",
      description: "A clean, centered hero that puts your message and primary action front and center.",
      primaryButtonLabel: "Get started",
      secondaryButtonLabel: "Learn more",
    },
  }),
  make({
    id: "sec-hero-split", name: "Split Hero", category: "hero",
    layoutType: "split-hero", description: "Two-column hero — copy on one side, a visual placeholder on the other.",
    tags: ["hero", "split", "two-column", "image"],
    kind: "hero", sectionType: "hero", variant: "split", canvasName: "Split Hero",
    editableFields: ["eyebrow", "title", "description", "primaryButtonLabel", "secondaryButtonLabel"],
    defaultContent: {
      eyebrow: "Your product",
      title: "A headline that sits beside your visual",
      description: "Pair a strong message with a product shot, illustration or photo placeholder.",
      primaryButtonLabel: "Start free",
      secondaryButtonLabel: "Book a demo",
    },
  }),
  make({
    id: "sec-hero-dashboard", name: "Hero with Dashboard Mockup", category: "hero",
    layoutType: "product-hero-mockup", description: "SaaS hero with headline, CTAs and a product/dashboard mockup placeholder.",
    tags: ["hero", "saas", "dashboard", "mockup", "product"],
    kind: "hero", sectionType: "hero", variant: "saas", canvasName: "Hero",
    editableFields: ["eyebrow", "title", "description", "primaryButtonLabel", "secondaryButtonLabel"],
    defaultContent: {
      eyebrow: "The all-in-one platform",
      title: "Everything your team needs, in one place",
      description: "A product hero with a dashboard mockup to show the app in action above the fold.",
      primaryButtonLabel: "Try it free",
      secondaryButtonLabel: "See how it works",
    },
  }),
  make({
    id: "sec-features-grid", name: "Simple Feature Grid", category: "features",
    layoutType: "feature-grid", description: "A responsive grid of features, each with an icon, title and short description.",
    tags: ["features", "grid", "icons", "benefits"],
    kind: "features", sectionType: "features", variant: "grid", canvasName: "Feature Grid",
    editableFields: ["eyebrow", "title", "description", "items"],
    defaultContent: {
      eyebrow: "Features",
      title: "Everything you need to ship",
      description: "A simple, scannable grid of your core capabilities.",
      items: CARDS([
        ["Fast by default", "Built for speed so your pages load instantly."],
        ["Fully responsive", "Looks great on phones, tablets and desktops."],
        ["Easy to edit", "Change any text or image in the editor, no code."],
        ["Brand-aware", "Uses your colors, fonts and spacing automatically."],
        ["Accessible", "Sensible contrast and semantics out of the box."],
        ["Export-ready", "Generate clean prompts once the design is approved."],
      ]),
    },
  }),
  make({
    id: "sec-features-media-row", name: "Media Card Feature Row", category: "features",
    layoutType: "media-card-row", description: "A row of image cards — each pairs a visual with a title and supporting copy.",
    tags: ["features", "media", "cards", "image", "row"],
    kind: "services", sectionType: "services", variant: "image-cards", canvasName: "Services",
    editableFields: ["eyebrow", "title", "description", "items"],
    defaultContent: {
      eyebrow: "How it helps",
      title: "Show, don't just tell",
      description: "Media cards that pair a visual with a concise benefit.",
      items: CARDS([
        ["Plan visually", "Lay out pages and sections on a live canvas."],
        ["Edit in place", "Tweak copy and imagery until it feels right."],
        ["Ship confidently", "Export only once the design is approved."],
      ]),
    },
  }),
  make({
    id: "sec-services-grid", name: "Services Grid", category: "services",
    layoutType: "services-grid-6", description: "A six-up services grid — ideal for agencies and local businesses.",
    tags: ["services", "grid", "agency", "offerings"],
    kind: "services", sectionType: "services", variant: "grid-6", canvasName: "Services Grid",
    editableFields: ["eyebrow", "title", "description", "items"],
    defaultContent: {
      eyebrow: "What we do",
      title: "Services built around your goals",
      description: "A flexible grid to present everything you offer.",
      items: CARDS([
        ["Strategy", "Positioning and planning that sets direction."],
        ["Design", "Interfaces and brand systems that convert."],
        ["Development", "Fast, reliable builds on a modern stack."],
        ["Content", "Words and assets that carry your message."],
        ["SEO", "Foundations that help the right people find you."],
        ["Support", "Ongoing care so things keep running smoothly."],
      ]),
    },
  }),
  make({
    id: "sec-cta-banner", name: "CTA Banner", category: "cta",
    layoutType: "cta-banner", description: "A full-width call-to-action band to drive the next step.",
    tags: ["cta", "banner", "conversion", "signup"],
    kind: "cta", sectionType: "cta", variant: "banner", canvasName: "Final CTA",
    editableFields: ["title", "description", "primaryButtonLabel", "secondaryButtonLabel"],
    defaultContent: {
      title: "Ready to get started?",
      description: "Join thousands of teams building faster with our platform.",
      primaryButtonLabel: "Get started free",
      secondaryButtonLabel: "Talk to sales",
    },
  }),
  make({
    id: "sec-faq-accordion", name: "FAQ Accordion", category: "faq",
    layoutType: "faq-accordion", description: "An expandable list of common questions and answers.",
    tags: ["faq", "accordion", "questions", "support"],
    kind: "faq", sectionType: "faq", variant: "accordion", canvasName: "FAQ",
    editableFields: ["eyebrow", "title", "description", "items"],
    defaultContent: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      description: "Everything you might want to know before getting started.",
      items: CARDS([
        ["How does it work?", "Browse the section library, add sections to a page, then edit the content."],
        ["Can I edit everything?", "Yes — every heading, paragraph and image is editable in the editor."],
        ["Is it responsive?", "All sections adapt to desktop, tablet and mobile out of the box."],
        ["Do I need to code?", "No. You compose and edit visually; export comes later."],
      ]),
    },
  }),
  make({
    id: "sec-contact-form", name: "Contact Form", category: "contact",
    layoutType: "contact-form", description: "A clean contact form with intro copy for enquiries.",
    tags: ["contact", "form", "enquiry", "lead"],
    kind: "form", sectionType: "contact-form", variant: "default", canvasName: "Contact Form",
    editableFields: ["eyebrow", "title", "description"],
    defaultContent: {
      eyebrow: "Get in touch",
      title: "Let's talk about your project",
      description: "Tell us what you need and we'll get back to you within one business day.",
      primaryButtonLabel: "Send message",
    },
  }),
  make({
    id: "sec-logo-cloud", name: "Logo Cloud", category: "logos",
    layoutType: "logo-cloud", description: "A trust strip of client or partner logo placeholders.",
    tags: ["logos", "social-proof", "trust", "clients"],
    kind: "socialproof", sectionType: "social-proof", variant: "logo-cloud", canvasName: "Logo Cloud",
    editableFields: ["eyebrow", "title"],
    defaultContent: {
      eyebrow: "Trusted by teams everywhere",
      title: "Companies that build with us",
      items: CARDS([
        ["Acme", ""], ["Globex", ""], ["Northwind", ""],
        ["Umbrella", ""], ["Initech", ""], ["Soylent", ""],
      ]),
    },
  }),
];

/** Only sections marked `ready` are visible to normal users. */
export function getReadySections(): LibrarySection[] {
  return MANUAL_SECTION_LIBRARY.filter((s) => s.status === "ready");
}

export function getLibrarySection(id: string): LibrarySection | undefined {
  return MANUAL_SECTION_LIBRARY.find((s) => s.id === id);
}
