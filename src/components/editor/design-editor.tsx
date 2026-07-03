"use client";

// Visual Design Editor. Four editable canvases — Sitemap, Wireframe, Style
// Guide, Design — whose state is the source of truth for MD generation. Edits
// (add/remove/rename/reorder/notes/source/approval) are saved as JSON canvas
// files. Scope: editable cards + move up/down (no full drag-and-drop yet).

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sectionKind } from "./wireframe-block";
import { Drawer, Popover } from "./overlays";
import { ProjectCanvas } from "./project-canvas";
import { SECTION_CATEGORIES, suggestSectionsForPage } from "@/lib/sections";
import { getSectionVariants, sectionTypeForKind, getBestVariantId, getSectionComponent } from "@/components/sections/registry";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { SectionTheme, SectionComponent, SectionType } from "@/components/sections/types";
import type { SectionContext } from "@/lib/sections";
import type { SectionPattern } from "@/lib/references/types";
import { searchElements, groupElements } from "@/lib/element-library/search";
import { recommendElements } from "@/lib/element-library/recommendations";
import { isReady } from "@/lib/element-library/registry";
import { KIND_LABEL, KIND_BADGE } from "@/lib/element-library/categories";
import { ELEMENT_ICONS } from "./element-icons";
import { EDITABLE_PARTS } from "@/components/sections/blocks/parts";
import type { ElementItem, ElementLibraryContext } from "@/lib/element-library/types";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  SitemapCanvas,
  StyleGuideCanvas,
  CanvasPage,
  CanvasSection,
  CanvasColor,
  CanvasSource,
  PageCategory,
  SectionStatus,
} from "@/lib/canvas";

type Approvals = { sitemap: boolean; wireframe: boolean; style: boolean; design: boolean };
type Tab = "sitemap" | "wireframe" | "style" | "design";

const SOURCE_CYCLE: CanvasSource[] = [
  "detected",
  "reference-inspired",
  "AI-suggested",
  "user-added",
  "extracted",
  "vision-detected",
  "assumed",
];
const SOURCE_STYLE: Record<string, string> = {
  extracted: "bg-success-soft text-success",
  detected: "bg-success-soft text-success",
  "vision-detected": "bg-info-soft text-info",
  "reference-inspired": "bg-info-soft text-info",
  "user-added": "bg-accent-soft text-accent",
  "AI-suggested": "bg-warning-soft text-warning",
  assumed: "bg-panel text-muted",
};

function SourceTag({ source, onClick }: { source: CanvasSource; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={onClick ? "Click to change source label" : undefined}
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_STYLE[source] ?? "bg-panel text-muted"} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
    >
      {source}
    </button>
  );
}

