// Section editing system — core types. Schema-driven, controlled editing for
// PREBUILT sections only (no freeform builder). Every prebuilt section is
// editable through the Section Settings drawer using these shapes.
//
// Data lives on CanvasSection (lib/canvas.ts) so save/reload and export reuse
// the existing SITEMAP_CANVAS.json pipeline unchanged.

export type Alignment = "left" | "center" | "right" | "split";
export type Spacing = "compact" | "normal" | "spacious";
export type BackgroundStyle = "default" | "soft" | "dark" | "accent";
export type AssetPlacement = "none" | "left" | "right" | "top" | "background" | "grid" | "card-image";

export type MotionPresetId =
  | "none" | "hover-lift" | "scroll-reveal" | "accordion" | "tabs" | "carousel"
  | "marquee" | "hover-expand" | "sticky-scroll" | "sticky-expanding-media";
export type MotionIntensity = "none" | "subtle" | "medium";

export type AssetSource = "placeholder" | "uploaded" | "asset-library" | "AI-suggested" | "reference-only";
export type CopyrightStatus = "placeholder" | "owned" | "reference-only" | "unknown";

import type { SectionContentItem } from "@/components/sections/types";

/** One repeatable item (service card, FAQ row, pricing plan, footer link…).
 *  Extends the canvas item type so existing inline-canvas editing stays compatible. */
export interface SectionItem extends SectionContentItem {
  href?: string;
}

export interface SectionContent {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  items?: SectionItem[];
}

export interface SectionLayout {
  alignment?: Alignment;
  columns?: 1 | 2 | 3 | 4;
  spacing?: Spacing;
  backgroundStyle?: BackgroundStyle;
  assetPlacement?: AssetPlacement;
}

export interface SectionMotion {
  preset?: MotionPresetId;
  intensity?: MotionIntensity;
}

export interface SectionAsset {
  id: string;
  role: string;
  source: AssetSource;
  url?: string;
  altText?: string;
  notes?: string;
  aiPrompt?: string;
  copyrightStatus: CopyrightStatus;
}

/** The full editable payload stored on a CanvasSection. */
export interface EditableSectionData {
  content: SectionContent;
  layout: SectionLayout;
  motion: SectionMotion;
  assets: SectionAsset[];
}

// ── Edit-schema descriptors (drive the drawer; no per-section hardcoding) ────
export type FieldKind = "text" | "textarea" | "href";

export interface FieldDef {
  /** Key inside SectionContent (eyebrow/title/… — never the items array). */
  key: Exclude<keyof SectionContent, "items"> & string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
}

export interface ItemFieldDef {
  key: string; // key inside SectionItem
  label: string;
  kind: FieldKind;
  placeholder?: string;
}

export interface SectionEditSchema {
  /** sectionKind() values this schema serves. */
  kinds: string[];
  label: string;
  /** Content-tab fields. */
  fields: FieldDef[];
  /** Repeatable items (undefined = section has no item list). */
  items?: { label: string; itemNoun: string; fields: ItemFieldDef[]; defaultItem: SectionItem };
  /** Named media roles the Media tab manages. */
  mediaRoles: string[];
  /** Motion presets that make sense for this kind. */
  motionPresets: MotionPresetId[];
}
