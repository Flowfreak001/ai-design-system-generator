// Responsive export: per-kind desktop/tablet/mobile guidance for prompts.

import type { SectionLayout } from "@/lib/section-editor/types";

export function responsiveSpec(kind: string, layout: SectionLayout) {
  const cols = layout.columns ?? 3;
  const base = {
    desktop: `Full layout as specified (${cols} column${cols > 1 ? "s" : ""}, ${layout.alignment ?? "left"} aligned).`,
    tablet: cols >= 3 ? "Reduce to 2 columns; keep spacing rhythm." : "Same structure, slightly tighter spacing.",
    mobile: "Single column; stack content above media; full-width buttons; min 44px tap targets.",
  };
  const overrides: Record<string, Partial<typeof base>> = {
    navbar: { tablet: "Collapse secondary links.", mobile: "Hamburger menu with slide-down panel; CTA stays visible." },
    hero: { mobile: "Headline first, visual below; primary CTA full-width." },
    footer: { mobile: "Stack columns vertically; keep legal line last." },
    gallery: { mobile: "Single-column or horizontal scroll strip; maintain aspect ratios." },
    form: { mobile: "Full-width fields; labels above inputs; sticky submit if the form is long." },
    booking: { mobile: "Full-width fields; date/time pickers use native inputs." },
  };
  return { ...base, ...(overrides[kind] ?? {}) };
}
