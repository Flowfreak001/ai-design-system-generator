"use client";

// Per-asset media editor: grey placeholder by default; upload / replace /
// remove, alt text, notes, AI image prompt (generate + copy), source/status.
// Never auto-fills stock, reference or AI images.

import { useState } from "react";
import { downscaleImage } from "@/components/sections/blocks/parts";
import type { SectionAsset } from "@/lib/section-editor/types";
import { TextField, TextAreaField, FieldRow } from "./fields";

export function ImageAssetEditor({ asset, sectionName, industry, onChange }: {
  asset: SectionAsset;
  sectionName: string;
  industry?: string;
  onChange: (asset: SectionAsset) => void;
}) {
  const [copied, setCopied] = useState(false);
  const patch = (p: Partial<SectionAsset>) => onChange({ ...asset, ...p });
  const generatePrompt = () => patch({
    source: asset.url ? asset.source : "AI-suggested",
    aiPrompt: `Original ${asset.role} image for the "${sectionName}" section${industry ? ` of a ${industry} website` : ""}. On-brand, clean composition, no logos or third-party content.`,
  });
  const copyPrompt = async () => { if (asset.aiPrompt) { await navigator.clipboard.writeText(asset.aiPrompt); setCopied(true); setTimeout(() => setCopied(false), 1200); } };

  return (
    <div className="grid gap-2.5 rounded-xl border border-line p-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold capitalize text-ink">{asset.role}</span>
        <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">{asset.source}</span>
      </div>

      {/* Preview: uploaded image or grey placeholder */}
      <label className="group relative grid h-28 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-line bg-panel">
        {asset.url
          ? <img src={asset.url} alt={asset.altText ?? ""} className="h-full w-full object-cover" />
          : <span className="text-[11px] font-medium uppercase tracking-wider text-faint">grey placeholder</span>}
        <span className="pointer-events-none absolute inset-0 hidden place-items-center bg-black/35 text-[11.5px] font-semibold text-white group-hover:grid">{asset.url ? "Replace image" : "Upload image"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) patch({ url: await downscaleImage(f), source: "uploaded", copyrightStatus: "owned" }); }} />
      </label>
      {asset.url && (
        <button type="button" onClick={() => patch({ url: undefined, source: "placeholder", copyrightStatus: "placeholder" })} className="justify-self-start text-[12px] font-medium text-faint hover:text-danger">
          Remove image (back to placeholder)
        </button>
      )}

      <TextField label="Alt text" value={asset.altText ?? ""} placeholder="Describe the image for accessibility" onChange={(e) => patch({ altText: e.target.value })} />
      <TextAreaField label="Image notes" rows={2} value={asset.notes ?? ""} placeholder="Art direction notes for this slot" onChange={(e) => patch({ notes: e.target.value })} />

      <FieldRow label="AI image prompt">
        <textarea rows={2} value={asset.aiPrompt ?? ""} placeholder="Generate or write a prompt for this slot" onChange={(e) => patch({ aiPrompt: e.target.value })}
          className="w-full rounded-md bg-panel px-2.5 py-1.5 text-[12.5px] leading-relaxed text-ink outline-none focus:ring-1 focus:ring-accent" />
        <div className="mt-1.5 flex gap-2">
          <button type="button" onClick={generatePrompt} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-medium text-accent hover:bg-accent-soft">Generate prompt</button>
          <button type="button" onClick={copyPrompt} disabled={!asset.aiPrompt} className="rounded-md border border-line px-2.5 py-1 text-[12px] font-medium text-body hover:bg-panel disabled:opacity-40">{copied ? "Copied ✓" : "Copy"}</button>
        </div>
      </FieldRow>
    </div>
  );
}
