"use client";

// Standalone Section Library catalog — browse, create, edit and delete sections
// with NO project required. Cards mirror the in-project library gallery: a
// framed, full-colour live preview in a grey well, name + category, and actions.

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import type { SectionTheme } from "@/components/sections/types";
import type { LibrarySection } from "@/lib/section-library/manual-sections";
import { SECTION_LIBRARY_CATEGORIES } from "@/lib/section-library/manual-sections";
import { DEFAULT_SECTION_THEME } from "@/components/sections/section-theme";
import { SectionErrorBoundary, renderLibrarySection as renderSection } from "@/components/section-library/section-render";
import { ExportModal } from "@/components/section-library/export-modal";
import { deleteLibrarySectionAction } from "@/app/(app)/library/actions";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };

// Framed, full-colour live preview — grey well, white device, scaled to width.
function CardThumb({ section, theme }: { section: LibrarySection; theme: SectionTheme }) {
  const BASE = 1440;
  const vpRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.24);
  useEffect(() => {
    const compute = () => setScale((vpRef.current?.clientWidth ?? 340) / BASE);
    compute();
    const ro = new ResizeObserver(compute);
    if (vpRef.current) ro.observe(vpRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="pointer-events-none overflow-hidden rounded-2xl bg-line/60 p-4">
      <div ref={vpRef} className="relative h-[212px] w-full overflow-hidden rounded-xl border border-line bg-white">
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: BASE, transform: `scale(${scale})` }}>
          <SectionErrorBoundary>{renderSection(section, theme, false)}</SectionErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// View-only full preview with a device toggle.
function PreviewModule({ section, theme, onClose, publicMode = false }: { section: LibrarySection; theme: SectionTheme; onClose: () => void; publicMode?: boolean }) {
  const [device, setDevice] = useState<Device>("desktop");
  const width = DEVICE_WIDTH[device];
  // Scale the true-width device down to fit the modal so the whole section shows.
  const areaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledH, setScaledH] = useState<number | undefined>(undefined);
  useEffect(() => {
    const measure = () => {
      // Subtract the area's p-6 padding (48px) so the scaled width fits with no side scroll.
      const avail = (areaRef.current?.clientWidth ?? width) - 48;
      const s = Math.min(1, avail / width);
      setScale(s);
      const h = contentRef.current?.offsetHeight;
      if (h) setScaledH(h * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (areaRef.current) ro.observe(areaRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [width, device, section]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-ink">{section.name}</h3>
            <p className="truncate text-[12px] text-muted capitalize">{section.category} · {section.layoutType}</p>
          </div>
          <div className="ml-auto inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
            {(Object.keys(DEVICE_WIDTH) as Device[]).map((d) => (
              <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
                className={`rounded-full px-2.5 py-1.5 text-[12px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{d}</button>
            ))}
          </div>
          {!publicMode && (
            <Link href={`/library/preview/${section.id}`} title="Open full-page preview (real scroll)" className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-medium text-ink hover:bg-panel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-8 8M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Full page
            </Link>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div ref={areaRef} className="flex flex-1 flex-col overflow-auto bg-panel p-6" style={{ minHeight: 400 }}>
          {/* m-auto centers short sections (no empty gap); tall ones top-align + scroll.
              overflow-hidden clips the true-width (unscaled) child so no side scroll. */}
          <div className="m-auto overflow-hidden" style={{ width: width * scale, height: scaledH }}>
            <div ref={contentRef} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm" style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <SectionErrorBoundary>{renderSection(section, theme, device === "mobile")}</SectionErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LibraryCatalogClient({
  sections, isAdmin, currentUserId = "", publicMode = false,
}: {
  sections: LibrarySection[];
  isAdmin: boolean;
  currentUserId?: string;
  /** Public marketing mode: read-only, no dashboard/studio actions. */
  publicMode?: boolean;
}) {
  const router = useRouter();
  // Library previews are ALWAYS the default brand theme — never a project's
  // branding — so the catalog looks consistent no matter which project you're in.
  const theme = DEFAULT_SECTION_THEME;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<LibrarySection | null>(null);
  const [exportSel, setExportSel] = useState<LibrarySection | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [menuId, setMenuId] = useState<string | null>(null);
  const [, start] = useTransition();

  const cats = useMemo(
    () => ["all", ...SECTION_LIBRARY_CATEGORIES.filter((c) => sections.some((s) => s.category === c))],
    [sections],
  );
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sections.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (!needle) return true;
      return [s.name, s.description, ...s.tags].join(" ").toLowerCase().includes(needle);
    });
  }, [sections, q, cat]);

  const canManage = (s: LibrarySection) => !publicMode && (isAdmin || (!!s.createdByUserId && s.createdByUserId === currentUserId));
  const toggleSave = (id: string) => setSaved((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const del = (s: LibrarySection) => {
    setMenuId(null);
    if (!confirm(`Delete "${s.name}"? This can't be undone.`)) return;
    start(async () => { await deleteLibrarySectionAction(s.id); router.refresh(); });
  };

  return (
    <div className={`min-h-full bg-panel ${publicMode ? "pt-[70px]" : ""}`}>
      <PageContainer>
        {/* Floating pill header — title + count on the left, search + New on the right. */}
        <div className={`sticky z-20 -mx-5 flex flex-wrap items-center justify-between gap-3 bg-panel/85 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 ${publicMode ? "top-[70px]" : "top-0"}`}>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface px-1.5 py-1 shadow-sm">
            {!publicMode && (
              <>
                <Link href="/dashboard" title="Back to dashboard" aria-label="Back to dashboard" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <span className="mx-0.5 h-5 w-px bg-line" />
              </>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /></svg>
            <span className="pl-0.5 text-[14px] font-semibold text-ink">Section Library</span>
            <span className="ml-0.5 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-muted">{sections.length}</span>
            <span className="pr-1.5" />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-1 pl-1 shadow-sm">
            <div className="relative">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sections…" aria-label="Search sections" className="w-40 rounded-lg bg-transparent py-1.5 pl-8 pr-2 text-[13px] text-ink outline-none placeholder:text-faint focus:bg-panel sm:w-52" />
            </div>
            {publicMode ? (
              <Link href="/signup">
                <Button className="h-8 px-3 text-[13px]">
                  Get started
                  <svg className="-mr-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Button>
              </Link>
            ) : (
              <Link href="/library/studio">
                <Button className="h-8 px-3 text-[13px]">
                  <svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  New section
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Category filter. */}
        {sections.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${cat === c ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-muted hover:text-ink"}`}>{c === "all" ? "All" : c}</button>
            ))}
          </div>
        )}

        {sections.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-20 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="3.5" y="14.5" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.7" /></svg>
            </span>
            <h3 className="mt-5 text-lg font-semibold">No sections yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted">Build your library one section at a time in the Studio — write React/TSX, preview live, and save.</p>
            <LinkButton href="/library/studio" size="lg" className="mt-6">Create your first section</LinkButton>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => (
                <div key={s.id} className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                  {s.status !== "ready" && (
                    <span className="absolute left-5 top-5 z-10 rounded-full bg-warning-soft px-2 py-0.5 text-[10.5px] font-semibold capitalize text-warning">{s.status}</span>
                  )}
                  {canManage(s) && (
                    <div className="absolute right-2 top-2 z-10">
                      <button type="button" aria-label="Section options" onClick={() => setMenuId((v) => (v === s.id ? null : s.id))} className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur hover:text-ink">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="19" r="1.6" fill="currentColor" /></svg>
                      </button>
                      {menuId === s.id && (
                        <>
                          <div className="fixed inset-0 z-0" onClick={() => setMenuId(null)} />
                          <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
                            <Link href={`/library/studio/${s.id}`} onClick={() => setMenuId(null)} className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink hover:bg-panel">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8-18h3a2 2 0 0 1 2 2v3m0 8v3a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                              Edit design
                            </Link>
                            <button type="button" onClick={() => del(s)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-danger hover:bg-danger-soft">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5h4v2m-6 0 .7 12h6.6L18 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="px-3 pt-3">
                    <CardThumb section={s} theme={theme} />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink">{s.name}</span>
                      <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted">{s.category}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="secondary" onClick={() => setSelected(s)}>
                        <svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
                        Preview
                      </Button>
                      {canManage(s) && (
                        <Link href={`/library/studio/${s.id}`} title="Edit in Studio" aria-label="Edit in Studio" className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted hover:text-ink">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2V20z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                        </Link>
                      )}
                      <Button variant="secondary" onClick={() => toggleSave(s.id)} aria-label={saved.has(s.id) ? "Saved" : "Save"} aria-pressed={saved.has(s.id)} title="Save" className="px-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved.has(s.id) ? "currentColor" : "none"} className={saved.has(s.id) ? "text-accent" : ""}><path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4.2L5.5 20V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                      </Button>
                      <Button variant="secondary" onClick={() => setExportSel(s)} aria-label="Export prompt" title="Export prompt for any AI tool" className="px-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M12 3 8 7M12 3l4 4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="col-span-full py-10 text-center text-[13px] text-faint">No sections match.</p>}
            </div>
          </>
        )}

        {selected && <PreviewModule section={selected} theme={theme} onClose={() => setSelected(null)} publicMode={publicMode} />}
        {exportSel && <ExportModal section={exportSel} theme={theme} onClose={() => setExportSel(null)} />}
      </PageContainer>
    </div>
  );
}