const uid = (p = "n") =>
  typeof crypto !== "undefined" && crypto.randomUUID ? `${p}-${crypto.randomUUID().slice(0, 8)}` : `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;


export function DesignEditor({
  projectId,
  projectName,
  initialSitemap,
  initialStyle,
  features = [],
  siteContext = {},
  referencePatterns = [],
  approvals: initialApprovals,
  saveSitemap,
  saveStyle,
  approveStage,
}: {
  projectId: string;
  projectName: string;
  initialSitemap: SitemapCanvas;
  initialStyle: StyleGuideCanvas;
  features?: string[];
  siteContext?: SectionContext;
  referencePatterns?: SectionPattern[];
  approvals: Approvals;
  saveSitemap: (projectId: string, canvas: SitemapCanvas) => Promise<{ error?: string }>;
  saveStyle: (projectId: string, canvas: StyleGuideCanvas) => Promise<{ error?: string }>;
  approveStage: (projectId: string, stage: string) => Promise<{ error?: string }>;
}) {
  const [tab, setTab] = useState<Tab>("sitemap");
  // Base context for Add-Elements recommendations (enriched per page downstream).
  const recommendCtx: ElementLibraryContext = {
    websiteType: siteContext.websiteType,
    industry: siteContext.industry,
    goals: siteContext.goals,
  };
  const [pages, setPagesState] = useState<CanvasPage[]>(initialSitemap.pages);
  const [style, setStyleState] = useState<StyleGuideCanvas>(initialStyle);
  const [approvals, setApprovals] = useState<Approvals>(initialApprovals);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialSitemap.pages[0]?.id ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();

  // Simple undo/redo history over the editable state.
  const history = useRef<{ pages: CanvasPage[]; style: StyleGuideCanvas }[]>([]);
  const future = useRef<{ pages: CanvasPage[]; style: StyleGuideCanvas }[]>([]);
  const snapshot = useCallback(() => {
    history.current.push({ pages, style });
    if (history.current.length > 50) history.current.shift();
    future.current = [];
  }, [pages, style]);

  const setPages = (updater: (p: CanvasPage[]) => CanvasPage[]) => {
    snapshot();
    setPagesState((p) => updater(p));
    setDirty(true);
  };
  const setStyle = (updater: (s: StyleGuideCanvas) => StyleGuideCanvas) => {
    snapshot();
    setStyleState((s) => updater(s));
    setDirty(true);
  };
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    future.current.push({ pages, style });
    setPagesState(prev.pages);
    setStyleState(prev.style);
    setDirty(true);
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push({ pages, style });
    setPagesState(next.pages);
    setStyleState(next.style);
    setDirty(true);
  };

  const save = () =>
    startSave(async () => {
      await saveSitemap(projectId, { pages, approved: approvals.sitemap });
      await saveStyle(projectId, style);
      setDirty(false);
    });

  const approve = (stage: Tab) =>
    startSave(async () => {
      await saveSitemap(projectId, { pages, approved: stage === "sitemap" ? true : approvals.sitemap });
      await saveStyle(projectId, { ...style, approved: stage === "style" ? true : style.approved });
      await approveStage(projectId, stage);
      setApprovals((a) => ({ ...a, [stage]: true }));
      setDirty(false);
    });

  // ---- Page mutators ----
  const addPage = () =>
    setPages((p) => [...p, { id: uid("p"), name: `New page ${p.length + 1}`, source: "user-added", sections: [] }]);
  const removePage = (id: string) => setPages((p) => p.filter((x) => x.id !== id));
  const renamePage = (id: string, name: string) => setPages((p) => p.map((x) => (x.id === id ? { ...x, name } : x)));
  const patchPageMeta = (id: string, patch: Partial<CanvasPage>) =>
    setPages((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const cyclePageSource = (id: string) =>
    setPages((p) => p.map((x) => (x.id === id ? { ...x, source: nextSource(x.source) } : x)));
  const duplicatePage = (id: string) =>
    setPages((p) => {
      const src = p.find((x) => x.id === id);
      if (!src) return p;
      const copy: CanvasPage = {
        ...src,
        id: uid("p"),
        name: `${src.name} copy`,
        source: "user-added",
        x: (src.x ?? 0) + 40,
        y: (src.y ?? 0) + 40,
        sections: src.sections.map((s) => ({ ...s, id: uid("s") })),
      };
      const i = p.findIndex((x) => x.id === id);
      return [...p.slice(0, i + 1), copy, ...p.slice(i + 1)];
    });
  const movePagePos = useCallback((id: string, x: number, y: number) => {
    setPagesState((p) => p.map((n) => (n.id === id ? { ...n, x, y } : n)));
    setDirty(true);
  }, []);

  // ---- Section mutators (scoped to a page) ----
  const patchPage = (pageId: string, fn: (pg: CanvasPage) => CanvasPage) =>
    setPages((p) => p.map((x) => (x.id === pageId ? fn(x) : x)));
  const addSection = (pageId: string, name: string, variant?: string) =>
    patchPage(pageId, (pg) => ({ ...pg, sections: [...pg.sections, { id: uid("s"), name, source: "user-added", variant }] }));
  const removeSection = (pageId: string, sid: string) =>
    patchPage(pageId, (pg) => ({ ...pg, sections: pg.sections.filter((s) => s.id !== sid) }));
  const patchSection = (pageId: string, sid: string, patch: Partial<CanvasSection>) =>
    patchPage(pageId, (pg) => ({ ...pg, sections: pg.sections.map((s) => (s.id === sid ? { ...s, ...patch } : s)) }));
  const reorderSections = (pageId: string, activeId: string, overId: string) =>
    patchPage(pageId, (pg) => {
      const from = pg.sections.findIndex((s) => s.id === activeId);
      const to = pg.sections.findIndex((s) => s.id === overId);
      if (from < 0 || to < 0 || from === to) return pg;
      return { ...pg, sections: arrayMove(pg.sections, from, to) };
    });
  const moveSection = (pageId: string, sid: string, dir: -1 | 1) =>
    patchPage(pageId, (pg) => {
      const i = pg.sections.findIndex((s) => s.id === sid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= pg.sections.length) return pg;
      return { ...pg, sections: arrayMove(pg.sections, i, j) };
    });
  // Auto-create the wireframe for a page: seed AI-suggested sections (from the
  // page type + selected features) for any that aren't already present.
  const autoWireframe = (pageId: string) =>
    patchPage(pageId, (pg) => {
      const existing = new Set(pg.sections.map((s) => s.name.toLowerCase()));
      const suggested = suggestSectionsForPage(pg.name, features)
        .filter((name) => !existing.has(name.toLowerCase()))
        .map((name) => ({ id: uid("s"), name, source: "AI-suggested" as const }));
      return { ...pg, sections: [...pg.sections, ...suggested] };
    });
  const duplicateSection = (pageId: string, sid: string) =>
    patchPage(pageId, (pg) => {
      const i = pg.sections.findIndex((s) => s.id === sid);
      if (i < 0) return pg;
      const copy = { ...pg.sections[i], id: uid("s"), name: `${pg.sections[i].name} copy` };
      return { ...pg, sections: [...pg.sections.slice(0, i + 1), copy, ...pg.sections.slice(i + 1)] };
    });

  // ---- Sitemap board helpers ----
  const recommendedFor = (pg: CanvasPage): CanvasSection[] => {
    const existing = new Set(pg.sections.map((s) => sectionKind(s.name)));
    return suggestSectionsForPage(pg.name, features, siteContext)
      .filter((name) => !existing.has(sectionKind(name)))
      .map((name) => {
        const kind = sectionKind(name);
        // Pick the best-fit Elementor-style variant for this site context.
        const variant = getBestVariantId(sectionTypeForKind(kind), siteContext);
        return { id: uid("s"), name, source: "AI-suggested" as const, status: "draft" as const, variant };
      });
  };
  const addPageInCategory = (category: CanvasPage["category"], parentId?: string) =>
    setPages((p) => [...p, { id: uid("p"), name: `New page ${p.length + 1}`, source: "user-added", category, parentId, sections: [] }]);
  // Generate recommended sections for ONE page (adds only missing kinds).
  const generatePage = (pageId: string) =>
    patchPage(pageId, (pg) => ({ ...pg, sections: [...pg.sections, ...recommendedFor(pg)] }));
  // Generate for every page that has no sections yet (never overwrites).
  const generateAllPages = () =>
    setPages((p) => p.map((pg) => (pg.sections.length ? pg : { ...pg, sections: recommendedFor(pg) })));
  // Apply a section marked global (Header/Footer) to every other page missing it.
  const applyGlobalToAll = (pageId: string, sid: string) =>
    setPages((p) => {
      const src = p.find((x) => x.id === pageId)?.sections.find((s) => s.id === sid);
      if (!src) return p;
      const kind = sectionKind(src.name);
      return p.map((pg) => {
        if (pg.id === pageId) return pg;
        if (pg.sections.some((s) => sectionKind(s.name) === kind)) return pg;
        const clone = { ...src, id: uid("s") };
        const sections = kind === "navbar" ? [clone, ...pg.sections] : [...pg.sections, clone];
        return { ...pg, sections };
      });
    });
  const markPageApproved = (pageId: string) =>
    patchPage(pageId, (pg) => ({ ...pg, status: "approved", sections: pg.sections.map((s) => ({ ...s, status: "approved" as const })) }));

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? pages[0];

  return (
    // Full-screen overlay so the app sidebar/topbar are hidden while editing.
    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-canvas">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/projects/${projectId}`} className="rounded-lg px-2 py-1 text-[13px] text-muted hover:bg-panel hover:text-ink">
            ← Project
          </Link>
          <span className="truncate text-sm font-semibold text-ink">{projectName}</span>
        </div>
        <nav className="flex items-center gap-1 rounded-full bg-panel p-1">
          {(["sitemap", "wireframe", "style", "design"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {TAB_LABEL[t]}
              {approvals[t] && <span className="text-[10px] text-success">✓</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-[12px] text-faint sm:inline">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <Button size="sm" variant="secondary" title="Section Reference Library — upload references, extract patterns" onClick={() => window.open(`/projects/${projectId}/references`, "_blank", "noreferrer")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="-ml-0.5">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.7" />
              <path d="m4.5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0L15 16.5m-1.5-1.5 1.7-1.7a1.5 1.5 0 0 1 2.1 0l2.2 2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            References
          </Button>
          <Button size="sm" variant="secondary" title="Open a full-page live preview (scroll animations work here)" onClick={() => window.open(`/preview/${projectId}?page=${selectedPageId}`, "_blank", "noreferrer")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="-ml-0.5">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            Live preview
          </Button>
          <Button size="sm" variant="secondary" disabled title="Coming soon">Export</Button>
          <Button size="sm" onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left toolbar */}
        <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3">
          <ToolBtn label="Add" onClick={tab === "wireframe" && selectedPage ? () => addSection(selectedPage.id, "New section") : addPage}>＋</ToolBtn>
          <ToolBtn label="Undo" onClick={undo} disabled={history.current.length === 0}>↶</ToolBtn>
          <ToolBtn label="Redo" onClick={redo} disabled={future.current.length === 0}>↷</ToolBtn>
          <div className="mt-auto" />
          <ToolBtn label="Help" disabled>?</ToolBtn>
        </aside>

        {/* Canvas + optional left panel */}
        <main className="min-w-0 flex-1 overflow-auto bg-canvas">
          {tab === "sitemap" && (
            <SitemapEditor
              pages={pages}
              schemes={style.colors}
              previewTheme={createSectionTheme(style)}
              referencePatterns={referencePatterns}
              recommendCtx={recommendCtx}
              onAddPage={addPageInCategory}
              onRemovePage={removePage}
              onRenamePage={renamePage}
              onDuplicatePage={duplicatePage}
              onPatchPageMeta={patchPageMeta}
              onAddSection={addSection}
              onRemoveSection={removeSection}
              onPatchSection={patchSection}
              onMoveSection={moveSection}
              onDuplicateSection={duplicateSection}
              onGeneratePage={generatePage}
              onGenerateAll={generateAllPages}
              onApplyGlobal={applyGlobalToAll}
              onMarkApproved={markPageApproved}
              onOpenWireframe={(id) => { setSelectedPageId(id); setTab("wireframe"); }}
              approved={approvals.sitemap}
              onApprove={() => approve("sitemap")}
              busy={saving}
            />
          )}

          {tab === "wireframe" && (
            <WireframeEditor
              pages={pages}
              selectedPage={selectedPage}
              style={style}
              referencePatterns={referencePatterns}
              recommendCtx={recommendCtx}
              onSelect={setSelectedPageId}
              onAddPage={addPage}
              onRenamePage={renamePage}
              onRemovePage={removePage}
              onDuplicatePage={duplicatePage}
              onCyclePageSource={cyclePageSource}
              onPatchPageMeta={patchPageMeta}
              onAddSection={addSection}
              onRemoveSection={removeSection}
              onPatchSection={patchSection}
              onMoveSection={moveSection}
              onDuplicateSection={duplicateSection}
              onAutoWireframe={autoWireframe}
              approved={approvals.wireframe}
              onApprove={() => approve("wireframe")}
              busy={saving}
            />
          )}

          {tab === "style" && (
            <StyleEditor
              style={style}
              setStyle={setStyle}
              approved={approvals.style}
              onApprove={() => approve("style")}
              busy={saving}
            />
          )}

          {tab === "design" && (
            <DesignTab
              pages={pages}
              selectedPage={selectedPage}
              style={style}
              onSelect={setSelectedPageId}
              onPatchSection={patchSection}
              onMoveSection={moveSection}
              onDuplicateSection={duplicateSection}
              onRemoveSection={removeSection}
              approved={approvals.design}
              onApprove={() => approve("design")}
              busy={saving}
            />
          )}
        </main>
      </div>
    </div>
  );
}

const TAB_LABEL: Record<Tab, string> = { sitemap: "Sitemap", wireframe: "Wireframe", style: "Style Guide", design: "Design" };

function nextSource(s: CanvasSource): CanvasSource {
  const i = SOURCE_CYCLE.indexOf(s);
  return SOURCE_CYCLE[(i + 1) % SOURCE_CYCLE.length];
}

function ToolBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-[16px] text-body hover:bg-panel disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ApproveBar({ approved, onApprove, busy, label }: { approved: boolean; onApprove: () => void; busy: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Button size="sm" onClick={onApprove} disabled={busy}>
        {busy ? "Saving…" : approved ? `Re-approve ${label}` : `Approve ${label}`}
      </Button>
      {approved && <span className="text-[12px] text-success">✓ Approved</span>}
    </div>
  );
}


// ------------------------------------------------ Sitemap (card/grid board)
// A clean page/section planning board (not a design canvas): page cards in a
// grid, each with ordered section rows, status badge, add-section + more menu.

const SITEMAP_CATEGORIES: { id: PageCategory; label: string }[] = [
  { id: "main", label: "Main Pages" },
  { id: "store", label: "Store Pages" },
  { id: "members", label: "Members Area" },
  { id: "auth", label: "Signup & Login" },
  { id: "custom", label: "Custom Pages" },
];

type PageStatus = "todo" | "in-progress" | "done" | "approved";
const PAGE_STATUS_STYLE: Record<PageStatus, string> = {
  todo: "bg-panel text-muted",
  "in-progress": "bg-warning-soft text-warning",
  done: "bg-success-soft text-success",
  approved: "bg-accent-soft text-accent",
};
const PAGE_STATUS_LABEL: Record<PageStatus, string> = { todo: "To do", "in-progress": "In progress", done: "Done", approved: "Approved" };

function pageStatusOf(p: CanvasPage, sitemapApproved: boolean): PageStatus {
  if (sitemapApproved || p.status === "approved") return "approved";
  if (p.sections.length === 0) return "todo";
  if (p.sections.every((s) => s.status === "approved")) return "done";
  return "in-progress";
}

// Clean line icon for the page-card header (home vs generic page).
function PageIcon({ home }: { home: boolean }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "shrink-0 text-muted" };
  return home ? (
    <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
  ) : (
    <svg {...common}><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M14 3v5h5" /></svg>
  );
}

// Small monitor glyph shown only on framed Header/Footer rows (like the ref).
function SectionFrameIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-success">
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 20h8M12 17v3" />
    </svg>
  );
}

