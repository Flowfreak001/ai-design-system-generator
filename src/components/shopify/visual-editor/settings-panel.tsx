"use client";

// Right settings panel — schema-driven Content controls + a Style tab (colour
// scheme + padding) for the selected section. Reuses the shared section-controls.

import { useState } from "react";
import { getSection, type ColorScheme, type ShopifySectionInstance } from "@/modules/shopify";
import { SettingInput, BlockEditor, Field, inputCls } from "@/components/shopify/section-controls";

type Settings = Record<string, string | number | boolean>;
type Tab = "content" | "style" | "responsive";

export function SettingsPanel({ inst, schemes, locked, onPatch }: {
  inst: ShopifySectionInstance | null;
  schemes: ColorScheme[];
  locked: boolean;
  onPatch: (settings: Settings, blocks?: ShopifySectionInstance["blocks"]) => void;
}) {
  const [tab, setTab] = useState<Tab>("content");

  if (!inst) {
    return <div className="flex h-full items-center justify-center px-6 text-center text-[13px] text-muted">Select a section on the canvas to edit its content and style.</div>;
  }
  const def = getSection(inst.sectionId);
  if (!def) return <div className="p-4 text-[13px] text-muted">Unknown section.</div>;
  const settings = (inst.settings ?? {}) as Settings;
  const setField = (id: string, value: string | number | boolean) => onPatch({ ...settings, [id]: value });

  const contentFields = def.schema.settings.filter((f) => f.id && f.id !== "variant" && !["image_picker", "product", "collection", "color_scheme", "video_url"].includes(f.type));
  const currentVariant = String(settings.variant ?? def.defaultSettings.variant ?? def.variants?.[0]?.id ?? "");
  const hasScheme = def.schema.settings.some((f) => f.type === "color_scheme");
  const hasPadding = def.schema.settings.some((f) => f.id === "padding_top" || f.id === "padding_bottom");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-3">
        <div className="text-[14px] font-semibold text-ink">{def.name}</div>
        <div className="text-[11.5px] text-muted">{locked ? "Core section · locked" : def.category}</div>
      </div>
      <div className="flex gap-1 border-b border-line px-3 py-2">
        {(["content", "style", "responsive"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-2.5 py-1 text-[12px] font-medium capitalize ${tab === t ? "bg-panel text-ink" : "text-muted hover:text-body"}`}>{t}</button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {locked && (
          <div className="rounded-md border border-dashed border-line bg-panel/40 p-4 text-[12.5px] text-muted">
            This is the template’s core section (it renders the {def.name.toLowerCase()} automatically from Shopify data). It can’t be removed or reordered. Add content sections around it from the left panel.
          </div>
        )}
        {!locked && tab === "content" && (
          <>
            {def.variants && def.variants.length > 1 && (
              <div className="rounded-lg border border-line bg-panel/40 p-2.5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Design</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {def.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setField("variant", v.id)}
                      className={`rounded-md border px-2.5 py-2 text-left text-[12.5px] font-medium transition-colors ${currentVariant === v.id ? "border-accent bg-accent-soft/50 text-ink" : "border-line bg-white text-body hover:border-accent/50"}`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {contentFields.length === 0 && !def.schema.blocks && <p className="text-[12.5px] text-muted">This section has no editable content settings.</p>}
            {contentFields.map((f) => <SettingInput key={f.id} field={f} value={settings[f.id!]} onChange={(v) => setField(f.id!, v)} />)}
            {def.schema.blocks && <BlockEditor inst={inst} def={def} onChange={(blocks) => onPatch(settings, blocks)} />}
          </>
        )}

        {!locked && tab === "style" && (
          <>
            {hasScheme && (
              <Field label="Colour scheme">
                <select value={String(settings.color_scheme ?? "scheme-1")} onChange={(e) => setField("color_scheme", e.target.value)} className={inputCls}>
                  {schemes.map((sc) => <option key={sc.id} value={sc.id}>{sc.id.replace("scheme-", "Scheme ")}</option>)}
                </select>
              </Field>
            )}
            {hasPadding ? (
              <>
                <Field label={`Top padding: ${Number(settings.padding_top ?? 56)}px`}><input type="range" min={0} max={120} step={4} value={Number(settings.padding_top ?? 56)} onChange={(e) => setField("padding_top", Number(e.target.value))} className="w-full" /></Field>
                <Field label={`Bottom padding: ${Number(settings.padding_bottom ?? 56)}px`}><input type="range" min={0} max={120} step={4} value={Number(settings.padding_bottom ?? 56)} onChange={(e) => setField("padding_bottom", Number(e.target.value))} className="w-full" /></Field>
              </>
            ) : (
              <p className="text-[12.5px] text-muted">Padding and colour scheme apply to sections built on the new layout system. This section uses the store’s global styles.</p>
            )}
            {!hasScheme && !hasPadding && null}
          </>
        )}

        {!locked && tab === "responsive" && (
          <div className="rounded-md border border-dashed border-line bg-panel/40 p-4 text-[12.5px] text-muted">
            Per-device responsive overrides (columns, alignment, visibility) are coming in the next phase. The generated theme is already mobile-first and responsive by default.
          </div>
        )}
      </div>
    </div>
  );
}
