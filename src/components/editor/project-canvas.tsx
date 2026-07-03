"use client";

// One zoomable/pannable canvas that renders EVERY page frame together (like a
// design tool's project view). Used by both the Wireframe (low-fi) and Design
// (real styled) tabs. Sections stack top→bottom inside each page frame in
// document flow. The selected page/section is for editing only — all pages
// always render.

import { useRef, useState } from "react";
import { SectionWireframe } from "./wireframe-block";
import { RenderSection } from "@/components/sections/registry";
import { themeFromStyle, type SectionTheme } from "@/components/sections/theme";
import type { CanvasPage, CanvasColor, CanvasSection, StyleGuideCanvas } from "@/lib/canvas";

const FRAME_W = { desktop: 820, tablet: 640, mobile: 380 } as const;
type Device = keyof typeof FRAME_W;

const SOURCE_STYLE: Record<string, string> = {
  extracted: "bg-success-soft text-success", detected: "bg-success-soft text-success",
  "vision-detected": "bg-info-soft text-info", "reference-inspired": "bg-info-soft text-info",
  "user-added": "bg-accent-soft text-accent", "AI-suggested": "bg-warning-soft text-warning",
  assumed: "bg-panel text-muted",
};

export function ProjectCanvas({
  pages, mode, style, schemes,
  selectedPageId, selectedSectionId,
  onSelectPage, onSelectSection,
  onMoveSection, onDuplicateSection, onRemoveSection, onApproveSection,
}: {
  pages: CanvasPage[];
  mode: "wireframe" | "design";
  style: StyleGuideCanvas;
  schemes: CanvasColor[];
  selectedPageId?: string;
  selectedSectionId: string | null;
  onSelectPage: (id: string) => void;
  onSelectSection: (pageId: string, sid: string) => void;
  onMoveSection: (pageId: string, sid: string, dir: -1 | 1) => void;
  onDuplicateSection: (pageId: string, sid: string) => void;
  onRemoveSection: (pageId: string, sid: string) => void;
  onApproveSection?: (pageId: string, sid: string, status: "approved" | "rejected") => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [zoom, setZoom] = useState(0.55);
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameW = FRAME_W[device];
  const baseTheme = themeFromStyle(style);

  const fit = () => {
    const c = scrollRef.current;
    if (!c) return;
    const natural = pages.length * frameW + Math.max(0, pages.length - 1) * 40 + 80;
    setZoom(Math.max(0.12, Math.min(1, (c.clientWidth - 24) / natural)));
  };
  const zoomBy = (d: number) => setZoom((z) => Math.max(0.12, Math.min(1.5, +(z + d).toFixed(2))));

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-panel/40">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto p-8">
        {/* CSS `zoom` (not transform:scale) so the scroll area matches the
            visual size — normal document scroll/pan, no phantom empty space
            and no erratic zoom feel. Buttons control the zoom factor. */}
        <div style={{ zoom } as React.CSSProperties} className="flex w-max items-start gap-10">
          {pages.map((p) => (
            <PageFrame
              key={p.id}
              page={p}
              frameW={frameW}
              mode={mode}
              baseTheme={baseTheme}
              schemes={schemes}
              device={device}
              isHome={/^home/i.test(p.name)}
              selectedPage={p.id === selectedPageId}
              selectedSectionId={selectedSectionId}
              onSelectPage={onSelectPage}
              onSelectSection={onSelectSection}
              onMoveSection={onMoveSection}
              onDuplicateSection={onDuplicateSection}
              onRemoveSection={onRemoveSection}
              onApproveSection={onApproveSection}
            />
          ))}
        </div>
      </div>

      {/* Bottom controls: device + zoom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-surface/95 p-1 shadow-lg backdrop-blur">
          <div className="flex items-center gap-1 rounded-lg bg-panel p-0.5">
            {(Object.keys(FRAME_W) as Device[]).map((d) => (
              <button key={d} type="button" onClick={() => setDevice(d)} className={`rounded px-2 py-0.5 text-[11px] capitalize ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted"}`}>{d}</button>
            ))}
          </div>
          <span className="h-4 w-px bg-line" />
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
  page, frameW, mode, baseTheme, schemes, device, isHome, selectedPage, selectedSectionId,
  onSelectPage, onSelectSection, onMoveSection, onDuplicateSection, onRemoveSection, onApproveSection,
}: {
  page: CanvasPage;
  frameW: number;
  mode: "wireframe" | "design";
  baseTheme: SectionTheme;
  schemes: CanvasColor[];
  device: Device;
  isHome: boolean;
  selectedPage: boolean;
  selectedSectionId: string | null;
  onSelectPage: (id: string) => void;
  onSelectSection: (pageId: string, sid: string) => void;
  onMoveSection: (pageId: string, sid: string, dir: -1 | 1) => void;
  onDuplicateSection: (pageId: string, sid: string) => void;
  onRemoveSection: (pageId: string, sid: string) => void;
  onApproveSection?: (pageId: string, sid: string, status: "approved" | "rejected") => void;
}) {
  const mobile = device === "mobile";
  return (
    <div className="flex flex-col gap-2" style={{ width: frameW }}>
      {/* Page header */}
      <button
        type="button"
        onClick={() => onSelectPage(page.id)}
        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-left ${selectedPage ? "border-accent bg-accent-soft/40" : "border-line bg-surface hover:border-line-strong"}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-[12px]">{isHome ? "🏠" : "📄"}</span>
          <span className="truncate text-[13px] font-semibold text-ink">{page.name}</span>
          {isHome && <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-medium text-accent">home</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ${SOURCE_STYLE[page.source] ?? "bg-panel text-muted"}`}>{page.source}</span>
          <span className="text-[11px] text-faint">{page.sections.length} sec</span>
        </span>
      </button>

      {/* Page frame */}
      <div
        onClick={() => onSelectPage(page.id)}
        className={`overflow-hidden rounded-xl border bg-surface shadow-sm ${selectedPage ? "border-accent ring-1 ring-accent" : "border-line"}`}
      >
        <div className="flex items-center gap-1.5 border-b border-line bg-panel px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-2 h-4 flex-1 rounded bg-surface" />
        </div>

        {page.sections.length === 0 ? (
          <div className="px-6 py-16 text-center text-[12.5px] text-faint">Empty page — select it and add sections.</div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {page.sections.map((s, i) => {
              const scheme = schemes.find((c) => c.name === s.scheme)?.value;
              const theme: SectionTheme = scheme ? { ...baseTheme, accent: scheme } : baseTheme;
              const selected = s.id === selectedSectionId;
              return (
                <div
                  key={s.id}
                  onClick={(e) => { e.stopPropagation(); onSelectSection(page.id, s.id); }}
                  style={mode === "wireframe" && scheme ? ({ "--color-accent": scheme } as React.CSSProperties) : undefined}
                  className={`group relative w-full shrink-0 ${selected ? "z-10 ring-2 ring-inset ring-accent" : ""} ${s.status === "rejected" ? "opacity-40" : ""}`}
                >
                  <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="pointer-events-auto flex items-center gap-1.5 rounded-md bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white">
                      {s.name}<span className="rounded bg-white/20 px-1">{s.source}</span>{s.status && <span className="rounded bg-white/20 px-1">{s.status}</span>}
                    </span>
                    <span className="pointer-events-auto flex items-center gap-0.5 rounded-md bg-surface px-1 py-0.5 shadow-sm">
                      <button type="button" onClick={(e) => { e.stopPropagation(); onMoveSection(page.id, s.id, -1); }} disabled={i === 0} className="px-1 text-faint hover:text-ink disabled:opacity-30">↑</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onMoveSection(page.id, s.id, 1); }} disabled={i === page.sections.length - 1} className="px-1 text-faint hover:text-ink disabled:opacity-30">↓</button>
                      {onApproveSection && <button type="button" onClick={(e) => { e.stopPropagation(); onApproveSection(page.id, s.id, "approved"); }} title="Approve" className="px-1 text-faint hover:text-success">✓</button>}
                      <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicateSection(page.id, s.id); }} title="Duplicate" className="px-1 text-[11px] text-faint hover:text-ink">⧉</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveSection(page.id, s.id); }} title="Delete" className="px-1 text-faint hover:text-danger">✕</button>
                    </span>
                  </div>
                  {mode === "wireframe" ? (
                    <SectionWireframe name={s.name} mobile={mobile} />
                  ) : (
                    <RenderSection name={s.name} note={s.note} theme={theme} mobile={mobile} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