function SitemapEditor({
  pages, schemes, previewTheme, referencePatterns, recommendCtx, onAddPage, onRemovePage, onRenamePage, onDuplicatePage, onPatchPageMeta,
  onAddSection, onRemoveSection, onPatchSection, onMoveSection, onDuplicateSection,
  onGeneratePage, onGenerateAll, onApplyGlobal, onMarkApproved, onOpenWireframe, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  schemes: CanvasColor[];
  previewTheme: SectionTheme;
  referencePatterns: SectionPattern[];
  recommendCtx: ElementLibraryContext;
  onAddPage: (category: PageCategory, parentId?: string) => void;
  onRemovePage: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
  onDuplicatePage: (id: string) => void;
  onPatchPageMeta: (id: string, patch: Partial<CanvasPage>) => void;
  onAddSection: (pageId: string, name: string, variant?: string) => void;
  onRemoveSection: (pageId: string, sid: string) => void;
  onPatchSection: (pageId: string, sid: string, patch: Partial<CanvasSection>) => void;
  onMoveSection: (pageId: string, sid: string, dir: -1 | 1) => void;
  onDuplicateSection: (pageId: string, sid: string) => void;
  onGeneratePage: (pageId: string) => void;
  onGenerateAll: () => void;
  onApplyGlobal: (pageId: string, sid: string) => void;
  onMarkApproved: (pageId: string) => void;
  onOpenWireframe: (id: string) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  const [cat, setCat] = useState<PageCategory>("main");
  const [addForPage, setAddForPage] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ pageId: string; sid: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = pages.filter((p) => (p.category ?? "main") === cat);
  const editSection = editing ? pages.find((p) => p.id === editing.pageId)?.sections.find((s) => s.id === editing.sid) ?? null : null;

  const zoomBy = (d: number) => setZoom((z) => Math.max(0.3, Math.min(1.5, +(z + d).toFixed(2))));
  const fit = () => {
    const c = scrollRef.current;
    if (!c) return;
    const natural = c.scrollWidth / zoom;
    setZoom(Math.max(0.3, Math.min(1, (c.clientWidth - 8) / natural)));
  };
  // Ctrl/⌘ + wheel (and trackpad pinch) zooms toward the cursor, like the canvas.
  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const offX = e.clientX - rect.left, offY = e.clientY - rect.top;
      const px = c.scrollLeft + offX, py = c.scrollTop + offY;
      setZoom((z) => {
        const nz = Math.max(0.3, Math.min(1.5, +(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)).toFixed(3)));
        const ratio = nz / z;
        requestAnimationFrame(() => { c.scrollLeft = px * ratio - offX; c.scrollTop = py * ratio - offY; });
        return nz;
      });
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-ink">Visual Sitemap</h2>
          <p className="text-[12.5px] text-muted">Plan every page and its sections. Add, reorder, edit and approve — then generate the wireframe.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onGenerateAll} title="Generate recommended sections for empty pages">✦ Generate sections for all pages</Button>
          <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="sitemap" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-5 flex items-center gap-1 border-b border-line">
        {SITEMAP_CATEGORIES.map((c) => {
          const count = pages.filter((p) => (p.category ?? "main") === c.id).length;
          const active = cat === c.id;
          return (
            <button key={c.id} type="button" onClick={() => setCat(c.id)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium ${active ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"}`}>
              {c.label}
              {count > 0 && <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-accent-soft text-accent" : "bg-panel text-faint"}`}>{count}</span>}
            </button>
          );
        })}
        <button type="button" onClick={() => onAddPage(cat)} className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] font-medium text-accent hover:bg-accent-soft">＋ Add page</button>
      </div>
      </div>

      {/* Zoomable / scrollable board area (Ctrl/⌘ + wheel zooms toward cursor). */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto px-6 pb-24">
      <div style={{ zoom } as React.CSSProperties}>
      {visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-[13px] text-muted">No pages in this category yet.</p>
          <button type="button" onClick={() => onAddPage(cat)} className="mt-3 rounded-lg border border-accent px-4 py-2 text-[13px] font-medium text-accent hover:bg-accent-soft">＋ Add a page</button>
        </div>
      ) : (
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <SitemapPageCard
              key={p.id}
              page={p}
              status={pageStatusOf(p, approved)}
              onAddSection={() => setAddForPage(p.id)}
              onEditSection={(sid) => setEditing({ pageId: p.id, sid })}
              onMoveSection={(sid, dir) => onMoveSection(p.id, sid, dir)}
              onRemoveSection={(sid) => onRemoveSection(p.id, sid)}
              onGenerate={() => onGeneratePage(p.id)}
              onDuplicate={() => onDuplicatePage(p.id)}
              onDelete={() => onRemovePage(p.id)}
              onRename={(name) => onRenamePage(p.id, name)}
              onMarkApproved={() => onMarkApproved(p.id)}
              onAddChild={() => onAddPage(p.category ?? "main", p.id)}
              onOpenWireframe={() => onOpenWireframe(p.id)}
              onSetStatus={(status) => onPatchPageMeta(p.id, { status })}
            />
          ))}
        </div>
      )}
      </div>
      </div>

      {/* Zoom controls pinned to the screen bottom, like the design/wireframe canvas */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-surface/95 p-1 shadow-lg backdrop-blur">
          <button type="button" onClick={() => zoomBy(-0.1)} className="grid h-7 w-7 place-items-center rounded-md text-body hover:bg-panel">−</button>
          <span className="w-11 text-center text-[12px] tabular-nums text-body">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomBy(0.1)} className="grid h-7 w-7 place-items-center rounded-md text-body hover:bg-panel">＋</button>
          <button type="button" onClick={fit} className="rounded-md px-2 py-1 text-[12px] font-medium text-body hover:bg-panel">Fit</button>
          <button type="button" onClick={() => setZoom(1)} className="rounded-md px-2 py-1 text-[12px] font-medium text-body hover:bg-panel">100%</button>
        </div>
      </div>

      {/* Add section drawer for the chosen page */}
      <AddSectionDrawer open={Boolean(addForPage)} previewTheme={previewTheme} patterns={referencePatterns} recommendCtx={{ ...recommendCtx, pageName: pages.find((p) => p.id === addForPage)?.name, presentKinds: pages.find((p) => p.id === addForPage)?.sections.map((s) => sectionTypeForKind(sectionKind(s.name))) }} onClose={() => setAddForPage(null)} onAdd={(name, keepOpen, variant) => { if (addForPage) onAddSection(addForPage, name, variant); if (!keepOpen) setAddForPage(null); }} />

      {/* Section edit drawer */}
      <Drawer open={Boolean(editSection)} onClose={() => setEditing(null)} title="Section" subtitle={editSection ? `Type: ${sectionKind(editSection.name)}` : undefined} width={340}>
        {editSection && editing && (
          <SectionSettingsContent
            section={editSection}
            schemes={schemes}
            onPatch={(patch) => onPatchSection(editing.pageId, editing.sid, patch)}
            onDuplicate={() => onDuplicateSection(editing.pageId, editing.sid)}
            onDelete={() => { onRemoveSection(editing.pageId, editing.sid); setEditing(null); }}
            onClose={() => setEditing(null)}
            onApplyGlobal={() => onApplyGlobal(editing.pageId, editing.sid)}
          />
        )}
      </Drawer>
    </div>
  );
}

