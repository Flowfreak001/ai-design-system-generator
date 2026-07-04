"use client";

// Media tab — one ImageAssetEditor per media role. Grey placeholders by
// default; no stock/reference/AI images are ever auto-applied.

import type { SectionAsset } from "@/lib/section-editor/types";
import { ImageAssetEditor } from "../section-fields/ImageFields";

export function MediaTab({ assets, sectionName, industry, onCommit }: {
  assets: SectionAsset[];
  sectionName: string;
  industry?: string;
  onCommit: (assets: SectionAsset[]) => void;
}) {
  if (assets.length === 0) {
    return <p className="rounded-lg bg-panel px-3 py-4 text-center text-[12.5px] text-muted">This section has no image slots.</p>;
  }
  return (
    <div className="grid gap-3">
      {assets.map((a, i) => (
        <ImageAssetEditor key={a.id} asset={a} sectionName={sectionName} industry={industry}
          onChange={(next) => onCommit(assets.map((x, j) => (j === i ? next : x)))} />
      ))}
      <p className="text-[11px] leading-relaxed text-faint">
        Images stay grey placeholders until you upload your own. Reference and stock imagery are never used automatically.
      </p>
    </div>
  );
}
