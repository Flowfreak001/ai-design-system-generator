// Safe defaults for editable section data. Used by normalizeSectionData() so
// older sections (or freshly added ones) load without missing fields.

import type { SectionContent, SectionLayout, SectionMotion } from "./types";

export const DEFAULT_LAYOUT: SectionLayout = {
  alignment: "left",
  columns: 3,
  spacing: "normal",
  backgroundStyle: "default",
  assetPlacement: "right",
};

export const DEFAULT_MOTION: SectionMotion = { preset: "none", intensity: "subtle" };

export const DEFAULT_CONTENT: SectionContent = {};

/** Per-kind motion defaults for kinds that are inherently motion-driven. */
export const KIND_MOTION_DEFAULT: Record<string, SectionMotion> = {
  scrollmedia: { preset: "sticky-expanding-media", intensity: "medium" },
  faq: { preset: "accordion", intensity: "subtle" },
};
