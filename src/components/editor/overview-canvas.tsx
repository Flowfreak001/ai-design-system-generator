"use client";

// Relume-style project overview. Renders EVERY page together as vertical frames
// in one zoomable/scrollable canvas so the whole project structure is visible
// at once. Each frame shows its section stack (low-fi or styled preview per
// stage), an "Edit" button that opens the Puck editor for that page, and a
// quick "Add section" menu. Puck is NOT used here — this is project-wide
// visibility; Puck owns single-page editing.

import { useRef, useState } from "react";
import { SectionWireframe } from "./wireframe-block";
import { RenderSection } from "@/components/sections/registry";
import { Popover } from "./overlays";
import { themeFromStyle } from "@/components/sections/theme";
import { KIND_LABEL, WIREFRAME_COMPONENT_KINDS, type MultiPagePuck, type PuckPage } from "@/lib/puck-canvas";
import type { SectionKind } from "@/lib/sections";
import type { StyleGuideCanvas } from "@/lib/canvas";

export function OverviewCanvas({
  mode, doc, style, selectedPageId, onSelectPage, onEditPage, onAddPage, onAddSection,
}: {
  mode: "wireframe" | "design";
  doc: MultiPagePuck;
  style: StyleGuideCanvas;
  selectedPageId?: string;
  onSelectPage: (id: string) => void;
  onEditPage: (id: string) => void;
  onAddPage: () => void;
  onAddSection: (pageId: string, kind: SectionKind) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.7);
  const frameW = 340;
  const theme = themeFromStyle(style);

  const fit = () => {
    const c = scrollRef.current;
    if (!c) return;
    const natural = doc.pages.length * frameW + Math.max(0, doc.pages.length - 1) * 40 + 80;
    setZoom(Math.max(0.2, Math.min(1, (c.clientWidth - 24) / natural)));
  };
  const zoomBy = (d: number) => setZoom((z) => Math.max(0.2, Math.min(1.4, +(z + d).toFixed(2))));

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-panel/40">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-8">
        {/* CSS `zoom` (not transform:scale) so scroll area matches visual size. */}
        <div style={{ zoom } as React.CSSProperties} className="flex w-max items-start gap-10">
          {doc.pages.map((p) => (
            <PageFrame
              key={p.id}
              page={p}
              mode={mode}
              frameW={frameW}
              theme={theme}
              isHome={/^home/i.test(p.name)}
              selected={p.id === selectedPageId}
              onSelect={() => onSelectPage(p.id)}
              onEdit={() => onEditPage(p.id)}
              onAddSection={(kind) => onAddSection(p.id, kind)}
            />
          ))}

          {/* Add page tile */}
          <button
            type="button"
            onClick={onAddPage}
            style={{ width: frameW }}
            className="mt-8 grid h-40 place-items-center rounded-xl border-2 border-dashed border-line bg-surface/50 text-[13px] font-medium text-muted hover:border-accent hover:text-accent"
          >
            ＋ Add page
          </button>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-surface/95 p-1 shadow-lg backdrop-blur">
          <button type="button" onClick={() => zoomBy(-0.1)} className="grid h-7 w-7 place-items-center rounded-md text-body hover:bg-panel">−</button>
          <span className="w-11 text-center text-[12px] tabular-nums text-body">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomBy(0.1)} className="grid h-7 w-7 place-items-center rounded-md text-body hover:bg-panel">＋</button>
          <button type="button" onClick={fit} className="rounded-md px-2 py-1 text-[12px] font-medium text-body hover:bg-panel">Fit</button>
        </div>
      </div>
    </div>
  );
}

function PageFrame({
  page, mode, frameW, theme, isHome, selected, onSelect, onEdit, onAddSection,
}: {
  page: PuckPage;
  mode: "wireframe" | "design";
  frameW: number;
  theme: ReturnType<typeof themeFromStyle>;
  isHome: boolean;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onAddSection: (kind: SectionKind) => void;
}) {
  const sections = page.data.content;
  return (
    <div className="flex flex-col gap-2" style={{ width: frameW }}>
      {/* Page header */}
      <div className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 ${selected ? "border-accent bg-accent-soft/40" : "border-line bg-surface"}`}>
        <button type="button" onClick={onSelect} className="flex min-w-0 items-center gap-2 text-left">
          <span className="text-[12px]">{isHome ? "🏠" : "📄"}</span>
          <span className="truncate text-[13px] font-semibold text-ink">{page.name}</span>
          {isHome && <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-medium text-accent">home</span>}
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[11px] text-faint">{sections.length} sec</span>
          <button type="button" onClick={onEdit} className="rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-white hover:opacity-90">
            Edit {mode === "wireframe" ? "Wireframe" : "Design"}
          </button>
        </div>
      </div>

      {/* Page frame */}
      <div onClick={onSelect} className={`overflow-hidden rounded-xl border bg-surface shadow-sm ${selected ? "border-accent ring-1 ring-accent" : "border-line"}`}>
        <div className="flex items-center gap-1.5 border-b border-line bg-panel px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-2 h-4 flex-1 rounded bg-surface" />
        </div>

        {sections.length === 0 ? (
          <div className="px-6 py-14 text-center text-[12.5px] text-faint">Empty page — add a section below or click Edit.</div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {sections.map((item) => {
              const kind = (item.props.kind as SectionKind) ?? "generic";
              const label = KIND_LABEL[kind] ?? "Content Block";
              return (
                <div key={String(item.props.id)} className="group relative w-full">
                  <div className="pointer-events-none absolute left-2 top-1 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-md bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white">{String(item.props.name ?? label)}</span>
                  </div>
                  {mode === "wireframe" ? (
                    <SectionWireframe name={label} />
                  ) : (
                    <RenderSection name={label} note={item.props.note ? String(item.props.note) : undefined} theme={theme} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick add section */}
      <Popover
        width={220}
        trigger={() => (
          <span className="flex w-full items-center justify-center rounded-lg border border-dashed border-line px-3 py-1.5 text-[12px] font-medium text-muted hover:border-accent hover:text-accent">
            ＋ Add section
          </span>
        )}
      >
        {(close) => (
          <div className="grid max-h-72 gap-0.5 overflow-y-auto">
            {WIREFRAME_COMPONENT_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => { onAddSection(kind); close(); }}
                className="rounded-md px-2 py-1.5 text-left text-[12.5px] text-body hover:bg-panel"
              >
                {KIND_LABEL[kind]}
              </button>
            ))}
          </div>
        )}
      </Popover>
    </div>
  );
}
