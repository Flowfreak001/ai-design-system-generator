"use client";

// Advanced tab — name/type/source/status, global toggle, visible elements,
// style scheme, notes, duplicate + delete.

import type { CanvasSection, CanvasColor } from "@/lib/canvas";
import { EDITABLE_PARTS } from "@/components/sections/blocks/parts";
import { TextField, TextAreaField, SegmentField, SwitchField, SelectField, FieldRow } from "../section-fields/fields";

export function AdvancedTab({ section, kind, schemes, onPatch, onDuplicate, onDelete, onApplyGlobal }: {
  section: CanvasSection;
  kind: string;
  schemes: CanvasColor[];
  onPatch: (patch: Partial<CanvasSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApplyGlobal?: () => void;
}) {
  const status = section.status ?? "draft";
  return (
    <div className="grid gap-3.5">
      <TextField label="Section name" value={section.name} onChange={(e) => onPatch({ name: e.target.value })} />
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium uppercase tracking-wide text-faint">Type</span>
        <span className="rounded-full bg-panel px-2 py-0.5 font-medium capitalize text-body">{kind}</span>
      </div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium uppercase tracking-wide text-faint">Source</span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">{section.source}</span>
      </div>
      <SegmentField label="Status" value={status} options={["draft", "approved", "rejected"] as const} onChange={(v) => onPatch({ status: v })} />
      <SwitchField label="Global section" hint="Reused across pages (navbar, footer…)" checked={Boolean(section.global)} onChange={(v) => onPatch({ global: v })} />
      {section.global && onApplyGlobal && (
        <button type="button" onClick={onApplyGlobal} className="rounded-lg border border-dashed border-accent px-3 py-2 text-[12px] font-medium text-accent hover:bg-accent-soft">Apply to all pages</button>
      )}
      {kind === "block" && (
        <FieldRow label="Visible elements">
          <div className="grid gap-1">
            {EDITABLE_PARTS.map((part) => {
              const shown = !(section.hidden ?? []).includes(part.key);
              return (
                <button key={part.key} type="button"
                  onClick={() => { const cur = section.hidden ?? []; onPatch({ hidden: shown ? [...cur, part.key] : cur.filter((k) => k !== part.key) }); }}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[12.5px] hover:border-line-strong">
                  <span className={shown ? "text-body" : "text-faint line-through"}>{part.label}</span>
                  <span className={`text-[11px] font-medium ${shown ? "text-accent" : "text-faint"}`}>{shown ? "Visible" : "Hidden"}</span>
                </button>
              );
            })}
          </div>
        </FieldRow>
      )}
      {schemes.length > 0 && (
        <SelectField label="Style scheme" value={section.scheme ?? "brand default"}
          options={["brand default", ...schemes.map((s) => s.name)]}
          onChange={(v) => onPatch({ scheme: v === "brand default" ? undefined : v })} />
      )}
      <TextAreaField label="Notes" rows={3} value={section.note ?? ""} placeholder="Internal notes for this section" onChange={(e) => onPatch({ note: e.target.value })} />
      <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
        <button type="button" onClick={onDuplicate} className="text-[13px] font-medium text-body hover:text-ink">Duplicate</button>
        <button type="button" onClick={onDelete} className="text-[13px] font-medium text-danger hover:underline">Delete</button>
      </div>
    </div>
  );
}
