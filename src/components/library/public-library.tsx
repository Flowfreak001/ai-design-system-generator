"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { DEFAULT_SECTION_THEME } from "@/components/sections/section-theme";
import { SectionErrorBoundary, renderLibrarySection } from "@/components/section-library/section-render";
import { SECTION_LIBRARY_CATEGORIES, type LibrarySection, type SectionLibraryCategory } from "@/lib/section-library/manual-sections";
import { buildExportPrompt } from "@/lib/section-library/prompt-export";
import { Button, LinkButton } from "@/components/ui/button";

/** Framed, grey-well live preview — identical drawing to the app Section Library card. */
function CardThumb({ section }: { section: LibrarySection }) {
  const BASE = 1440;
  const BOX = 212;
  const vpRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.24);
  useEffect(() => {
    const compute = () => setScale((vpRef.current?.clientWidth ?? 340) / BASE);
    compute();
    const ro = new ResizeObserver(compute);
    if (vpRef.current) ro.observe(vpRef.current);
    return () => ro.disconnect();
  }, []);
  // Fixed "screen" exactly the card-box aspect (screenH * scale === BOX) with a scroll
  // container the dynamic full-height sections detect + fill. Short/natural sections show
  // their top, clipped to the box — a normal thumbnail crop.
  const screenH = Math.round(BOX / scale);
  return (
    <div className="pointer-events-none overflow-hidden rounded-2xl bg-line/60 p-4">
      <div ref={vpRef} className="relative h-[212px] w-full overflow-hidden rounded-xl border border-line bg-white">
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: BASE, height: screenH, overflow: "hidden", transform: `scale(${scale})` }}>
          <div style={{ height: "100%", overflowY: "auto" }}>
            <SectionErrorBoundary>{renderLibrarySection(section, DEFAULT_SECTION_THEME, false)}</SectionErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };
// Fixed device "screen" sizes so every section preview has a consistent height.
const DEVICE_DIM: Record<Device, { w: number; h: number }> = { desktop: { w: 1280, h: 760 }, tablet: { w: 820, h: 1093 }, mobile: { w: 390, h: 780 } };