function SitemapPageCard({
  page, status, onAddSection, onEditSection, onMoveSection, onRemoveSection,
  onGenerate, onDuplicate, onDelete, onRename, onMarkApproved, onAddChild, onOpenWireframe, onSetStatus,
}: {
  page: CanvasPage;
  status: PageStatus;
  onAddSection: () => void;
  onEditSection: (sid: string) => void;
  onMoveSection: (sid: string, dir: -1 | 1) => void;
  onRemoveSection: (sid: string) => void;
  onGenerate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onMarkApproved: () => void;
  onAddChild: () => void;
  onOpenWireframe: () => void;
  onSetStatus: (status: SectionStatus) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const isHome = /^home/i.test(page.name);
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface shadow-sm">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <PageIcon home={isHome} />
        {renaming ? (
          <input
            autoFocus defaultValue={page.name}
            onBlur={(e) => { onRename(e.target.value.trim() || page.name); setRenaming(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setRenaming(false); }}
            className="min-w-0 flex-1 rounded-md border border-accent px-1.5 py-0.5 text-[13.5px] font-semibold text-ink outline-none"
          />
        ) : (
          <button type="button" onDoubleClick={() => setRenaming(true)} onClick={onOpenWireframe} title="Open in wireframe (double-click to rename)" className="min-w-0 flex-1 truncate text-left text-[13.5px] font-semibold text-ink">{page.name}</button>
        )}
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${PAGE_STATUS_STYLE[status]}`}>{PAGE_STATUS_LABEL[status]}</span>
        <button type="button" onClick={onAddSection} title="Add section" className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[14px] text-accent hover:bg-accent-soft">＋</button>
        <SitemapPageMenu
          onGenerate={onGenerate} onAddChild={onAddChild} onDuplicate={onDuplicate}
          onRename={() => setRenaming(true)} onDelete={onDelete} onMarkApproved={onMarkApproved}
          onSetStatus={onSetStatus} status={page.status}
        />
      </div>

      {/* Section rows */}
      {page.sections.length === 0 ? (
        <div className="px-3 py-6 text-center">
          <p className="text-[12px] text-faint">No sections yet.</p>
          <button type="button" onClick={onGenerate} className="mt-2 text-[12px] font-medium text-accent hover:underline">✦ Generate sections</button>
        </div>
      ) : (
        <div className="grid gap-2 p-3">
          {page.sections.map((s, i) => (
            <SitemapSectionRow
              key={s.id} section={s} first={i === 0} last={i === page.sections.length - 1}
              onEdit={() => onEditSection(s.id)} onUp={() => onMoveSection(s.id, -1)} onDown={() => onMoveSection(s.id, 1)} onDelete={() => onRemoveSection(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SitemapSectionRow({ section, first, last, onEdit, onUp, onDown, onDelete }: {
  section: CanvasSection; first: boolean; last: boolean; onEdit: () => void; onUp: () => void; onDown: () => void; onDelete: () => void;
}) {
  const kind = sectionKind(section.name);
  const framed = kind === "navbar" || kind === "footer"; // Header/Footer carry an icon
  return (
    <div className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${framed ? "border-success/40" : "border-line hover:border-line-strong"}`}>
      {framed && <SectionFrameIcon />}
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 truncate text-left text-[13px] text-ink">
        {section.name}
        {section.global && <span className="ml-1.5 rounded bg-accent-soft px-1 py-0.5 text-[9px] font-medium text-accent">global</span>}
      </button>
      <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button type="button" onClick={onUp} disabled={first} className="px-0.5 text-[12px] text-faint hover:text-ink disabled:opacity-25">↑</button>
        <button type="button" onClick={onDown} disabled={last} className="px-0.5 text-[12px] text-faint hover:text-ink disabled:opacity-25">↓</button>
        <button type="button" onClick={onDelete} className="px-0.5 text-[12px] text-faint hover:text-danger">✕</button>
      </span>
    </div>
  );
}

