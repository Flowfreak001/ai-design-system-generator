"use client";

// One zoomable/pannable canvas that renders EVERY page frame together (like a
// design tool's project view). Used by both the Wireframe (low-fi) and Design
// (real styled) tabs. Sections stack top→bottom inside each page frame in
// document flow. The selected page/section is for editing only — all pages
// always render.

import { useEffect, useRef, useState } from "react";
import { renderSectionVariant } from "@/components/sections/variants";
import { themeFromStyle, type SectionTheme } from "@/components/sections/theme";
import { sectionKind } from "@/lib/sections";
import type { CanvasPage, CanvasColor, CanvasSection, StyleGuideCanvas } from "@/lib/canvas";

// Low-fidelity monochrome theme: the Wireframe stage renders the SAME variant
// components as Design, but greyed out — so the wireframe reflects the chosen
// layout / variant / asset side without brand colours or high fidelity.
const WIREFRAME_THEME: SectionTheme = {
  primary: "#c4c4c4", accent: "#cfcfcf", ink: "#9b9b9b", muted: "#bcbcbc",
  bg: "#ffffff", surface: "#ededed", radius: 8,
  headingFont: "Inter, system-ui, sans-serif", bodyFont: "Inter, system-ui, sans-serif",
};

const FRAME_W = { desktop: 820, tablet: 640, mobile: 380 } as const;
type Device = keyof typeof FRAME_W;
const DEVICE_LABEL: Record<Device, string> = { desktop: "Desktop", tablet: "Tablet / iPad", mobile: "Mobile" };

function DeviceIcon({ device }: { device: Device }) {
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (device === "desktop")
    return (<svg {...common}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M2 20h20" /></svg>);
  if (device === "tablet")
    return (<svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M11 18h2" /></svg>);
  return (<svg {...common}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></svg>);
}

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
  const zoomBy = (d: number) => setZoom((z) => Math.max(0.12, Math.min(2, +(z + d).toFixed(2))));

  // Scroll-to-zoom like the sitemap: ctrl/cmd + wheel (and trackpad pinch, which
  // browsers report as ctrlKey) zooms toward the cursor. Plain wheel scrolls.
  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return; // let native scroll/pan happen
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const offX = e.clientX - rect.left;
      const offY = e.clientY - rect.top;
      const px = c.scrollLeft + offX; // pointer position in current zoomed px
      const py = c.scrollTop + offY;
      setZoom((z) => {
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        const nz = Math.max(0.12, Math.min(2, +(z * factor).toFixed(3)));
        const ratio = nz / z;
        // Keep the point under the cursor fixed after the zoom change.
        requestAnimationFrame(() => {
          c.scrollLeft = px * ratio - offX;
          c.scrollTop = py * ratio - offY;
        });
        return nz;
      });
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, []);

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

      {/* Bottom controls: device + zoom — pinned to the screen bottom, always visible */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-surface/95 p-1 shadow-lg backdrop-blur">
          <div className="flex items-center gap-0.5 rounded-lg bg-panel p-0.5">
            {(Object.keys(FRAME_W) as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                title={DEVICE_LABEL[d]}
                aria-label={DEVICE_LABEL[d]}
                aria-pressed={device === d}
                className={`grid h-7 w-8 place-items-center rounded-md transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-body"}`}
              >
                <DeviceIcon device={d} />
              </button>
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
                  <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-ink/85 px-2.5 py-1 text-[12px] font-medium text-white">
                      {s.name}<span className="rounded bg-white/20 px-1.5 py-0.5 text-[11px]">{s.source}</span>{s.status && <span className="rounded bg-white/20 px-1.5 py-0.5 text-[11px]">{s.status}</span>}
                    </span>
                    <span className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-surface px-1 py-1 shadow-lg">
                      <button type="button" onClick={(e) => { e.stopPropagation(); onMoveSection(page.id, s.id, -1); }} disabled={i === 0} title="Move up" className="grid h-8 w-8 place-items-center rounded-lg text-[17px] text-body hover:bg-panel hover:text-ink disabled:opacity-25">↑</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onMoveSection(page.id, s.id, 1); }} disabled={i === page.sections.length - 1} title="Move down" className="grid h-8 w-8 place-items-center rounded-lg text-[17px] text-body hover:bg-panel hover:text-ink disabled:opacity-25">↓</button>
                      {onApproveSection && <button type="button" onClick={(e) => { e.stopPropagation(); onApproveSection(page.id, s.id, "approved"); }} title="Approve" className="grid h-8 w-8 place-items-center rounded-lg text-[16px] text-body hover:bg-success-soft hover:text-success">✓</button>}
                      <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicateSection(page.id, s.id); }} title="Duplicate" className="grid h-8 w-8 place-items-center rounded-lg text-[15px] text-body hover:bg-panel hover:text-ink">⧉</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveSection(page.id, s.id); }} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-[16px] text-body hover:bg-danger-soft hover:text-danger">✕</button>
                    </span>
                  </div>
                  {renderSectionVariant(sectionKind(s.name), s.variant, {
                    name: s.name,
                    note: s.note,
                    theme: mode === "wireframe" ? WIREFRAME_THEME : theme,
                    mobile,
                    assetSide: s.asset === "left" ? "left" : "right",
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
