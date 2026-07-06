// Shared types for the Section Component Variation Library. These power the
// Real Design Preview, DESIGN_CANVAS.json, REACT_EXPORT_PLAN.json and the MD /
// prompt exports. Section components are theme-driven and content-editable.

import type { ComponentType } from "react";

export type SectionType =
  | "navbar"
  | "hero"
  | "services"
  | "features"
  | "social-proof"
  | "workflow"
  | "showcase"
  | "use-cases"
  | "comparison"
  | "integrations"
  | "scroll-media"
  | "booking-form"
  | "contact-form"
  | "quote-form"
  | "pricing"
  | "testimonials"
  | "faq"
  | "cta"
  | "footer"
  | "gallery"
  | "portfolio"
  | "blog"
  | "directory"
  | "dashboard"
  | "block";

export type ButtonStyle = "rounded" | "pill" | "sharp" | "soft";
export type AnimationStyle = "smooth" | "spring" | "subtle" | "none";

/** Full themeable token set every section consumes. Nothing in a section should
 *  be a hardcoded colour or font — read these values so a brand's Style Guide can
 *  restyle every component from the UI (colours, fonts, radius, spacing, motion). */
export interface SectionTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  /** Button surface + label — editable independently of the accent. */
  buttonBgColor: string;
  buttonTextColor: string;
  radius: string;
  shadow: string;
  spacing: string;
  headingFont: string;
  bodyFont: string;
  buttonStyle: ButtonStyle;
  /** Motion preset sections use to shape their entrance animations. */
  animationStyle: AnimationStyle;
}

/** Generic list item — components read the fields they need and ignore the rest. */
export interface SectionItem {
  title?: string;
  description?: string;
  label?: string;
  value?: string;
  icon?: string;
  image?: string;
  price?: string;
  period?: string;
  featured?: boolean;
  author?: string;
  role?: string;
  quote?: string;
  rating?: number;
  question?: string;
  answer?: string;
  href?: string;
  tag?: string;
  [key: string]: unknown;
}

export interface SectionField {
  label: string;
  type?: string;
  placeholder?: string;
  options?: string[];
}

export interface SectionProps {
  id?: string;
  type?: SectionType;
  variant?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  imageUrl?: string;
  items?: SectionItem[];
  fields?: SectionField[];
  source?: string;
  status?: "draft" | "approved" | "rejected";
  global?: boolean;
  theme?: SectionTheme;
  /** Editor-only render hints. */
  mobile?: boolean;
  assetSide?: "left" | "right";
  /** Canvas-editable parts to hide (e.g. "icon", "eyebrow", "button"). */
  hidden?: string[];
  /** When set, primary text slots render inline-editable on the canvas. */
  onEditText?: (field: "title" | "description", value: string) => void;
  /** Chosen icon key for the icon slot; onEditIcon shuffles/sets it on canvas. */
  iconKey?: string;
  onEditIcon?: (iconKey: string) => void;
  /** onEditImage sets/clears the image slot (data URL) from the canvas. */
  onEditImage?: (dataUrl: string) => void;
  /** Per-section editable repeated items + a single commit for add/edit/remove. */
  contentItems?: SectionContentItem[];
  onEditItems?: (items: SectionContentItem[]) => void;
  /** Real page links for navbar/footer in live preview (drives page nav). */
  navLinks?: NavLink[];
}

/** A real navigation link rendered in the site header/footer during preview. */
export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

/** An individually-editable repeated item (card/step/list row) within a section. */
export interface SectionContentItem {
  title?: string;
  text?: string;
  icon?: string;
  image?: string;
}

export type SectionComponent = ComponentType<SectionProps>;

/** Pure, server-safe metadata for a variant (no component reference). */
export interface VariantMeta {
  id: string;
  label: string;
  componentName: string;
  importPath: string;
  bestFor: string[];
  exportNotes?: string;
  /** Whether this variant is a split layout that supports asset left/right swap. */
  supportsAssetSwap?: boolean;
}

/** Registry item — metadata plus the actual React component. */
export interface SectionVariant extends VariantMeta {
  component: SectionComponent;
}

export interface SectionCatalogEntry {
  label: string;
  variants: VariantMeta[];
}
