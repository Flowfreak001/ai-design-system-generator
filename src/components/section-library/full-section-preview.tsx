"use client";

// Full-page section preview — renders the section in a REAL scrollable page (not
// a scaled modal) so scroll-linked animations (useScroll marquees, reveal-on-
// scroll steps, parallax) behave exactly as they will on a live page. Scroll room
// above and below gives the effects space to trigger.

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LibrarySection } from "@/lib/section-library/manual-sections";
import { createSectionTheme } from "@/components/sections/section-theme";
import { SectionErrorBoundary, renderLibrarySection } from "@/components/section-library/section-render";
import { buildExportPrompt } from "@/lib/section-library/prompt-export";
import { Button } from "@/components/ui/button";
import { FlowfreakWordmark } from "@/components/layout/logo";

const DEVICE_ICON: Record<Device, React.ReactNode> = {
  desktop: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><path d="M2 20h20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  tablet: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M11 18h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  mobile: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M11 18h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
};

type Device = "desktop" | "tablet" | "mobile";
// Logical device viewport sizes so tablet/mobile emulate a real screen: fixed
// width + height, own scroll, overflow-clipped (so a section's overlays — mobile
// drawers, mega menus — are contained to the frame, not the whole preview page).
const DEVICE: Record<Device, { w: number | null; h: number | null }> = {
  desktop: { w: null, h: null },
  tablet: { w: 834, h: 1112 },
  mobile: { w: 390, h: 844 },
};

export function FullSectionPreview({ section, publicMode = false }: { section: LibrarySection; publicMode?: boolean }) {
  const theme = useMemo(() => createSectionTheme(undefined), []);
  const [device, setDevice] = useState<Device>("desktop");
  const dim = DEVICE[device];
  const backHref = publicMode ? "/components" : "/library";
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildExportPrompt(section, theme, { tool: "any", format: "universal", scope: "section" }));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const rendered = <SectionErrorBoundary>{renderLibrarySection(section, theme, device === "mobile")}</SectionErrorBoundary>;

  // Trailing scroll room is only useful for scroll-LINKED sections (useScroll
  // parallax/reveal effects need space below to progress). Static sections
  // (headers, footers, grids) end compactly — no dead gap under them.
  const scrollRoom = /useScroll/.test(section.componentCode ?? "");

  return (
    <div className="min-h-screen bg-panel">
      {/* Slim top bar (doesn't scroll with the page). */}
      <div className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line bg-surface/90 px-3 py-2.5 backdrop-blur sm:px-4">
        {/* Left — back, wordmark, breadcrumb */}
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href={backHref} aria-label="Back to library" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:bg-panel hover:text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <Link href={backHref} aria-label="Flowfreak" className="hidden shrink-0 items-center sm:flex"><FlowfreakWordmark height={44} /></Link>
          <span className="hidden min-w-0 items-center gap-2 md:flex">
            <span className="truncate text-[13px] capitalize text-muted">{section.category}</span>
            <span className="text-faint">·</span>
            <span className="truncate rounded-md bg-panel px-2 py-0.5 text-[13px] font-medium text-ink">{section.name}</span>
          </span>
        </div>

        {/* Center — device toggle with icons */}
        <div className="inline-flex items-center gap-0.5 justify-self-center rounded-full border border-line bg-panel p-0.5">
          {(Object.keys(DEVICE) as Device[]).map((d) => (
            <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              {DEVICE_ICON[d]}<span className="hidden sm:inline">{d}</span>
            </button>
          ))}
        </div>

        {/* Right — info + copy */}
        <div className="flex shrink-0 items-center justify-self-end gap-2">
          <span title={device === "desktop" ? "Full-page preview · scroll to test animations" : `${dim.w}px device · scroll inside the frame`} className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" /><path d="M12 11v5m0-8.5v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </span>
          <Button variant="secondary" onClick={copy}>
            {copied ? (
              <><svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="text-success">Copied</span></>
            ) : (
              <><svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>Copy prompt</>
            )}
          </Button>
        </div>
      </div>

      {device === "desktop" ? (
        // Real full-width scrollable page. The section ends naturally (grey
        // panel below = end of preview); trailing scroll room is added ONLY
        // for scroll-linked sections, which need it to progress.
        <div className="bg-white">
          {rendered}
          {scrollRoom && <div className="min-h-[70vh] bg-white" aria-hidden />}
        </div>
      ) : (
        // Emulated device: fixed viewport, rounded bezel, own scroll + overflow
        // clip so section overlays stay inside the frame.
        <div className="flex justify-center px-4 py-8">
          {/* Realistic device: light aluminium bezel, rounded shell, camera + home indicator. */}
          <div
            className={`relative bg-gradient-to-b from-[#3a3a3c] via-[#1c1c1e] to-[#2c2c2e] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.55)] ring-1 ring-black/40 ${device === "mobile" ? "rounded-[48px] p-[11px]" : "rounded-[40px] p-[14px]"}`}
            // `contain: layout paint` makes this the containing block for the
            // section's position:fixed overlays (mobile drawer / mega-menu) so
            // they stay inside the device frame instead of covering the whole
            // preview page. (transform:translateZ(0) normalizes to a 2D identity
            // matrix, which Chrome does NOT treat as a fixed-containing block.)
            style={{ width: dim.w ?? undefined, height: `min(${dim.h}px, calc(100dvh - 140px))`, maxWidth: "100%", contain: "layout paint" }}
          >
            <div className={`relative h-full w-full overflow-hidden bg-white ring-1 ring-black/5 ${device === "mobile" ? "rounded-[37px]" : "rounded-[26px]"}`}>
              <div className="h-full overflow-y-auto overscroll-contain">
                {rendered}
                {scrollRoom && <div style={{ minHeight: "40%" }} aria-hidden />}
              </div>
              {device === "mobile" && (
                /* home indicator */
                <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-neutral-400/80" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
