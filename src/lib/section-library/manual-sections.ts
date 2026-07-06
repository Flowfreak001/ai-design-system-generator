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

/** User-facing categories the library can be grouped/filtered by. */
export const SECTION_LIBRARY_CATEGORIES = [
  "site header", "hero", "features", "services", "pricing", "testimonials", "case-studies",
  "logos", "stats", "faq", "contact", "cta", "gallery", "process", "footer",
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

// Blank slate — starter sections were removed so the catalog is built up fresh
// one section at a time via the Section Studio. Keep this array empty.
export const MANUAL_SECTION_LIBRARY: LibrarySection[] = [];

/** Only sections marked `ready` are visible to normal users. */
export function getReadySections(): LibrarySection[] {
  return MANUAL_SECTION_LIBRARY.filter((s) => s.status === "ready");
}

export function getLibrarySection(id: string): LibrarySection | undefined {
  return MANUAL_SECTION_LIBRARY.find((s) => s.id === id);
}
