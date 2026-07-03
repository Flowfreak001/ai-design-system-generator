// Search + filter + grouping for the Add Elements panel. Pure functions.

import { ELEMENT_GROUPS } from "./categories";
import { ELEMENT_LIBRARY } from "./registry";
import type { ElementGroup, ElementItem, ElementKind } from "./types";

export interface ElementQuery {
  text?: string;
  kind?: ElementKind | "all";
  group?: ElementGroup | "all";
  readyOnly?: boolean;
}

/** Filter the library by free text + kind/group/status. */
export function searchElements(q: ElementQuery = {}, items: ElementItem[] = ELEMENT_LIBRARY): ElementItem[] {
  const text = (q.text ?? "").trim().toLowerCase();
  return items.filter((e) => {
    if (q.kind && q.kind !== "all" && e.kind !== q.kind) return false;
    if (q.group && q.group !== "all" && e.group !== q.group) return false;
    if (q.readyOnly && e.status !== "ready") return false;
    if (text) {
      const hay = [e.name, e.category, e.group, e.description, ...e.bestFor, ...e.styleTags, ...e.interactionTags].join(" ").toLowerCase();
      if (!hay.includes(text)) return false;
    }
    return true;
  });
}

/** Group items by their `group`, in canonical group order (empty groups dropped). */
export function groupElements(items: ElementItem[]): { group: ElementGroup; items: ElementItem[] }[] {
  return ELEMENT_GROUPS
    .map((group) => ({ group, items: items.filter((e) => e.group === group) }))
    .filter((g) => g.items.length > 0);
}
