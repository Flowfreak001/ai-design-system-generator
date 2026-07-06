"use client";

// Section Settings drawer — tabbed, schema-driven editing for prebuilt
// sections (Content / Layout / Media / Motion / Advanced). Pure composition:
// schemas come from lib/section-editor, persistence goes through onPatch
// (the existing canvas save pipeline). No export logic lives here.

import { useState } from "react";
import type { CanvasSection, CanvasColor } from "@/lib/canvas";
import { getEditSchema, schemaForEditableFields } from "@/lib/section-editor/registry";
import { normalizeSectionData } from "@/lib/section-editor/normalize-section";
import type { SectionAsset, SectionContent, SectionLayout, SectionMotion } from "@/lib/section-editor/types";
import { ContentTab } from "./ContentTab";
import { LayoutTab } from "./LayoutTab";
import { MediaTab } from "./MediaTab";
import { MotionTab } from "./MotionTab";
import { AdvancedTab } from "./AdvancedTab";
import { StyleTab } from "./StyleTab";

type TabId = "content" | "style" | "layout" | "media" | "motion" | "advanced";
const ALL_TABS: { id: TabId; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "layout", label: "Layout" },
  { id: "media", label: "Media" },
  { id: "motion", label: "Motion" },
  { id: "advanced", label: "Advanced" },
];
// Custom/Library sections render from authored code that controls its own
// layout, media and motion — those tabs would be no-ops, so only Content
// (driven by the section's editableFields), Style, and Advanced apply.
const CUSTOM_TABS: { id: TabId; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "style", label: "Style" },
  { id: "advanced", label: "Advanced" },
];

export function SectionSettingsDrawer({ section, kind, schemes, industry, baseTheme, canReset, onPatch, onDuplicate, onDelete, onApplyGlobal, onResetToLibrary }: {
  section: CanvasSection;
  kind: string;
  schemes: CanvasColor[];
  industry?: string;
  baseTheme?: import("@/components/sections/types").SectionTheme;
  canReset?: boolean;
  onResetToLibrary?: () => void;
  onPatch: (patch: Partial<CanvasSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApplyGlobal?: () => void;
}) {
  const [tab, setTab] = useState<TabId>("content");
  const isCustom = Boolean(section.custom);
  const TABS = isCustom ? CUSTOM_TABS : ALL_TABS;
  // Custom sections: drive the Content tab from the fields the authored
  // component actually reads. Built-ins: use the name-derived registry schema.
  const schema = isCustom ? schemaForEditableFields(section.editableFields) : getEditSchema(kind);
  const data = normalizeSectionData(section, kind);
  // Guard against a stale tab when switching between custom / built-in sections.
  const activeTab = TABS.some((t) => t.id === tab) ? tab : "content";

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
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${activeTab === t.id ? "bg-accent text-white" : "text-muted hover:bg-panel hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === "content" && <ContentTab sectionId={section.id} schema={schema} content={data.content} onCommit={commitContent} />}
        {activeTab === "style" && <StyleTab section={section} onPatch={onPatch} base={baseTheme} canReset={canReset} onResetToLibrary={onResetToLibrary} />}
        {activeTab === "layout" && <LayoutTab kind={kind} variant={section.variant} layout={data.layout} onVariant={(variant) => onPatch({ variant })} onCommit={commitLayout} />}
        {activeTab === "media" && <MediaTab assets={data.assets} sectionName={section.name} industry={industry} onCommit={commitAssets} />}
        {activeTab === "motion" && <MotionTab schema={schema} motion={data.motion} onCommit={commitMotion} />}
        {activeTab === "advanced" && (
          <AdvancedTab section={section} kind={kind} schemes={schemes} onPatch={onPatch} onDuplicate={onDuplicate} onDelete={onDelete} onApplyGlobal={onApplyGlobal} />
        )}
      </div>
    </div>
  );
}
