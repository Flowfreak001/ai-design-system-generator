"use client";

// Section Settings drawer — tabbed, schema-driven editing for prebuilt
// sections (Content / Layout / Media / Motion / Advanced). Pure composition:
// schemas come from lib/section-editor, persistence goes through onPatch
// (the existing canvas save pipeline). No export logic lives here.

import { useState } from "react";
import type { CanvasSection, CanvasColor } from "@/lib/canvas";
import { getEditSchema } from "@/lib/section-editor/registry";
import { normalizeSectionData } from "@/lib/section-editor/normalize-section";
import type { SectionAsset, SectionContent, SectionLayout, SectionMotion } from "@/lib/section-editor/types";
import { ContentTab } from "./ContentTab";
import { LayoutTab } from "./LayoutTab";
import { MediaTab } from "./MediaTab";
import { MotionTab } from "./MotionTab";
import { AdvancedTab } from "./AdvancedTab";

type TabId = "content" | "layout" | "media" | "motion" | "advanced";
const TABS: { id: TabId; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "layout", label: "Layout" },
  { id: "media", label: "Media" },
  { id: "motion", label: "Motion" },
  { id: "advanced", label: "Advanced" },
];

export function SectionSettingsDrawer({ section, kind, schemes, industry, onPatch, onDuplicate, onDelete, onApplyGlobal }: {
  section: CanvasSection;
  kind: string;
  schemes: CanvasColor[];
  industry?: string;
  onPatch: (patch: Partial<CanvasSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApplyGlobal?: () => void;
}) {
  const [tab, setTab] = useState<TabId>("content");
  const schema = getEditSchema(kind);
  const data = normalizeSectionData(section, kind);

  // Commits — each patches its slice, plus legacy bridges the canvas reads.
  const commitContent = (content: SectionContent) => onPatch({ content });
  const commitLayout = (layout: SectionLayout) =>
    onPatch({ layout, asset: layout.assetPlacement === "left" ? "left" : layout.assetPlacement === "right" ? "right" : section.asset });
  const commitMotion = (motion: SectionMotion) => onPatch({ motion });
  const commitAssets = (assets: SectionAsset[]) =>
    onPatch({ assets, image: assets.find((a) => a.source === "uploaded" && a.url)?.url });

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-line px-3 pb-2 pt-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${tab === t.id ? "bg-accent text-white" : "text-muted hover:bg-panel hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "content" && <ContentTab sectionId={section.id} schema={schema} content={data.content} onCommit={commitContent} />}
        {tab === "layout" && <LayoutTab kind={kind} variant={section.variant} layout={data.layout} onVariant={(variant) => onPatch({ variant })} onCommit={commitLayout} />}
        {tab === "media" && <MediaTab assets={data.assets} sectionName={section.name} industry={industry} onCommit={commitAssets} />}
        {tab === "motion" && <MotionTab schema={schema} motion={data.motion} onCommit={commitMotion} />}
        {tab === "advanced" && (
          <AdvancedTab section={section} kind={kind} schemes={schemes} onPatch={onPatch} onDuplicate={onDuplicate} onDelete={onDelete} onApplyGlobal={onApplyGlobal} />
        )}
      </div>
    </div>
  );
}
