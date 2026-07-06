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
const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 820, mobile: 390 };

export function FullSectionPreview({ section }: { section: LibrarySection }) {
  const theme = useMemo(() => createSectionTheme(undefined), []);
  const [device, setDevice] = useState<Device>("desktop");
  const maxWidth = DEVICE_WIDTH[device];

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
          <span className="ml-2 text-[12px] text-muted">Full-page preview · scroll to test animations</span>
        </div>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
          {(Object.keys(DEVICE_WIDTH) as Device[]).map((d) => (
            <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{d}</button>
          ))}
        </div>
      </div>

      {/* Real scrollable page. Device widths center the section in a framed column. */}
      <div className="mx-auto bg-white" style={maxWidth ? { maxWidth, boxShadow: "0 0 0 1px var(--color-line)" } : undefined}>
        <SectionErrorBoundary>{renderLibrarySection(section, theme, device === "mobile")}</SectionErrorBoundary>

        {/* Scroll room so scroll-linked effects have space to trigger/replay. */}
        <div className="min-h-[70vh]" aria-hidden />
      </div>
    </div>
  );
}
