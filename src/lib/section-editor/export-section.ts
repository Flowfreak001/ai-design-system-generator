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
}

/** One edited section → its export plan entry (final content + item order). */
export function exportSectionToPlan(s: CanvasSection): SectionPlan {
  const kind = sectionKind(s.name);
  const sectionType = sectionTypeForKind(kind);
  const variant = resolveVariantMeta(sectionType, s.variant);
  const data = normalizeSectionData(s, kind);
  return {
    name: s.name,
    kind,
    sectionType,
    component: variant?.componentName ?? "GenericSection",
    importPath: variant?.importPath ?? null,
    designVariant: variant ? { id: variant.id, label: variant.label } : null,
    exportNotes: variant?.exportNotes ?? null,
    source: s.source,
    status: s.status ?? "draft",
    global: Boolean(s.global),
    styleScheme: s.scheme ?? null,
    content: data.content,
    layout: data.layout,
    motion: data.motion,
    assets: data.assets,
    hiddenParts: s.hidden ?? [],
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
