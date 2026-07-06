"use client";

// Manual Section Library — the user-facing flow (Phase 1).
//
//   Browse ready sections → Preview (desktop/tablet/mobile/full) → Add to page.
//
// No uploads, no AI, no model/debug output. Previews render the SAME catalog
// component the editor uses, themed with the project's approved style tokens, so
// "what you preview is what you add". The admin AI panel (reference-image →
// section) is injected only when ENABLE_REFERENCE_AI_ADMIN=true.

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { SectionTheme } from "@/components/sections/types";
import type { StyleGuideCanvas } from "@/lib/canvas";
import { SectionErrorBoundary, renderLibrarySection as renderSection } from "@/components/section-library/section-render";
import { ExportModal } from "@/components/section-library/export-modal";
import {
  SECTION_LIBRARY_CATEGORIES, type LibrarySection, type SectionLibraryCategory,
} from "@/lib/section-library/manual-sections";
import {
  addLibrarySectionToPageAction, deleteAdminSectionAction,
} from "@/app/(app)/projects/[id]/editor/actions";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };

// ── Thumbnail: renders the section at a real page width inside a browser-window
//    frame, top-aligned and scaled to fill the width — like a live site preview.
//    Page-grey shows beneath the section so short sections read intentionally,
//    giving a consistent, professional gallery. ──
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
      {/* Grey well behind the white device, inset with white padding on the card. */}
      <div ref={vpRef} className="relative h-[212px] w-full overflow-hidden rounded-xl border border-line bg-white">
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: BASE, transform: `scale(${scale})` }}>
          <SectionErrorBoundary>{renderSection(section, theme, false)}</SectionErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// ── Full preview module with device toggle + loading/error states. ──
