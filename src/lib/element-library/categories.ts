// Panel taxonomy: group ordering, kind labels/badges, and the simple icon keys
// the Add Elements panel renders. Kept data-only so both client and server import.

import type { ElementGroup, ElementKind } from "./types";

/** Collapsible groups in display order. */
export const ELEMENT_GROUPS: ElementGroup[] = [
  "Recommended", "Basic", "Layout", "Media", "Interactive",
  "Forms", "Marketing", "Content", "Ecommerce", "Utility", "Pro / Advanced",
];

export const KIND_LABEL: Record<ElementKind, string> = {
  atomic: "element",
  block: "block",
  section: "section",
  component: "component",
  global: "global",
};

/** Tailwind classes for each kind's type badge. */
export const KIND_BADGE: Record<ElementKind, string> = {
  atomic: "bg-panel text-muted",
  block: "bg-info-soft text-info",
  section: "bg-accent-soft text-accent",
  component: "bg-success-soft text-success",
  global: "bg-warning-soft text-warning",
};

/** Icon keys used by ELEMENT_ICONS in the panel (kept intentionally small). */
export type IconKey =
  | "div" | "flex" | "grid" | "heading" | "paragraph" | "button" | "image"
  | "icon" | "svg" | "divider" | "spacer" | "badge" | "label" | "video"
  | "youtube" | "lottie" | "code" | "html" | "card" | "cards" | "stats"
  | "logos" | "list" | "accordion" | "tabs" | "carousel" | "marquee"
  | "sticky" | "form" | "gallery" | "quote" | "pricing" | "team" | "mockup"
  | "cta" | "faq" | "compare" | "process" | "footer" | "navbar" | "hero";
