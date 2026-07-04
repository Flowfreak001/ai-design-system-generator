// Zod validation for editable section data. Deliberately permissive (all
// optional strings with trims + caps) — the drawer guides input; validation
// guards persistence and export.

import { z } from "zod";

const s = z.string().trim().max(600).optional();
const shortS = z.string().trim().max(200).optional();

export const sectionItemSchema = z.object({
  title: shortS, text: s, href: shortS, icon: shortS, image: z.string().optional(),
}).catchall(z.string().optional());

export const sectionContentSchema = z.object({
  eyebrow: shortS, title: shortS, subtitle: s, description: s,
  primaryButtonLabel: shortS, primaryButtonHref: shortS,
  secondaryButtonLabel: shortS, secondaryButtonHref: shortS,
  items: z.array(sectionItemSchema).max(40).optional(),
});

export const sectionLayoutSchema = z.object({
  alignment: z.enum(["left", "center", "right", "split"]).optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  spacing: z.enum(["compact", "normal", "spacious"]).optional(),
  backgroundStyle: z.enum(["default", "soft", "dark", "accent"]).optional(),
  assetPlacement: z.enum(["none", "left", "right", "top", "background", "grid", "card-image"]).optional(),
});

export const sectionMotionSchema = z.object({
  preset: z.enum(["none", "hover-lift", "scroll-reveal", "accordion", "tabs", "carousel", "marquee", "hover-expand", "sticky-scroll", "sticky-expanding-media"]).optional(),
  intensity: z.enum(["none", "subtle", "medium"]).optional(),
});

export const sectionAssetSchema = z.object({
  id: z.string(),
  role: z.string(),
  source: z.enum(["placeholder", "uploaded", "asset-library", "AI-suggested", "reference-only"]),
  url: z.string().optional(),
  altText: shortS,
  notes: s,
  aiPrompt: s,
  copyrightStatus: z.enum(["placeholder", "owned", "reference-only", "unknown"]),
});

export const editableSectionSchema = z.object({
  content: sectionContentSchema,
  layout: sectionLayoutSchema,
  motion: sectionMotionSchema,
  assets: z.array(sectionAssetSchema).max(12),
});

export type EditableSectionInput = z.input<typeof editableSectionSchema>;