function PreviewModule({
  section, theme, pages, projectId, onClose,
}: {
  section: LibrarySection; theme: SectionTheme;
  pages: { id: string; name: string }[]; projectId: string; onClose: () => void;
}) {
  const router = useRouter();
  const [device, setDevice] = useState<Device>("desktop");
  const [pageId, setPageId] = useState(pages[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const width = DEVICE_WIDTH[device];
  const mobile = device === "mobile";

  const add = () => {
    setMsg(null);
    start(async () => {
      const res = await addLibrarySectionToPageAction(projectId, pageId, section.id);
      if (res.error) { setMsg(res.error); return; }
      setMsg("Added to the page — opening the editor…");
      setTimeout(() => router.push(`/projects/${projectId}/editor`), 650);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header: title + device toggle + close. */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-ink">{section.name}</h3>
            <p className="truncate text-[12px] text-muted">{section.category} · {section.layoutType}</p>
          </div>
          <div className="ml-auto inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
            {(Object.keys(DEVICE_WIDTH) as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                aria-pressed={device === d}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                  device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                <DeviceIcon device={d} />
                <span className="hidden sm:inline">{d}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close preview" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Canvas: the section at the chosen device width. */}
        <div className="min-h-0 flex-1 overflow-auto bg-panel p-4 sm:p-6">
          <div
            className="mx-auto bg-white transition-[width] duration-300"
            style={{ width: width ? `${width}px` : "100%", maxWidth: "100%" }}
          >
            <div className={width && width < 1280 ? "overflow-hidden rounded-xl border border-line shadow-sm" : ""}>
              <SectionErrorBoundary key={device}>{renderSection(section, theme, mobile)}</SectionErrorBoundary>
            </div>
          </div>
        </div>

        {/* Add-to-page bar. */}
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
          {pages.length > 0 ? (
            <label className="flex items-center gap-2 text-[12.5px] text-muted">
              Add to
              <select value={pageId} onChange={(e) => setPageId(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink">
                {pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          ) : (
            <span className="text-[12.5px] text-muted">Confirm your sitemap first to add sections to a page.</span>
          )}
          {msg && <span className="text-[12.5px] text-muted">{msg}</span>}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={add} disabled={pending || pages.length === 0}>
              <svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              {pending ? "Adding…" : "Add section"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionLibraryClient({
  projectId, projectName, sections, pages, style, isAdmin = false, currentUserId,
}: {
  projectId: string;
  projectName: string;
  sections: LibrarySection[];
  pages: { id: string; name: string }[];
  style?: StyleGuideCanvas | null;
  isAdmin?: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [, startNav] = useTransition();
  const theme = useMemo(() => createSectionTheme(style ?? undefined), [style]);
  const [cat, setCat] = useState<SectionLibraryCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const [exportSel, setExportSel] = useState<LibrarySection | null>(null);
  const [selected, setSelected] = useState<LibrarySection | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const studio = (path = "") => `/projects/${projectId}/references/studio${path}`;

  // Admins can manage every catalog item; other users only what they created.
  const canManage = (s: LibrarySection) =>
    s.origin === "catalog" &&
    (isAdmin || (!!s.createdByUserId && s.createdByUserId === currentUserId));

  const del = (id: string) => {
    setMenuId(null);
    startNav(async () => { await deleteAdminSectionAction(projectId, id); router.refresh(); });
  };

  const usedCategories = useMemo(
    () => SECTION_LIBRARY_CATEGORIES.filter((c) => sections.some((s) => s.category === c)),
    [sections],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [sections, cat, query]);

  return (
    <div className="min-h-full bg-panel">
      <PageContainer>
        {/* Floating pill header — title + count on the left, search + New on the
            right. Sticky so actions stay reachable while browsing. */}
        <div className="sticky top-0 z-20 -mx-5 flex flex-wrap items-center justify-between gap-3 bg-panel/85 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface px-1.5 py-1 shadow-sm">
            <Link href={`/projects/${projectId}`} title="Back to project" aria-label="Back to project" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <span className="mx-0.5 h-5 w-px bg-line" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /></svg>
            <span className="pl-0.5 text-[14px] font-semibold text-ink">Section Library</span>
            <span className="ml-0.5 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-muted">{visible.length}</span>
            <span className="pr-1.5" />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-1 pl-1 shadow-sm">
            <div className="relative">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections…"
                aria-label="Search sections"
                className="w-40 rounded-lg bg-transparent py-1.5 pl-8 pr-2 text-[13px] text-ink outline-none placeholder:text-faint focus:bg-panel sm:w-52"
              />
            </div>
            <Link href={studio()}>
              <Button className="h-8 px-3 text-[13px]">
                <svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                New section
              </Button>
            </Link>
          </div>
        </div>

        {/* Category filter. */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
          {usedCategories.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
          ))}
        </div>

      {/* Section grid. */}
      {visible.length === 0 ? (
        <div className="card mt-6 grid place-items-center px-6 py-16 text-center text-[13px] text-muted">
          {query ? `No sections match “${query}”.` : "No sections in this category yet."}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <div key={s.id} className="card group relative flex flex-col overflow-hidden p-0">
              {/* Draft/archived badge (admins see non-ready custom sections). */}
              {s.status !== "ready" && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-warning-soft px-2 py-0.5 text-[10.5px] font-semibold capitalize text-warning">{s.status}</span>
              )}
              {/* Per-section actions — only for items the user can manage
                  (admins on admin items, or the creator). Others get Preview+Add. */}
              {canManage(s) && (
                <div className="absolute right-2 top-2 z-10">
                  <button
                    type="button"
                    aria-label="Section options"
                    onClick={() => setMenuId((v) => (v === s.id ? null : s.id))}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur hover:text-ink"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="19" r="1.6" fill="currentColor" /></svg>
                  </button>
                  {menuId === s.id && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setMenuId(null)} />
                      <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
                        <MenuLink href={studio(`/${s.id}`)} onClick={() => setMenuId(null)} icon="M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8-18h3a2 2 0 0 1 2 2v3m0 8v3a2 2 0 0 1-2 2h-3">Edit design</MenuLink>
                        <MenuLink href={`/projects/${projectId}/references/${s.id}/edit`} onClick={() => setMenuId(null)} icon="M4 20h4L18.5 9.5a2 2 0 0 0 0-3l-1-1a2 2 0 0 0-3 0L4 16v4Z">Edit content</MenuLink>
                        <MenuButton danger onClick={() => del(s.id)} icon="M5 7h14M10 7V5h4v2m-6 0 .7 12h6.6L18 7">Delete</MenuButton>
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
                  <Button variant="secondary" onClick={() => setSelected(s)} aria-label="Add to page" title="Add to page" className="px-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
                  </Button>
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
        </div>
      )}

      {selected && (
        <PreviewModule
          section={selected}
          theme={theme}
          pages={pages}
          projectId={projectId}
          onClose={() => setSelected(null)}
        />
      )}

      {exportSel && (
        <ExportModal section={exportSel} theme={theme} onClose={() => setExportSel(null)} />
      )}
      </PageContainer>
    </div>
  );
}

function MenuIcon({ d }: { d: string }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function MenuLink({ href, onClick, icon, children }: { href: string; onClick: () => void; icon: string; children: ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-ink hover:bg-panel">
      <MenuIcon d={icon} />{children}
    </Link>
  );
}
function MenuButton({ onClick, icon, danger, children }: { onClick: () => void; icon: string; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] ${danger ? "text-danger hover:bg-danger-soft/40" : "text-ink hover:bg-panel"}`}>
      <MenuIcon d={icon} />{children}
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function DeviceIcon({ device }: { device: Device }) {
  if (device === "desktop") {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="4" width="19" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><path d="M9 20h6M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  }
  if (device === "tablet") {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="2.5" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  }
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6.5" y="2.5" width="11" height="19" rx="2.2" stroke="currentColor" strokeWidth="1.6" /><path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
