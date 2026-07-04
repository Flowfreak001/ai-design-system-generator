"use client";

// Motion tab — controlled presets only (no custom animation code). The preset
// list adapts to the section kind via its edit schema.

import type { SectionEditSchema, SectionMotion, MotionPresetId } from "@/lib/section-editor/types";
import { SegmentField, FieldRow } from "../section-fields/fields";

const PRESET_HINTS: Partial<Record<MotionPresetId, string>> = {
  "none": "No animation.",
  "hover-lift": "Cards lift slightly on hover.",
  "scroll-reveal": "Content fades up as it enters the viewport.",
  "accordion": "Items expand and collapse.",
  "tabs": "Content switches between tabs.",
  "carousel": "Items slide horizontally.",
  "marquee": "Infinite moving strip; pauses on hover.",
  "hover-expand": "Panels expand on hover.",
  "sticky-scroll": "Media pins while content scrolls.",
  "sticky-expanding-media": "Media grows from small to full-bleed on scroll.",
};

export function MotionTab({ schema, motion, onCommit }: {
  schema: SectionEditSchema;
  motion: SectionMotion;
  onCommit: (motion: SectionMotion) => void;
}) {
  const preset = motion.preset ?? "none";
  return (
    <div className="grid gap-3.5">
      <FieldRow label="Motion preset">
        <div className="grid gap-1">
          {schema.motionPresets.map((p) => (
            <button key={p} type="button" onClick={() => onCommit({ ...motion, preset: p })}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${preset === p ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}>
              <span className={`block text-[12.5px] font-medium capitalize ${preset === p ? "text-accent" : "text-ink"}`}>{p.replace(/-/g, " ")}</span>
              {PRESET_HINTS[p] && <span className="block text-[11px] text-faint">{PRESET_HINTS[p]}</span>}
            </button>
          ))}
        </div>
      </FieldRow>
      <SegmentField label="Intensity" value={motion.intensity} options={["none", "subtle", "medium"] as const} onChange={(v) => onCommit({ ...motion, intensity: v })} />
      <p className="text-[11px] text-faint">All motion honours prefers-reduced-motion at export.</p>
    </div>
  );
}
