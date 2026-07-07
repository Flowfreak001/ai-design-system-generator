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

type Device = "desktop" | "tablet" | "mobile";
// Logical device viewport sizes so tablet/mobile emulate a real screen: fixed
// width + height, own scroll, overflow-clipped (so a section's overlays — mobile
// drawers, mega menus — are contained to the frame, not the whole preview page).
const DEVICE: Record<Device, { w: number | null; h: number | null }> = {
  desktop: { w: null, h: null },
  tablet: { w: 834, h: 1112 },
  mobile: { w: 390, h: 844 },
};

export function FullSectionPreview({ section }: { section: LibrarySection }) {
  const theme = useMemo(() => createSectionTheme(undefined), []);
  const [device, setDevice] = useState<Device>("desktop");
  const dim = DEVICE[device];

  const rendered = <SectionErrorBoundary>{renderLibrarySection(section, theme, device === "mobile")}</SectionErrorBoundary>;

  return (
    <div className="min-h-screen bg-panel">
      {/* Slim top bar (doesn't scroll with the page). */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur">
        <Link href="/library" className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-muted hover:bg-panel hover:text-ink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Library
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <span className="text-[13px] font-semibold text-ink">{section.name}</span>
          <span className="ml-2 hidden text-[12px] text-muted sm:inline">{device === "desktop" ? "Full-page preview · scroll to test animations" : `${dim.w}px device · scroll inside the frame`}</span>
        </div>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
          {(Object.keys(DEVICE) as Device[]).map((d) => (
            <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{d}</button>
          ))}
        </div>
      </div>

      {device === "desktop" ? (
        // Real full-width scrollable page (scroll-linked effects have room).
        <div className="bg-white">
          {rendered}
          <div className="min-h-[70vh]" aria-hidden />
        </div>
      ) : (
        // Emulated device: fixed viewport, rounded bezel, own scroll + overflow
        // clip so section overlays stay inside the frame.
        <div className="flex justify-center px-4 py-8">
          <div
            className="relative overflow-hidden rounded-[36px] border-[8px] border-neutral-800 bg-white shadow-2xl"
            // transform makes this the containing block for the section's
            // position:fixed overlays (mobile drawer), so they stay inside the
            // device frame instead of covering the whole preview page.
            style={{ width: dim.w ?? undefined, height: `min(${dim.h}px, calc(100dvh - 140px))`, maxWidth: "100%", transform: "translateZ(0)" }}
          >
            <div className="h-full overflow-y-auto overscroll-contain">
              {rendered}
              <div style={{ minHeight: "40%" }} aria-hidden />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
