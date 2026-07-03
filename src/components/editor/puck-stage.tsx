"use client";

// Single-page Puck editor. Opened from the all-pages overview when the user
// clicks "Edit" on one page — Puck is strongest at reliable single-page,
// section-by-section editing (add / reorder / duplicate / delete / props /
// variant). Its vertical drop zone keeps sections stacked, never overlapping.

import { Puck, type Data } from "@measured/puck";
import "@measured/puck/dist/index.css";
import { wireframeConfig, designConfig, DesignThemeContext } from "./puck/configs";
import { themeFromStyle } from "@/components/sections/theme";
import type { PuckData, PuckPage } from "@/lib/puck-canvas";
import type { StyleGuideCanvas } from "@/lib/canvas";

export function PuckPageEditor({
  mode, page, style, onChange, onBack,
}: {
  mode: "wireframe" | "design";
  page: PuckPage;
  style: StyleGuideCanvas;
  onChange: (pageId: string, data: PuckData) => void;
  onBack: () => void;
}) {
  const config = mode === "wireframe" ? wireframeConfig : designConfig;
  const theme = themeFromStyle(style);
  // Render inline (no iframe) so the app's Tailwind applies to previews.
  const editor = (
    <Puck
      key={`${mode}-${page.id}`}
      config={config}
      data={page.data as Data}
      onChange={(d) => onChange(page.id, d as PuckData)}
      iframe={{ enabled: false }}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2">
        <button type="button" onClick={onBack} className="rounded-lg px-2 py-1 text-[13px] font-medium text-accent hover:bg-accent-soft">
          ← All pages
        </button>
        <span className="text-[13px] font-semibold text-ink">{page.name}</span>
        <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-medium capitalize text-muted">{mode} editor</span>
      </div>
      <div className="min-h-0 flex-1">
        {mode === "design" ? <DesignThemeContext.Provider value={theme}>{editor}</DesignThemeContext.Provider> : editor}
      </div>
    </div>
  );
}
