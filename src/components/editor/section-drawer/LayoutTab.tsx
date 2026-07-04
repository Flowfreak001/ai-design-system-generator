"use client";

// Layout tab — design variant + controlled layout options. Changing the
// variant only patches `variant`; user content is never reset.

import { getSectionVariants, sectionTypeForKind } from "@/components/sections/registry";
import type { SectionLayout } from "@/lib/section-editor/types";
import { SegmentField, SelectField, FieldRow } from "../section-fields/fields";

export function LayoutTab({ kind, variant, layout, onVariant, onCommit }: {
  kind: string;
  variant?: string;
  layout: SectionLayout;
  onVariant: (id: string) => void;
  onCommit: (layout: SectionLayout) => void;
}) {
  const variants = getSectionVariants(sectionTypeForKind(kind));
  const activeId = variant ?? variants[0]?.id;
  const set = <K extends keyof SectionLayout>(key: K, value: SectionLayout[K]) => onCommit({ ...layout, [key]: value });

  return (
    <div className="grid gap-3.5">
      {variants.length > 1 && (
        <FieldRow label="Design variant">
          <div className="grid grid-cols-2 gap-1.5">
            {variants.map((v) => (
              <button key={v.id} type="button" onClick={() => onVariant(v.id)}
                className={`rounded-lg border px-2.5 py-2 text-left text-[12px] font-medium transition-colors ${activeId === v.id ? "border-accent bg-accent-soft/40 text-accent" : "border-line text-body hover:border-line-strong"}`}>
                {v.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-faint">Switching variants keeps your content.</p>
        </FieldRow>
      )}
      <SegmentField label="Alignment" value={layout.alignment} options={["left", "center", "right", "split"] as const} onChange={(v) => set("alignment", v)} />
      <SegmentField label="Columns" value={layout.columns} options={[1, 2, 3, 4] as const} onChange={(v) => set("columns", v)} />
      <SegmentField label="Spacing" value={layout.spacing} options={["compact", "normal", "spacious"] as const} onChange={(v) => set("spacing", v)} />
      <SegmentField label="Background" value={layout.backgroundStyle} options={["default", "soft", "dark", "accent"] as const} onChange={(v) => set("backgroundStyle", v)} />
      <SelectField label="Asset placement" value={layout.assetPlacement} options={["none", "left", "right", "top", "background", "grid", "card-image"] as const} onChange={(v) => set("assetPlacement", v)} />
    </div>
  );
}
