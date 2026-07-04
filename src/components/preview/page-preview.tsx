"use client";

// Full-page live preview with real responsive device previews.
//
// Two modes:
//  • framed (?frame=1) — renders ONLY the stacked sections. This is what the
//    iframe loads, so Tailwind's viewport breakpoints (sm/md/lg) respond to the
//    iframe width and the page reflows like a real site at each device size.
//  • shell (default) — a device toolbar (Desktop / iPad / Mobile) + page
//    switcher, with the framed page embedded in a width-constrained iframe.
//    This is the industry-standard approach (Framer/Webflow) because only a
//    separate viewport (iframe) triggers real responsive breakpoints.

import { useState } from "react";
import Link from "next/link";
import { renderSectionByKind } from "@/components/sections/render-section";
import { createSectionTheme } from "@/components/sections/section-theme";
import { sectionKind } from "@/lib/sections";
import type { CanvasPage, StyleGuideCanvas } from "@/lib/canvas";

type Device = "desktop" | "tablet" | "mobile";

// Standard device viewport widths (CSS px): iPad portrait 820, iPhone 14 390.
const DEVICE: Record<Device, { label: string; width: number | null }> = {
  desktop: { label: "Desktop", width: null },
  tablet: { label: "iPad", width: 820 },
  mobile: { label: "Mobile", width: 390 },
};

export function PagePreview({ projectId, pages, style, initialPageId, framed }: {
  projectId: string;
  pages: CanvasPage[];
  style: StyleGuideCanvas;
  initialPageId?: string;
  framed?: boolean;
}) {
  const theme = createSectionTheme(style);
  const [pageId, setPageId] = useState<string>(
    initialPageId && pages.some((p) => p.id === initialPageId) ? initialPageId : pages[0]?.id ?? "",
  );
  const [device, setDevice] = useState<Device>("desktop");
  const page = pages.find((p) => p.id === pageId) ?? pages[0];

  // ── Inner (iframe) mode: just the rendered sections, real window scroll. ──
  if (framed) {
    // Real page links injected into the site's own header/footer so the
    // rendered navbar becomes the navigation (no page menu in the preview chrome).
    const navLinks = pages.map((p) => ({
      label: p.name,
      href: `/preview/${projectId}?frame=1&page=${p.id}`,
      active: p.id === page?.id,
    }));
    return (
      <div style={{ background: theme.backgroundColor }}>
        <main>
          {page?.sections.filter((s) => s.status !== "rejected").map((s) => (
            <div key={s.id}>
              {renderSectionByKind(sectionKind(s.name), s.variant, {
                name: s.name,
                note: s.note,
                theme,
                assetSide: s.asset === "left" ? "left" : "right",
                navLinks,
              })}
            </div>
          ))}
          {(!page || page.sections.length === 0) && (
            <div className="grid min-h-[60vh] place-items-center text-[14px] text-neutral-500">This page has no sections yet.</div>
          )}
        </main>
      </div>
    );
  }

  // ── Shell mode: device toolbar + page switcher + framed iframe. ──
  const width = DEVICE[device].width;
  const isDesktop = device === "desktop";
  const src = `/preview/${projectId}?frame=1&page=${pageId}`;

  return (
    <div className="flex h-[100dvh] flex-col bg-neutral-100">
      {/* Top toolbar — Editor on the left, device toggle centered. Page
          navigation now lives in the rendered site's own header. */}
      <header className="relative flex items-center border-b border-black/10 bg-white/95 px-4 py-2.5 backdrop-blur">
        <Link
          href={`/projects/${projectId}/editor`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Editor
        </Link>

        {/* Device toggle — absolutely centered so it stays mid-screen. */}
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <div className="pointer-events-auto inline-flex items-center gap-0.5 rounded-full border border-black/10 bg-neutral-100 p-0.5">
            {(Object.keys(DEVICE) as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                title={`${DEVICE[d].label}${DEVICE[d].width ? ` · ${DEVICE[d].width}px` : ""}`}
                aria-pressed={device === d}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  device === d ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <DeviceIcon device={d} />
                <span className="hidden sm:inline">{DEVICE[d].label}</span>
              </button>
            ))}
          </div>
        </div>

        <span className="ml-auto truncate text-[12.5px] font-medium text-neutral-500">{page?.name}</span>
      </header>

      {/* Canvas: the framed page at the chosen device width. */}
      <div className="min-h-0 flex-1 overflow-auto p-0 sm:p-6">
        <div
          className={`mx-auto h-full bg-white transition-[max-width,width] duration-300 ${
            isDesktop
              ? "max-w-none"
              : "overflow-hidden rounded-[1.75rem] border border-black/10 shadow-2xl ring-1 ring-black/5"
          }`}
          style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}
        >
          <iframe
            key={device}
            src={src}
            title="Live preview"
            className="h-full w-full border-0"
            style={{ minHeight: isDesktop ? "100%" : `${Math.round((width ?? 390) * 1.6)}px` }}
            onLoad={(e) => {
              // Keep the outer state in sync when the site header navigates
              // inside the iframe, so switching device preserves the page.
              try {
                const u = new URL((e.currentTarget as HTMLIFrameElement).contentWindow!.location.href);
                const p = u.searchParams.get("page");
                if (p && p !== pageId && pages.some((x) => x.id === p)) setPageId(p);
              } catch {
                /* cross-origin guard — same-origin in practice */
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DeviceIcon({ device }: { device: Device }) {
  if (device === "desktop") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="4" width="19" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 20h6M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (device === "tablet") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="2.5" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
