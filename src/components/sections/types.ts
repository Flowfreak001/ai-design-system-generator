// Shared types for the Section Component Variation Library. These power the
// Real Design Preview, DESIGN_CANVAS.json, REACT_EXPORT_PLAN.json and the MD /
// prompt exports. Section components are theme-driven and content-editable.

import type { ComponentType } from "react";

export type SectionType =
  | "navbar"
  | "hero"
  | "services"
  | "features"
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
  | "dashboard";

export type ButtonStyle = "rounded" | "pill" | "sharp" | "soft";

export interface SectionTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  radius: string;
  shadow: string;
  spacing: string;
  headingFont?: string;
  bodyFont?: string;
  buttonStyle?: ButtonStyle;
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
