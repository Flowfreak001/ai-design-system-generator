"use client";

// One editor stage backed by Puck (Wireframe = low-fi, Design = styled). Puck
// handles add/reorder/duplicate/delete/fields inside a single page's vertical
// drop zone (so sections always stack, never overlap). We add the multi-page
// rail around it — each page has its own Puck data.

import { Puck, type Data } from "@measured/puck";
import "@measured/puck/dist/index.css";
import { Button } from "@/components/ui/button";
import { wireframeConfig, designConfig, DesignThemeContext } from "./puck/configs";
import { themeFromStyle } from "@/components/sections/theme";
import type { MultiPagePuck, PuckData } from "@/lib/puck-canvas";
import type { StyleGuideCanvas } from "@/lib/canvas";

export function PuckStage({
  mode, doc, style, selectedPageId, onSelectPage, onChangeData, onAddPage, topActions,
}: {
  mode: "wireframe" | "design";
  doc: MultiPagePuck;
  style: StyleGuideCanvas;
  selectedPageId?: string;
  onSelectPage: (id: string) => void;
  onChangeData: (pageId: string, data: PuckData) => void;
  onAddPage: () => void;
  topActions?: React.ReactNode;
}) {
  const config = mode === "wireframe" ? wireframeConfig : designConfig;
  const theme = themeFromStyle(style);
  const activeId = selectedPageId && doc.pages.some((p) => p.id === selectedPageId) ? selectedPageId : doc.pages[0]?.id;
  const page = doc.pages.find((p) => p.id === activeId) ?? doc.pages[0];

  return (
    <div className="flex min-h-0 flex-1">
      {/* Page rail */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">Pages</span>
          <button type="button" onClick={onAddPage} title="Add page" className="rounded-md px-1.5 text-[13px] text-accent hover:bg-accent-soft">＋</button>
        </div>
        <div className="grid gap-1 overflow-y-auto p-2">
          {doc.pages.map((p) => {
            const active = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPage(p.id)}
                className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left ${active ? "border-accent bg-accent-soft/40" : "border-transparent hover:bg-panel"}`}
              >
                <span className="min-w-0">
                  <span className={`block truncate text-[13px] font-medium ${active ? "text-accent" : "text-ink"}`}>{p.name}</span>
                  <span className="text-[11px] text-faint">{p.data.content.length} section{p.data.content.length === 1 ? "" : "s"}</span>
                </span>
              </button>
            );
          })}
        </div>
        {topActions && <div className="mt-auto border-t border-line p-3">{topActions}</div>}
      </aside>

      {/* Puck editor for the selected page */}
      <div className="min-w-0 flex-1">
        {page ? (
          <PuckMount
            key={`${mode}-${page.id}`}
            mode={mode}
            config={config}
            data={page.data as Data}
            theme={theme}
            onChange={(d) => onChangeData(page.id, d as PuckData)}
          />
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-muted">Add a page in the Sitemap first.</div>
        )}
      </div>
    </div>
  );
}

function PuckMount({
  mode, config, data, theme, onChange,
}: {
  mode: "wireframe" | "design";
  config: Parameters<typeof Puck>[0]["config"];
  data: Data;
  theme: React.ContextType<typeof DesignThemeContext>;
  onChange: (d: Data) => void;
}) {
  // Render inline (no iframe) so the app's Tailwind applies to the previews.
  const editor = (
    <Puck config={config} data={data} onChange={onChange} iframe={{ enabled: false }} />
  );
  return mode === "design" ? <DesignThemeContext.Provider value={theme}>{editor}</DesignThemeContext.Provider> : editor;
}

// Convenience button for the rail footer.
export function AddSectionsHint() {
  return <Button size="sm" variant="secondary" disabled className="w-full">Use the left panel to add sections</Button>;
}