function SitemapPageMenu({ onGenerate, onAddChild, onDuplicate, onRename, onDelete, onMarkApproved, onSetStatus, status }: {
  onGenerate: () => void; onAddChild: () => void; onDuplicate: () => void; onRename: () => void; onDelete: () => void; onMarkApproved: () => void;
  onSetStatus: (status: SectionStatus) => void; status?: SectionStatus;
}) {
  return (
    <Popover align="right" width={210} trigger={() => <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-faint hover:bg-panel hover:text-ink">⋯</span>}>
      {(close) => (
        <div className="grid gap-0.5 text-[12.5px]">
          <MenuItem onClick={() => { onGenerate(); close(); }}>✦ Generate sections</MenuItem>
          <MenuItem onClick={() => { onAddChild(); close(); }}>Add child page</MenuItem>
          <MenuItem onClick={() => { onDuplicate(); close(); }}>Duplicate page</MenuItem>
          <MenuItem onClick={() => { onRename(); close(); }}>Rename page</MenuItem>
          <div className="my-1 h-px bg-line" />
          <label className="px-2 text-[10px] font-semibold uppercase tracking-wide text-faint">Status</label>
          <div className="mx-1 flex gap-1">
            {(["draft", "approved", "rejected"] as const).map((st) => (
              <button key={st} type="button" onClick={() => onSetStatus(st)} className={`flex-1 rounded-md px-1 py-1 text-[10px] font-medium capitalize ${(status ?? "draft") === st ? SECTION_STATUS_STYLE[st] : "bg-panel text-muted"}`}>{st}</button>
            ))}
          </div>
          <MenuItem onClick={() => { onMarkApproved(); close(); }}>✓ Mark all approved</MenuItem>
          <div className="my-1 h-px bg-line" />
          <MenuItem onClick={() => { onDelete(); close(); }} danger>Delete page</MenuItem>
        </div>
      )}
    </Popover>
  );
}

// ----------------------------------------- Wireframe (real page canvas)

function WireframeEditor({
  pages, selectedPage, style, referencePatterns, recommendCtx, onSelect, onAddPage, onRenamePage, onRemovePage, onDuplicatePage, onCyclePageSource, onPatchPageMeta,
  onAddSection, onRemoveSection, onPatchSection, onMoveSection, onDuplicateSection, onAutoWireframe, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  selectedPage?: CanvasPage;
  style: StyleGuideCanvas;
  referencePatterns: SectionPattern[];
  recommendCtx: ElementLibraryContext;
  onSelect: (id: string) => void;
  onAddPage: () => void;
  onRenamePage: (id: string, name: string) => void;
  onRemovePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onCyclePageSource: (id: string) => void;
  onPatchPageMeta: (id: string, patch: Partial<CanvasPage>) => void;
  onAddSection: (pageId: string, name: string, variant?: string) => void;
  onRemoveSection: (pageId: string, sid: string) => void;
  onPatchSection: (pageId: string, sid: string, patch: Partial<CanvasSection>) => void;
  onMoveSection: (pageId: string, sid: string, dir: -1 | 1) => void;
  onDuplicateSection: (pageId: string, sid: string) => void;
  onAutoWireframe: (pageId: string) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const schemes = style.colors;

  if (!selectedPage) return <div className="p-6 text-[13px] text-muted">Add a page in the Sitemap first.</div>;
  const pageId = selectedPage.id;
  const sections = selectedPage.sections;
  const selected = sections.find((s) => s.id === selectedSectionId) ?? null;

  // Auto-select the newly added section (it is appended to the list).
  const prevLen = useRef(sections.length);
  useEffect(() => {
    if (sections.length > prevLen.current) setSelectedSectionId(sections[sections.length - 1]?.id ?? null);
    prevLen.current = sections.length;
  }, [sections]);

  const addSectionFromLibrary = (name: string, keepOpen: boolean, variant?: string) => {
    onAddSection(pageId, name, variant);
    if (!keepOpen) setAddOpen(false);
  };

  return (
    <div className="flex min-h-full">
      {/* ---------- Center: full-project canvas (all pages) ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/70 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-2">
            <PagesPopover
              pages={pages}
              activeId={pageId}
              onSelect={(id) => { onSelect(id); setSelectedSectionId(null); }}
              onAddPage={onAddPage}
              onRenamePage={onRenamePage}
              onDuplicatePage={onDuplicatePage}
              onRemovePage={onRemovePage}
              onCyclePageSource={onCyclePageSource}
              onPatchPageMeta={onPatchPageMeta}
            />
            <span className="text-[14px] font-semibold text-ink">Wireframe — all pages</span>
            <span className="text-[11.5px] text-muted">Selected: {selectedPage.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>＋ Add section</Button>
            <Button size="sm" variant="secondary" onClick={() => onAutoWireframe(pageId)} title="Seed the selected page's sections from its type + features">
              ✦ Auto-generate
            </Button>
            <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="wireframe" />
          </div>
        </div>

        <ProjectCanvas
          pages={pages}
          mode="wireframe"
          style={style}
          schemes={schemes}
          selectedPageId={pageId}
          selectedSectionId={selectedSectionId}
          onSelectPage={(id) => { onSelect(id); setSelectedSectionId(null); }}
          onSelectSection={(pid, sid) => { onSelect(pid); setSelectedSectionId(sid); }}
          onMoveSection={onMoveSection}
          onDuplicateSection={onDuplicateSection}
          onRemoveSection={(pid, sid) => { onRemoveSection(pid, sid); setSelectedSectionId(null); }}
          onEditText={(pid, sid, field, value) => onPatchSection(pid, sid, field === "title" ? { name: value } : { note: value })}
          onEditIcon={(pid, sid, icon) => onPatchSection(pid, sid, { icon })}
          onEditImage={(pid, sid, image) => onPatchSection(pid, sid, { image })}
          onEditItems={(pid, sid, items) => onPatchSection(pid, sid, { content: { items } })}
        />
      </div>

      {/* ---------- Add Section drawer ---------- */}
      <AddSectionDrawer open={addOpen} previewTheme={createSectionTheme(style)} patterns={referencePatterns} recommendCtx={{ ...recommendCtx, pageName: selectedPage?.name, pageType: selectedPage?.pageType, presentKinds: selectedPage?.sections.map((s) => sectionTypeForKind(sectionKind(s.name))) }} onClose={() => setAddOpen(false)} onAdd={addSectionFromLibrary} />

      {/* ---------- Section Settings drawer ---------- */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedSectionId(null)}
        title="Section settings"
        subtitle={selected ? `Type: ${sectionKind(selected.name)}` : undefined}
        width={340}
      >
        {selected && (
          <SectionSettingsContent
            section={selected}
            schemes={schemes}
            onPatch={(patch) => onPatchSection(pageId, selected.id, patch)}
            onDuplicate={() => { onDuplicateSection(pageId, selected.id); }}
            onDelete={() => { onRemoveSection(pageId, selected.id); setSelectedSectionId(null); }}
            onClose={() => setSelectedSectionId(null)}
          />
        )}
      </Drawer>
    </div>
  );
}

// A tiny live preview of a section variant (Elementor-style thumbnail): the real
// component rendered at a fixed design width and scaled down (CSS zoom), clipped.
function VariantThumbPreview({ Comp, theme, label, onClick }: { Comp: SectionComponent; theme: SectionTheme; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group overflow-hidden rounded-lg border border-line text-left transition-colors hover:border-accent">
      <div className="pointer-events-none overflow-hidden bg-surface" style={{ height: 104 }}>
        <div style={{ width: 1100, zoom: 0.26 } as React.CSSProperties}>
          <Comp theme={theme} />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-2.5 py-1.5">
        <span className="text-[11.5px] font-medium text-body">{label}</span>
        <span className="text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">＋ Add</span>
      </div>
    </button>
  );
}

// A representative section name per SectionType — its sectionKind() maps back to
// the same type, so a reference pattern's chosen variant renders correctly.
const NAME_FOR_TYPE: Record<string, string> = {
  navbar: "Navbar", hero: "Hero", features: "Features", services: "Services",
  "social-proof": "Social Proof", workflow: "Product Workflow", showcase: "Showcase",
  "use-cases": "Use Cases", comparison: "Comparison", integrations: "Integrations",
  "booking-form": "Booking Form", "contact-form": "Contact Form", "quote-form": "Quote Form",
  pricing: "Pricing", testimonials: "Testimonials", faq: "FAQ", cta: "CTA", footer: "Footer",
  gallery: "Gallery", dashboard: "Dashboard Preview", directory: "Listings", "scroll-media": "Sticky Media",
};

type DrawerTab = "recommended" | "sections" | "blocks" | "atomic" | "globals" | "references";
const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "sections", label: "Sections" },
  { id: "blocks", label: "Blocks" },
  { id: "atomic", label: "Elements" },
  { id: "globals", label: "Globals" },
  { id: "references", label: "References" },
];

