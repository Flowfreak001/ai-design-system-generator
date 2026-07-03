// Element / Block / Section library — data model. A 3-level, Elementor-inspired
// (workflow idea only, never a UI copy) catalog the Add Elements panel renders:
//   1. atomic  — small building blocks (div, heading, button, image placeholder…)
//   2. block   — reusable content/interactive/form/media blocks
//   3. section — complete ready-made page sections
// Plus `component` (saved reference patterns) and `global` (site-wide) kinds.
//
// IMAGE RULE: every image/media item defaults to a grey placeholder. Nothing here
// pulls stock imagery or copies reference images — items only carry assetRoles +
// aiPrompt guidance for the export/handoff.

export type ElementKind = "atomic" | "block" | "section" | "component" | "global";
export type ElementStatus = "ready" | "coming-soon";

/** Collapsible groups shown in the panel (in display order). */
export type ElementGroup =
  | "Recommended" | "Basic" | "Layout" | "Media" | "Interactive"
  | "Forms" | "Marketing" | "Content" | "Ecommerce" | "Utility" | "Pro / Advanced";

export interface ElementItem {
  id: string;
  name: string;
  kind: ElementKind;
  /** Human category shown under the name (e.g. "Hero", "Trust / Proof"). */
  category: string;
  /** Collapsible group the item lives under in the panel. */
  group: ElementGroup;
  /** For ready section/block items: the section-kind + variant to insert. */
  sectionType?: string;
  variant?: string;
  /** The name passed to the editor's addSection() when inserting. */
  insertName?: string;
  componentName?: string;
  description: string;
  /** Simple icon key rendered by the panel (see ELEMENT_ICONS). */
  icon: string;
  bestFor: string[];
  websiteTypes: string[];
  industries: string[];
  goals: string[];
  styleTags: string[];
  layoutTags: string[];
  interactionTags: string[];
  /** Named image/media slots — all grey placeholders by default. */
  assetRoles: string[];
  defaultProps: Record<string, unknown>;
  exportNotes: string;
  status: ElementStatus;
}

/** Context used to rank Recommended items. */
export interface ElementLibraryContext {
  pageName?: string;
  pageType?: string;
  websiteType?: string;
  industry?: string;
  goals?: string[];
  /** Section kinds already present on the page (to suggest what's missing). */
  presentKinds?: string[];
}

/** Panel tabs. `references` and `ai` are wired to existing features. */
export type ElementTab = "recommended" | "sections" | "blocks" | "atomic" | "components" | "globals" | "ai" | "references";