/** Full-page preview modal — device toggle + scaled true-width render (same as the app Section Library). */
function PreviewModule({ section, onClose, onCopy, copied }: { section: LibrarySection; onClose: () => void; onCopy: () => void; copied: boolean }) {
  const [device, setDevice] = useState<Device>("desktop");
  const { w: width, h: height } = DEVICE_DIM[device];
  // Measure the viewport (not the stage) so the modal can hug the scaled screen —
  // snug on mobile, and identical size for every section on a given device.
  const [vp, setVp] = useState({ w: 1000, h: 760 });
  useEffect(() => {
    const measure = () => setVp({ w: Math.min(window.innerWidth - 32, 1152), h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const availW = vp.w - 48;                 // stage horizontal padding
  const availH = vp.h * 0.9 - 132;          // viewport minus header/actions + margins
  const scale = Math.min(availW / width, availH / height, 1);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[92vh] min-h-[50vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl animate-[drawerUp_0.28s_cubic-bezier(0.22,1,0.36,1)] sm:min-h-0 sm:rounded-2xl sm:animate-none" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="order-1 min-w-0 flex-1">
            <h3 className="truncate text-[14px] font-semibold text-ink">{section.name}</h3>
            <p className="truncate text-[12px] capitalize text-muted">{section.category} · {section.layoutType}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="order-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink sm:order-last">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <div className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-0.5 sm:order-2 sm:ml-auto sm:w-auto sm:overflow-visible sm:pb-0">
            <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
              {(Object.keys(DEVICE_WIDTH) as Device[]).map((d) => (
                <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
                  className={`rounded-full px-2.5 py-1.5 text-[12px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{d}</button>
              ))}
            </div>
            <a href={`/section-preview/${section.id}`} target="_blank" rel="noopener noreferrer" title="Open full-page preview (real scroll)" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink hover:bg-panel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-8 8M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="hidden sm:inline">Full page</span>
            </a>
            <button type="button" onClick={onCopy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink hover:bg-panel">
              {copied ? "Copied" : "Copy prompt"}
            </button>
            <LinkButton href="/signup" size="sm" className="shrink-0">Use section</LinkButton>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto bg-panel p-4 sm:p-6">
          <div className="shrink-0 overflow-hidden rounded-xl border border-line bg-white shadow-sm" style={{ width: width * scale, height: height * scale }}>
            <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <div style={{ height: "100%", overflowY: "auto" }}>
                <SectionErrorBoundary>{renderLibrarySection(section, DEFAULT_SECTION_THEME, device === "mobile")}</SectionErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPrompt(s: LibrarySection): string {
  // Same universal prompt the logged-in Section Library exports — includes the
  // section's full reference code, theme block, anatomy and deliverable spec.
  return buildExportPrompt(s, DEFAULT_SECTION_THEME, { tool: "any", format: "universal", scope: "section" });
}

export function PublicLibrary({ sections }: { sections: LibrarySection[] }) {
  const [active, setActive] = useState<SectionLibraryCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [fullView, setFullView] = useState<LibrarySection | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(
    () => SECTION_LIBRARY_CATEGORIES
      .map((c) => ({ cat: c, count: sections.filter((s) => s.category === c).length }))
      .filter((c) => c.count > 0),
    [sections],
  );

  const copyPrompt = async (s: LibrarySection) => {
    try {
      await navigator.clipboard.writeText(buildPrompt(s));
      setCopiedId(s.id);
      setTimeout(() => setCopiedId((c) => (c === s.id ? null : c)), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections.filter((s) => {
      if (active !== "all" && s.category !== active) return false;
      if (!q) return true;
      return [s.name, s.description, ...s.tags].join(" ").toLowerCase().includes(q);
    });
  }, [sections, active, query]);

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-line bg-canvas">
        <div className="px-5 pb-10 pt-28 sm:px-10 sm:pt-32">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Section Library</p>
          <h1 className="font-bold tracking-tight text-[clamp(1.6rem,5vw,2.6rem)] leading-[1.1] lg:whitespace-nowrap">
            Browse production-ready sections.
          </h1>
          <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-muted">
            Every section is themeable, responsive and export-ready. Pick a category, drop it into a project, and adapt it to your brand.
          </p>
        </div>
      </div>

      <div className="flex gap-10 px-5 py-12 sm:px-10">
        {/* Sidebar filter */}
        <aside className="sticky top-[90px] hidden h-max w-56 shrink-0 lg:block">
          <div className="relative mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections"
              className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-2.5 text-faint">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Categories</p>
          <nav className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setActive("all")}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors ${active === "all" ? "bg-accent-soft font-medium text-accent" : "text-body hover:bg-panel"}`}
            >
              All sections <span className="text-xs text-faint">{sections.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.cat}
                type="button"
                onClick={() => setActive(c.cat)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm capitalize transition-colors ${active === c.cat ? "bg-accent-soft font-medium text-accent" : "text-body hover:bg-panel"}`}
              >
                {c.cat} <span className="text-xs text-faint">{c.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {/* Mobile category chips */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <button type="button" onClick={() => setActive("all")} className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] capitalize ${active === "all" ? "bg-accent text-white" : "border border-line text-body"}`}>All</button>
            {categories.map((c) => (
              <button key={c.cat} type="button" onClick={() => setActive(c.cat)} className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] capitalize ${active === c.cat ? "bg-accent text-white" : "border border-line text-body"}`}>{c.cat}</button>
            ))}
          </div>

          <p className="mb-5 text-sm text-muted">{items.length} section{items.length === 1 ? "" : "s"}</p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((s) => (
              <div key={s.id} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(8,9,10,0.03)]">
                <div role="button" tabIndex={0} onClick={() => setFullView(s)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFullView(s); } }} className="cursor-pointer px-3 pt-3" aria-label={`Full view of ${s.name}`}>
                  <CardThumb section={s} />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-ink">{s.name}</span>
                    <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted">{s.category}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setFullView(s)}>
                      <svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
                      Full view
                    </Button>
                    <Button variant="secondary" onClick={() => copyPrompt(s)}>
                      {copiedId === s.id ? (
                        <><svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="text-success">Copied</span></>
                      ) : (
                        <><svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>Copy prompt</>
                      )}
                    </Button>
                    <LinkButton href="/signup" size="sm" variant="secondary" className="ml-auto shrink-0">Use</LinkButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line py-20 text-center text-muted">No sections match your search.</div>
          )}
        </div>
      </div>

      {/* Full-page view modal — device toggle + scaled preview (same as the app) */}
      {fullView && (
        <PreviewModule section={fullView} onClose={() => setFullView(null)} onCopy={() => copyPrompt(fullView)} copied={copiedId === fullView.id} />
      )}
    </div>
  );
}
