// Export mapping — the ONLY place that turns edited canvas sections into the
// handoff plan shape. UI components never contain export logic. Approved
// Design (SITEMAP_CANVAS) is the source of truth: edited content, item order,
// variants, layout, media and motion all flow through here.

import type { CanvasPage, CanvasSection } from "@/lib/canvas";
import { sectionKind } from "@/lib/sections";
import { sectionTypeForKind, resolveVariantMeta } from "@/components/sections/catalog";
import { normalizeSectionData } from "./normalize-section";

export interface SectionPlan {
  name: string;
  kind: string;
  sectionType: string;
  component: string;
  importPath: string | null;
  designVariant: { id: string; label: string } | null;
  exportNotes: string | null;
  source: string;
  status: string;
  global: boolean;
  styleScheme: string | null;
  content: ReturnType<typeof normalizeSectionData>["content"];
  layout: ReturnType<typeof normalizeSectionData>["layout"];
  motion: ReturnType<typeof normalizeSectionData>["motion"];
  assets: ReturnType<typeof normalizeSectionData>["assets"];
  hiddenParts: string[];
  /** Admin-authored component sections ship their own code — create it verbatim
   *  at build time (it receives {content, theme}) instead of importing a catalog
   *  component. Built-in sections leave these null/false. */
  isCustomComponent: boolean;
  customComponent: { mode: "react" | "html"; code: string } | null;
}

const pascalCase = (s: string) =>
  s.replace(/[^a-zA-Z0-9]+/g, " ").split(" ").filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1)).join("") || "CustomSection";

/** One edited section → its export plan entry (final content + item order). */
export function exportSectionToPlan(s: CanvasSection): SectionPlan {
  const kind = sectionKind(s.name);
  const sectionType = sectionTypeForKind(kind);
  const variant = resolveVariantMeta(sectionType, s.variant);
  const data = normalizeSectionData(s, kind);
  const isCustom = Boolean(s.custom);
  return {
    name: s.name,
    kind,
    sectionType,
    component: isCustom ? pascalCase(s.name) : (variant?.componentName ?? "GenericSection"),
    importPath: isCustom ? null : (variant?.importPath ?? null),
    designVariant: isCustom ? null : (variant ? { id: variant.id, label: variant.label } : null),
    exportNotes: isCustom
      ? "Admin-authored section: create the component from `customComponent.code` verbatim. It is a default-export React component receiving { content, theme }. Pass styleTokens as `theme` and this section's `content`. Do not import from componentDir."
      : (variant?.exportNotes ?? null),
    source: s.source,
    status: s.status ?? "draft",
    global: Boolean(s.global),
    styleScheme: s.scheme ?? null,
    content: data.content,
    layout: data.layout,
    motion: data.motion,
    assets: data.assets,
    hiddenParts: s.hidden ?? [],
    isCustomComponent: isCustom,
    customComponent: s.custom ? { mode: s.custom.mode, code: s.custom.code } : null,
  };
}

export function exportPageToPlan(p: CanvasPage) {
  return {
    name: p.name,
    source: p.source,
    status: p.status ?? "draft",
    pageType: p.pageType ?? null,
    sections: p.sections.map(exportSectionToPlan),
  };
}

export function exportDesignCanvasToPlan(pages: CanvasPage[]) {
  return pages.map(exportPageToPlan);
}