function AddSectionDrawer({ open, previewTheme, patterns = [], recommendCtx = {}, onClose, onAdd }: { open: boolean; previewTheme: SectionTheme; patterns?: SectionPattern[]; recommendCtx?: ElementLibraryContext; onClose: () => void; onAdd: (name: string, keepOpen: boolean, variant?: string) => void }) {
  const [q, setQ] = useState("");
  const [multi, setMulti] = useState(false);
  const [tab, setTab] = useState<DrawerTab>("recommended");
  const [expanded, setExpanded] = useState<string | null>(null);
  const query = q.trim().toLowerCase();

  const groups = SECTION_CATEGORIES.map((g) => ({
    ...g,
    items: g.items.filter((i) => !query || i.toLowerCase().includes(query)),
  })).filter((g) => g.items.length);
  const refs = patterns.filter((p) => !query || p.name.toLowerCase().includes(query) || p.sectionType.includes(query) || p.styleTags.some((t) => t.toLowerCase().includes(query)));
  const recommended = recommendElements(recommendCtx, 6).filter((e) => !query || e.name.toLowerCase().includes(query));
  const blockGroups = groupElements(searchElements({ text: query, kind: "block" }));
  const atomicGroups = groupElements(searchElements({ text: query, kind: "atomic" }));
  const globalItems = searchElements({ text: query, kind: "global" });

  // Insert a saved reference pattern as a section with its matched variant.
  const addPattern = (p: SectionPattern) => {
    const type = p.matchedComponent?.type ?? sectionTypeForKind(sectionKind(p.sectionType));
    const name = NAME_FOR_TYPE[type] ?? "Content Block";
    onAdd(name, multi, p.matchedComponent?.variantId);
  };
  // Insert a ready library item (section/block that maps to a section component).
  const addItem = (e: ElementItem) => { if (isReady(e) && e.insertName) onAdd(e.insertName, multi, e.variant); };

  return (
    <Drawer open={open} onClose={onClose} title="Add elements" subtitle="Sections, blocks and elements — click a ready item to add it" width={360}>
      <div className="sticky top-0 z-10 border-b border-line bg-surface p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search elements, blocks, sections…" autoFocus className="w-full rounded-lg border border-line px-3 py-1.5 text-[13px]" />
        <label className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} className="accent-accent" />
          Keep open to add multiple
        </label>
        {query && (
          <button type="button" onClick={() => onAdd(q.trim(), multi)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-accent px-3 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent-soft">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
            Add custom “{q.trim()}”
          </button>
        )}
        <div className="mt-2.5 flex gap-1 overflow-x-auto">
          {DRAWER_TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${tab === t.id ? "bg-accent text-white" : "bg-panel text-muted hover:text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        {tab === "recommended" && (
          <>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">Recommended for this page</p>
            {recommended.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">{recommended.map((e) => <ElementCard key={e.id} item={e} onAdd={() => addItem(e)} />)}</div>
            ) : <p className="px-1 text-[12.5px] text-faint">No recommendations match your search.</p>}
          </>
        )}

        {tab === "sections" && (
          <>
            {groups.map((g) => (
              <div key={g.category} className="mb-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{g.category}</p>
                <div className="grid gap-2">
                  {g.items.map((name) => {
                    const variants = getSectionVariants(sectionTypeForKind(sectionKind(name)));
                    const isOpen = expanded === name;
                    return (
                      <div key={name} className={`overflow-hidden rounded-lg border ${isOpen ? "border-accent" : "border-line"}`}>
                        <button type="button" onClick={() => setExpanded(isOpen ? null : name)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-ink ${isOpen ? "bg-accent-soft/40" : "hover:bg-panel"}`}>
                          <span>{name}{variants.length > 1 && <span className="ml-1.5 text-[11px] text-faint">· {variants.length} layouts</span>}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`text-faint transition-transform ${isOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        {isOpen && (
                          <div className="grid gap-2 border-t border-line bg-panel/40 p-2">
                            {variants.map((v) => (
                              <VariantThumbPreview key={v.id} Comp={v.component} theme={previewTheme} label={v.label} onClick={() => onAdd(name, multi, v.id)} />
                            ))}
                            {variants.length === 0 && (
                              <button type="button" onClick={() => onAdd(name, multi)} className="rounded-md px-2 py-1.5 text-left text-[12px] text-accent hover:bg-accent-soft">Add {name}</button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="px-1 text-[13px] text-faint">No matches. Use “Add custom”.</p>}
          </>
        )}

        {tab === "blocks" && <ElementGroupList groups={blockGroups} onAdd={addItem} />}
        {tab === "atomic" && (
          <>
            <p className="mb-2 rounded-lg bg-panel px-2.5 py-1.5 text-[11.5px] text-muted">Atomic elements help build custom sections. Insertion into a section is coming soon.</p>
            <ElementGroupList groups={atomicGroups} onAdd={addItem} />
          </>
        )}

        {tab === "globals" && (
          <>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Site-wide globals</p>
            {globalItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">{globalItems.map((e) => <ElementCard key={e.id} item={e} onAdd={() => addItem(e)} />)}</div>
            ) : <p className="px-1 text-[12.5px] text-faint">No globals match your search.</p>}
          </>
        )}

        {tab === "references" && (
          <div className="rounded-xl border border-accent/30 bg-accent-soft/40 p-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.7" />
                <path d="m4.5 17 4.2-4.2a1.5 1.5 0 0 1 2.1 0L15 16.5m-1.5-1.5 1.7-1.7a1.5 1.5 0 0 1 2.1 0l2.2 2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              From your Reference Library
            </p>
            {refs.length > 0 ? (
              <div className="grid gap-2">
                {refs.map((p) => {
                  const type = (p.matchedComponent?.type ?? sectionTypeForKind(sectionKind(p.sectionType))) as SectionType;
                  const Comp = getSectionComponent(type, p.matchedComponent?.variantId);
                  return (
                    <button key={p.id} type="button" onClick={() => addPattern(p)} className="group overflow-hidden rounded-lg border border-line bg-surface text-left transition-colors hover:border-accent">
                      <div className="pointer-events-none overflow-hidden bg-surface" style={{ height: 96 }}>
                        {Comp ? <div style={{ width: 1100, zoom: 0.26 } as React.CSSProperties}><Comp theme={previewTheme} /></div>
                          : <div className="grid h-full place-items-center text-[11px] text-faint">{p.customSpec?.suggestedComponentName ?? "Custom section"} · needs build</div>}
                      </div>
                      <div className="flex items-center justify-between border-t border-line px-2.5 py-1.5">
                        <span className="truncate text-[11.5px] font-medium text-body">{p.name}</span>
                        <span className="shrink-0 text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">Add</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-0.5 py-1 text-[11.5px] text-muted">
                {query ? "No saved references match your search." : <>No saved references yet. <a href="references" className="font-medium text-accent hover:underline">Add one in the Library →</a></>}
              </p>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}

// A compact two-column library card: icon + name + type/status badges + Add.
function ElementCard({ item, onAdd }: { item: ElementItem; onAdd: () => void }) {
  const ready = isReady(item);
  return (
    <button type="button" disabled={!ready} onClick={onAdd} title={item.description}
      className={`group flex flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-colors ${ready ? "border-line hover:border-accent hover:bg-accent-soft/30" : "cursor-not-allowed border-dashed border-line opacity-70"}`}>
      <div className="flex items-center justify-between">
        <span className="text-body">{ELEMENT_ICONS[item.icon] ?? ELEMENT_ICONS.div}</span>
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${KIND_BADGE[item.kind]}`}>{KIND_LABEL[item.kind]}</span>
      </div>
      <span className="truncate text-[12px] font-medium text-ink">{item.name}</span>
      <div className="flex items-center justify-between">
        <span className="truncate text-[10.5px] text-faint">{item.category}</span>
        {ready ? <span className="shrink-0 text-[10.5px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">Add</span>
          : <span className="shrink-0 rounded-full border border-line px-1.5 text-[9px] font-medium uppercase text-faint">soon</span>}
      </div>
    </button>
  );
}

function ElementGroupList({ groups, onAdd }: { groups: { group: string; items: ElementItem[] }[]; onAdd: (e: ElementItem) => void }) {
  if (groups.length === 0) return <p className="px-1 text-[13px] text-faint">No matches.</p>;
  return (
    <>
      {groups.map((g) => (
        <div key={g.group} className="mb-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{g.group}</p>
          <div className="grid grid-cols-2 gap-2">
            {g.items.map((e) => <ElementCard key={e.id} item={e} onAdd={() => onAdd(e)} />)}
          </div>
        </div>
      ))}
    </>
  );
}

// Pages are no longer a permanent sidebar — a circular button opens the full
// pages list as a popup (select / add / rename / duplicate / delete a page).
function PagesPopover({
  pages, activeId, onSelect, onAddPage, onRenamePage, onDuplicatePage, onRemovePage, onCyclePageSource, onPatchPageMeta,
}: {
  pages: CanvasPage[];
  activeId: string;
  onSelect: (id: string) => void;
  onAddPage: () => void;
  onRenamePage: (id: string, name: string) => void;
  onDuplicatePage: (id: string) => void;
  onRemovePage: (id: string) => void;
  onCyclePageSource: (id: string) => void;
  onPatchPageMeta: (id: string, patch: Partial<CanvasPage>) => void;
}) {
  const active = pages.find((p) => p.id === activeId);
  return (
    <Popover
      align="left"
      width={300}
      trigger={() => (
        <span
          title="Pages"
          className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-[18px] font-medium text-accent shadow-sm hover:bg-accent-soft"
        >
          ＋
        </span>
      )}
    >
      {(close) => (
        <div className="grid gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">Pages · {pages.length}</span>
            <button type="button" onClick={() => onAddPage()} className="rounded-md px-1.5 text-[13px] text-accent hover:bg-accent-soft" title="Add page">＋ Add</button>
          </div>
          <div className="grid max-h-80 gap-1 overflow-y-auto">
            {pages.map((p) => {
              const isActive = p.id === activeId;
              return (
                <div key={p.id} className={`flex items-center gap-1 rounded-lg border px-1.5 py-1.5 ${isActive ? "border-accent bg-accent-soft/40" : "border-transparent hover:bg-panel"}`}>
                  <button type="button" onClick={() => { onSelect(p.id); close(); }} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
                    <span className="min-w-0">
                      <span className={`block truncate text-[13px] font-medium ${isActive ? "text-accent" : "text-ink"}`}>{p.name}</span>
                      <span className="text-[11px] text-faint">{p.sections.length} section{p.sections.length === 1 ? "" : "s"}</span>
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ${p.sections.length ? "bg-success-soft text-success" : "bg-panel text-muted"}`}>
                      {p.sections.length ? "ready" : "empty"}
                    </span>
                  </button>
                  <PageMenu
                    page={p}
                    otherPages={pages.filter((x) => x.id !== p.id)}
                    onRename={(name) => onRenamePage(p.id, name)}
                    onDuplicate={() => onDuplicatePage(p.id)}
                    onDelete={() => onRemovePage(p.id)}
                    onCycleSource={() => onCyclePageSource(p.id)}
                    onPatchMeta={(patch) => onPatchPageMeta(p.id, patch)}
                  />
                </div>
              );
            })}
          </div>
          {active && <p className="px-1 text-[11px] text-faint">Editing: <span className="text-body">{active.name}</span></p>}
        </div>
      )}
    </Popover>
  );
}

function PageMenu({
  page, otherPages, onRename, onDuplicate, onDelete, onCycleSource, onPatchMeta,
}: {
  page: CanvasPage;
  otherPages: CanvasPage[];
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCycleSource: () => void;
  onPatchMeta: (patch: Partial<CanvasPage>) => void;
}) {
  return (
    <Popover align="right" width={230} trigger={() => <span className="rounded px-1 text-faint hover:text-ink">⋯</span>}>
      {(close) => (
        <div className="grid gap-1 text-[13px]">
          <label className="px-1 text-[10px] font-semibold uppercase tracking-wide text-faint">Rename</label>
          <input value={page.name} onChange={(e) => onRename(e.target.value)} className="mx-1 rounded-md border border-line px-2 py-1 text-[12.5px]" />
          <label className="mt-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-faint">Parent page</label>
          <select value={page.parentId ?? ""} onChange={(e) => onPatchMeta({ parentId: e.target.value || undefined })} className="mx-1 rounded-md border border-line bg-surface px-2 py-1 text-[12.5px]">
            <option value="">None (top level)</option>
            {otherPages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label className="mt-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-faint">Status</label>
          <div className="mx-1 flex gap-1">
            {(["draft", "approved", "rejected"] as const).map((st) => (
              <button key={st} type="button" onClick={() => onPatchMeta({ status: st })} className={`flex-1 rounded-md px-1.5 py-1 text-[10.5px] font-medium capitalize ${(page.status ?? "draft") === st ? SECTION_STATUS_STYLE[st] : "bg-panel text-muted"}`}>{st}</button>
            ))}
          </div>
          <div className="my-1 h-px bg-line" />
          <MenuItem onClick={() => { onCycleSource(); }}>Change source ({page.source})</MenuItem>
          <MenuItem onClick={() => { onDuplicate(); close(); }}>Duplicate page</MenuItem>
          <MenuItem onClick={() => { onDelete(); close(); }} danger>Delete page</MenuItem>
        </div>
      )}
    </Popover>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-panel ${danger ? "text-danger" : "text-body"}`}>
      {children}
    </button>
  );
}

const SECTION_STATUS_STYLE: Record<string, string> = {
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-danger",
  draft: "bg-panel text-muted",
};

function VariantThumb({ id }: { id: string }) {
  const two = /split|image|booking|local|with-cta/.test(id);
  const grid = /grid|cards/.test(id);
  const list = /accordion|two-column/.test(id);
  const banner = /banner/.test(id);
  return (
    <div className="grid h-9 w-12 shrink-0 place-items-center rounded-md bg-panel p-1.5">
      {two ? (
        <div className="flex h-full w-full gap-1"><div className="w-1/2 rounded bg-line" /><div className="w-1/2 rounded bg-line/50" /></div>
      ) : grid ? (
        <div className="grid h-full w-full grid-cols-3 gap-0.5">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="rounded bg-line" />)}</div>
      ) : list ? (
        <div className="flex h-full w-full flex-col gap-0.5">{[0, 1, 2].map((i) => <div key={i} className="h-1/3 rounded bg-line/70" />)}</div>
      ) : banner ? (
        <div className="h-full w-full rounded bg-line" />
      ) : (
        <div className="mx-auto flex h-full w-2/3 flex-col justify-center gap-1"><div className="h-1.5 rounded bg-line" /><div className="h-1.5 rounded bg-line/50" /></div>
      )}
    </div>
  );
}

/** Deterministic copy suggestion per section kind (stands in for AI). */
function suggestCopy(kind: string, name: string): string {
  const map: Record<string, string> = {
    hero: "Lead with the core benefit and who it's for; add a primary CTA and a supporting line.",
    services: "Summarise the 3–6 services offered, each with a one-line outcome the client gets.",
    features: "Highlight the standout features as short benefit statements, not raw specs.",
    faq: "Answer the top objections and logistics questions buyers ask before committing.",
    cta: "One decisive nudge to act now, with a clear next step and low-friction button.",
    footer: "Group navigation, contact details, and legal links; keep it scannable.",
    testimonials: "Use specific, results-focused quotes with a real name and role.",
    pricing: "Show tiers with the value each unlocks; make the recommended plan obvious.",
    form: "Ask only for what you need; reassure on privacy and set response expectations.",
    booking: "Make booking effortless: service, time, and contact — confirm availability fast.",
    gallery: "Curate the strongest visuals that prove quality and range of work.",
  };
  return map[kind] ?? `Describe what the ${name} section should communicate to the visitor.`;
}

function SectionSettingsContent({
  section, schemes, onPatch, onDuplicate, onDelete, onClose, onApplyGlobal,
}: {
  section: CanvasSection;
  schemes: CanvasColor[];
  onPatch: (patch: Partial<CanvasSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onApplyGlobal?: () => void;
}) {
  const kind = sectionKind(section.name);
  const status = section.status ?? "draft";
  const activeScheme = schemes.find((c) => c.name === section.scheme);
  const variants = getSectionVariants(sectionTypeForKind(kind));
  const activeId = section.variant ?? variants[0]?.id;
  const activeVariant = variants.find((v) => v.id === activeId) ?? variants[0];
  const supportsAsset = Boolean(activeVariant?.supportsAssetSwap);
  const assetSide: "left" | "right" = section.asset === "left" ? "left" : "right";
  const generate = () => onPatch({ note: suggestCopy(kind, section.name) });

  return (
    <div className="flex h-full flex-col">
      <div className="grid gap-4 overflow-y-auto p-4 text-[13px]">
        {/* Make a global section toggle */}
        <button
          type="button"
          onClick={() => onPatch({ global: !section.global })}
          className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-semibold transition-colors ${section.global ? "border-accent bg-accent-soft/40 text-accent" : "border-line text-body hover:bg-panel"}`}
        >
          <span>✦</span> {section.global ? "Global section ✓" : "Make a global section"}
        </button>
        {section.global && onApplyGlobal && (
          <button type="button" onClick={onApplyGlobal} className="-mt-2 rounded-lg border border-dashed border-accent px-3 py-2 text-[12px] font-medium text-accent hover:bg-accent-soft">
            Apply to all pages
          </button>
        )}

        <Field label="Name">
          <input value={section.name} onChange={(e) => onPatch({ name: e.target.value })} className="w-full rounded-lg bg-panel px-3 py-2.5 text-[14px] font-medium text-ink outline-none focus:ring-1 focus:ring-accent" />
        </Field>

        {/* Description with Prompt button */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-faint">Description</label>
          <div className="relative">
            <textarea value={section.note ?? ""} onChange={(e) => onPatch({ note: e.target.value })} rows={4} className="w-full rounded-lg bg-panel px-3 py-2.5 pb-10 text-[14px] leading-relaxed text-ink outline-none focus:ring-1 focus:ring-accent" placeholder="What this section should communicate…" />
            <button type="button" onClick={generate} className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-accent shadow-sm hover:bg-accent-soft">
              Prompt <span className="text-[11px]">✦</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-line" />

        {/* Layout / design variant — click to change */}
        {variants.length > 0 && activeVariant && (
          <Popover width={260} trigger={() => (
            <span className="flex w-full items-center justify-between rounded-xl border border-line px-3 py-3 hover:border-line-strong">
              <span className="flex items-center gap-3">
                <VariantThumb id={activeVariant.id} />
                <span className="text-left">
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-faint">Layout</span>
                  <span className="text-[13.5px] font-semibold text-ink">{activeVariant.label}</span>
                </span>
              </span>
              <span className="text-[16px] text-faint">›</span>
            </span>
          )}>
            {(close) => (
              <div className="grid grid-cols-2 gap-1.5">
                {variants.map((v) => (
                  <button key={v.id} type="button" onClick={() => { onPatch({ variant: v.id }); close(); }}
                    className={`rounded-lg border p-1.5 text-left ${activeId === v.id ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}>
                    <VariantThumb id={v.id} />
                    <span className="mt-1 block text-[11px] text-body">{v.label}</span>
                  </button>
                ))}
              </div>
            )}
          </Popover>
        )}

        {/* Asset placement — swap image/content side (split layouts) */}
        {supportsAsset && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-faint">Asset<br />placement</span>
            <div className="flex items-center gap-1 rounded-lg bg-panel p-1">
              {(["left", "right"] as const).map((side) => (
                <button key={side} type="button" onClick={() => onPatch({ asset: side })} title={`Image on ${side}`}
                  className={`grid h-9 w-14 place-items-center rounded-md text-[18px] transition-colors ${assetSide === side ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-body"}`}>
                  {side === "left" ? "←" : "→"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Elements — show/hide editable parts on the canvas (block sections). */}
        {kind === "block" && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-faint">Elements</label>
            <div className="grid gap-1">
              {EDITABLE_PARTS.map((part) => {
                const shown = !(section.hidden ?? []).includes(part.key);
                return (
                  <button key={part.key} type="button"
                    onClick={() => { const cur = section.hidden ?? []; onPatch({ hidden: shown ? [...cur, part.key] : cur.filter((k) => k !== part.key) }); }}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-[12.5px] hover:border-line-strong">
                    <span className={shown ? "text-body" : "text-faint line-through"}>{part.label}</span>
                    <span className={`text-[11px] font-medium ${shown ? "text-accent" : "text-faint"}`}>{shown ? "Visible" : "Hidden"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-px bg-line" />

        {/* Status (approve / reject) */}
        <Field label="Status">
          <div className="flex gap-1">
            {(["draft", "approved", "rejected"] as const).map((st) => (
              <button key={st} type="button" onClick={() => onPatch({ status: st })} className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium capitalize ${status === st ? SECTION_STATUS_STYLE[st] : "bg-panel text-muted"}`}>{st}</button>
            ))}
          </div>
        </Field>

        {/* Source + style scheme (compact) */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-faint">Source</span>
          <SourceTag source={section.source} onClick={() => onPatch({ source: nextSource(section.source) })} />
        </div>

        <Field label="Style scheme">
          <Popover width={220} trigger={() => (
            <span className="flex w-full items-center justify-between rounded-lg border border-line px-2.5 py-1.5 text-[12.5px]">
              <span className="flex items-center gap-2">
                {activeScheme ? <span className="h-3.5 w-3.5 rounded-full border border-line" style={{ background: activeScheme.value }} /> : null}
                {section.scheme ?? "brand default"}
              </span>
              <span className="text-faint">▾</span>
            </span>
          )}>
            {(close) => (
              <div className="grid gap-1">
                <button type="button" onClick={() => { onPatch({ scheme: undefined }); close(); }} className="rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-panel">Brand default</button>
                {schemes.map((c) => (
                  <button key={c.name} type="button" onClick={() => { onPatch({ scheme: c.name }); close(); }} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-panel">
                    <span className="h-4 w-4 rounded-full border border-line" style={{ background: c.value }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
                {schemes.length === 0 && <p className="px-2 py-1 text-[11.5px] text-faint">Add colors in the Style Guide.</p>}
              </div>
            )}
          </Popover>
        </Field>
      </div>

      <div className="mt-auto grid gap-2 border-t border-line p-4">
        <Button size="sm" variant="secondary" onClick={generate} className="w-full">✦ Generate copy</Button>
        <div className="flex items-center justify-between">
          <button type="button" onClick={onDuplicate} className="text-[12px] font-medium text-body hover:text-accent">Duplicate</button>
          <button type="button" onClick={onDelete} className="text-[12px] font-medium text-danger hover:underline">Delete</button>
        </div>
        <Button size="sm" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-faint">{label}</label>
      {children}
    </div>
  );
}

// ------------------------------------------------------------- Style Guide
function StyleEditor({
  style, setStyle, approved, onApprove, busy,
}: {
  style: StyleGuideCanvas;
  setStyle: (fn: (s: StyleGuideCanvas) => StyleGuideCanvas) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  const setColor = (i: number, patch: Partial<CanvasColor>) => setStyle((s) => ({ ...s, colors: s.colors.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const addColor = () => setStyle((s) => ({ ...s, colors: [...s.colors, { name: `color-${s.colors.length + 1}`, value: "#666666", source: "user-added" }] }));
  const removeColor = (i: number) => setStyle((s) => ({ ...s, colors: s.colors.filter((_, j) => j !== i) }));
  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Style Guide</h2>
          <p className="text-[12.5px] text-muted">Colors, typography, and tokens — extracted from the reference, editable here.</p>
        </div>
        <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="style guide" />
      </div>

      <div className="grid gap-5">
        {/* Colors */}
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Colors</p>
            <Button size="sm" variant="secondary" onClick={addColor}>＋ Add color</Button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {style.colors.map((c, i) => (
              <div key={`${c.name}-${i}`} className="rounded-xl border border-line p-3">
                <div className="h-14 w-full rounded-lg border border-line" style={{ background: c.value }} />
                <input value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} className="mt-2 w-full bg-transparent text-[12px] font-medium text-ink outline-none" />
                <div className="mt-1 flex items-center gap-2">
                  <input value={c.value} onChange={(e) => setColor(i, { value: e.target.value })} className="w-full rounded border border-line px-1.5 py-0.5 font-mono text-[11px]" />
                  <input type="color" value={/^#([0-9a-f]{6})$/i.test(c.value) ? c.value : "#666666"} onChange={(e) => setColor(i, { value: e.target.value })} className="h-6 w-6 shrink-0 cursor-pointer rounded border border-line" />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <select value={c.role ?? ""} onChange={(e) => setColor(i, { role: (e.target.value || undefined) as CanvasColor["role"] })} className="rounded border border-line bg-surface px-1 py-0.5 text-[10px]">
                    <option value="">role…</option>
                    <option value="main">main</option>
                    <option value="accent">accent</option>
                    <option value="neutral">neutral</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <SourceTag source={c.source} onClick={() => setColor(i, { source: nextSource(c.source) })} />
                    <button type="button" onClick={() => removeColor(i)} className="text-faint hover:text-danger">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography + tokens */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink">Typography</p>
            <label className="mt-3 block text-[12px] text-muted">Heading font</label>
            <input value={style.headingFont ?? ""} onChange={(e) => setStyle((s) => ({ ...s, headingFont: e.target.value }))} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" />
            <label className="mt-3 block text-[12px] text-muted">Body font</label>
            <input value={style.bodyFont ?? ""} onChange={(e) => setStyle((s) => ({ ...s, bodyFont: e.target.value }))} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" />
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold text-ink">Tokens</p>
            <TokenRow label="Body size (px)" value={style.bodySizePx} onChange={(v) => setStyle((s) => ({ ...s, bodySizePx: v }))} />
            <TokenRow label="Radius (px)" value={style.radiusPx} onChange={(v) => setStyle((s) => ({ ...s, radiusPx: v }))} />
            <TokenRow label="Spacing base (px)" value={style.spacingPx} onChange={(v) => setStyle((s) => ({ ...s, spacingPx: v }))} />
            <p className="mt-2 text-[11.5px] text-faint">Source: {style.source}{style.host ? ` · ${style.host}` : ""}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function TokenRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      <span className="text-[12px] text-muted">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-20 rounded border border-line px-2 py-0.5 text-[12px]" />
    </div>
  );
}

// ------------------------------------------- Design (real styled page canvas)
function DesignTab({
  pages, selectedPage, style, onSelect, onPatchSection, onMoveSection, onDuplicateSection, onRemoveSection, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  selectedPage?: CanvasPage;
  style: StyleGuideCanvas;
  onSelect: (id: string) => void;
  onPatchSection: (pageId: string, sid: string, patch: Partial<CanvasSection>) => void;
  onMoveSection: (pageId: string, sid: string, dir: -1 | 1) => void;
  onDuplicateSection: (pageId: string, sid: string) => void;
  onRemoveSection: (pageId: string, sid: string) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  // The selected section can live on any page (all pages render together).
  const selPage = pages.find((p) => p.sections.some((s) => s.id === selectedSectionId)) ?? selectedPage;
  const selected = selPage?.sections.find((s) => s.id === selectedSectionId) ?? null;

  return (
    <div className="flex min-h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/70 px-4 py-2 backdrop-blur">
          <div>
            <span className="text-[14px] font-semibold text-ink">Design — all pages</span>
            <p className="text-[11.5px] text-muted">Real styled sections from the approved wireframe + Style Guide tokens.</p>
          </div>
          <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="design" />
        </div>

        <ProjectCanvas
          pages={pages}
          mode="design"
          style={style}
          schemes={style.colors}
          selectedPageId={selectedPage?.id}
          selectedSectionId={selectedSectionId}
          onSelectPage={(id) => { onSelect(id); setSelectedSectionId(null); }}
          onSelectSection={(pid, sid) => { onSelect(pid); setSelectedSectionId(sid); }}
          onMoveSection={onMoveSection}
          onDuplicateSection={onDuplicateSection}
          onRemoveSection={(pid, sid) => { onRemoveSection(pid, sid); setSelectedSectionId(null); }}
          onApproveSection={(pid, sid, status) => onPatchSection(pid, sid, { status })}
          onEditText={(pid, sid, field, value) => onPatchSection(pid, sid, field === "title" ? { name: value } : { note: value })}
          onEditIcon={(pid, sid, icon) => onPatchSection(pid, sid, { icon })}
          onEditImage={(pid, sid, image) => onPatchSection(pid, sid, { image })}
          onEditItems={(pid, sid, items) => onPatchSection(pid, sid, { content: { items } })}
        />
      </div>

      {/* Right: section settings drawer */}
      <Drawer open={Boolean(selected)} onClose={() => setSelectedSectionId(null)} title="Section settings" subtitle={selected ? `Type: ${sectionKind(selected.name)}` : undefined} width={340}>
        {selected && selPage && (
          <SectionSettingsContent
            section={selected}
            schemes={style.colors}
            onPatch={(patch) => onPatchSection(selPage.id, selected.id, patch)}
            onDuplicate={() => onDuplicateSection(selPage.id, selected.id)}
            onDelete={() => { onRemoveSection(selPage.id, selected.id); setSelectedSectionId(null); }}
            onClose={() => setSelectedSectionId(null)}
          />
        )}
      </Drawer>
    </div>
  );
}
