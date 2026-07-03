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
import { variantMetaForKind } from "@/lib/section-variants";
import { arrayMove } from "@dnd-kit/sortable";
import { SitemapFlow } from "./sitemap-flow";
import type {
  SitemapCanvas,
  StyleGuideCanvas,
  CanvasPage,
  CanvasSection,
  CanvasColor,
  CanvasSource,
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

const ASSET_PLACEMENTS = ["none", "left", "right", "background", "top"];

export function DesignEditor({
  projectId,
  projectName,
  initialSitemap,
  initialStyle,
  features = [],
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
  approvals: Approvals;
  saveSitemap: (projectId: string, canvas: SitemapCanvas) => Promise<{ error?: string }>;
  saveStyle: (projectId: string, canvas: StyleGuideCanvas) => Promise<{ error?: string }>;
  approveStage: (projectId: string, stage: string) => Promise<{ error?: string }>;
}) {
  const [tab, setTab] = useState<Tab>("sitemap");
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
  const addSection = (pageId: string, name: string) =>
    patchPage(pageId, (pg) => ({ ...pg, sections: [...pg.sections, { id: uid("s"), name, source: "user-added" }] }));
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
          <Button size="sm" variant="secondary" disabled title="Coming soon">Share</Button>
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
              onAddPage={addPage}
              onRemovePage={removePage}
              onRename={renamePage}
              onCycleSource={cyclePageSource}
              onMovePos={movePagePos}
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


// ------------------------------------------------ Sitemap (React Flow canvas)
function SitemapEditor({
  pages, onAddPage, onRemovePage, onRename, onCycleSource, onMovePos, onOpenWireframe, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCycleSource: (id: string) => void;
  onMovePos: (id: string, x: number, y: number) => void;
  onOpenWireframe: (id: string) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Sitemap</h2>
          <p className="text-[12.5px] text-muted">Pan / zoom the graph. Drag pages to arrange, rename inline, change source, add or remove — then approve.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onAddPage}>＋ Add page</Button>
          <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="sitemap" />
        </div>
      </div>
      <SitemapFlow
        pages={pages}
        onRename={onRename}
        onCycleSource={onCycleSource}
        onRemove={onRemovePage}
        onOpen={onOpenWireframe}
        onMove={onMovePos}
      />
    </div>
  );
}

// ----------------------------------------- Wireframe (real page canvas)

function WireframeEditor({
  pages, selectedPage, style, onSelect, onAddPage, onRenamePage, onRemovePage, onDuplicatePage, onCyclePageSource, onPatchPageMeta,
  onAddSection, onRemoveSection, onPatchSection, onMoveSection, onDuplicateSection, onAutoWireframe, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  selectedPage?: CanvasPage;
  style: StyleGuideCanvas;
  onSelect: (id: string) => void;
  onAddPage: () => void;
  onRenamePage: (id: string, name: string) => void;
  onRemovePage: (id: string) => void;
  onDuplicatePage: (id: string) => void;
  onCyclePageSource: (id: string) => void;
  onPatchPageMeta: (id: string, patch: Partial<CanvasPage>) => void;
  onAddSection: (pageId: string, name: string) => void;
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

  const addSectionFromLibrary = (name: string, keepOpen: boolean) => {
    onAddSection(pageId, name);
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
        />
      </div>

      {/* ---------- Add Section drawer ---------- */}
      <AddSectionDrawer open={addOpen} onClose={() => setAddOpen(false)} onAdd={addSectionFromLibrary} />

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

function AddSectionDrawer({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string, keepOpen: boolean) => void }) {
  const [q, setQ] = useState("");
  const [multi, setMulti] = useState(false);
  const query = q.trim().toLowerCase();
  const groups = SECTION_CATEGORIES.map((g) => ({
    ...g,
    items: g.items.filter((i) => !query || i.toLowerCase().includes(query)),
  })).filter((g) => g.items.length);

  return (
    <Drawer open={open} onClose={onClose} title="Add section" subtitle="Search the library and click to add" width={340}>
      <div className="sticky top-0 z-10 border-b border-line bg-surface p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sections…" autoFocus className="w-full rounded-lg border border-line px-3 py-1.5 text-[13px]" />
        <label className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} className="accent-accent" />
          Keep open to add multiple
        </label>
        {query && (
          <button type="button" onClick={() => onAdd(q.trim(), multi)} className="mt-2 w-full rounded-lg border border-dashed border-accent px-3 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent-soft">
            ＋ Add custom “{q.trim()}”
          </button>
        )}
      </div>
      <div className="p-3">
        {groups.map((g) => (
          <div key={g.category} className="mb-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{g.category}</p>
            <div className="grid gap-1.5">
              {g.items.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onAdd(name, multi)}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-left text-[13px] text-ink hover:border-accent hover:bg-accent-soft/40"
                >
                  <span>{name}</span>
                  <span className="text-faint">＋</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="px-1 text-[13px] text-faint">No matches. Use “Add custom”.</p>}
      </div>
    </Drawer>
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

function SectionSettingsContent({
  section, schemes, onPatch, onDuplicate, onDelete, onClose,
}: {
  section: CanvasSection;
  schemes: CanvasColor[];
  onPatch: (patch: Partial<CanvasSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const status = section.status ?? "draft";
  const activeScheme = schemes.find((c) => c.name === section.scheme);
  return (
    <div className="flex h-full flex-col">
      <div className="grid gap-3 overflow-y-auto p-4 text-[13px]">
        <Field label="Name">
          <input value={section.name} onChange={(e) => onPatch({ name: e.target.value })} className="w-full rounded-lg border border-line px-2.5 py-1.5" />
        </Field>
        <Field label="Section type (inferred)">
          <div className="rounded-lg bg-panel px-2.5 py-1.5 text-[12.5px] capitalize text-body">{sectionKind(section.name)}</div>
        </Field>
        <Field label="Description / copy direction">
          <textarea value={section.note ?? ""} onChange={(e) => onPatch({ note: e.target.value })} rows={3} className="w-full rounded-lg border border-line px-2.5 py-1.5" placeholder="What this section should communicate…" />
        </Field>
        <Field label="Source">
          <div className="flex items-center gap-2">
            <SourceTag source={section.source} onClick={() => onPatch({ source: nextSource(section.source) })} />
            <span className="text-[11px] text-faint">click to change</span>
          </div>
        </Field>
        <Field label="Status">
          <div className="flex gap-1">
            {(["draft", "approved", "rejected"] as const).map((st) => (
              <button key={st} type="button" onClick={() => onPatch({ status: st })} className={`flex-1 rounded-md px-2 py-1 text-[11px] font-medium capitalize ${status === st ? SECTION_STATUS_STYLE[st] : "bg-panel text-muted"}`}>{st}</button>
            ))}
          </div>
        </Field>

        {/* Design variant selector — real styled variants for this section kind */}
        {(() => {
          const variants = variantMetaForKind(sectionKind(section.name));
          if (variants.length === 0) return null;
          const activeId = section.variant ?? variants[0]?.id;
          const activeLabel = variants.find((v) => v.id === activeId)?.label ?? "Default";
          return (
            <Field label={`Design variant · ${variants.length} option${variants.length === 1 ? "" : "s"}`}>
              <Popover width={240} trigger={() => (
                <span className="flex w-full items-center justify-between rounded-lg border border-line px-2.5 py-1.5 text-[12.5px]">
                  {activeLabel} <span className="text-faint">▾</span>
                </span>
              )}>
                {(close) => (
                  <div className="grid gap-1">
                    {variants.map((v) => (
                      <button key={v.id} type="button" onClick={() => { onPatch({ variant: v.id }); close(); }}
                        className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-left text-[12.5px] ${activeId === v.id ? "border-accent bg-accent-soft/40 text-accent" : "border-line text-body hover:border-line-strong"}`}>
                        <span>{v.label}</span>
                        {activeId === v.id && <span className="text-[11px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </Popover>
            </Field>
          );
        })()}

        {/* Style scheme popover from the Style Guide colors */}
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

        <Field label="Asset placement">
          <select value={section.asset ?? ""} onChange={(e) => onPatch({ asset: e.target.value || undefined })} className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 capitalize">
            {ASSET_PLACEMENTS.map((a) => <option key={a} value={a === "none" ? "" : a}>{a}</option>)}
          </select>
        </Field>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={Boolean(section.global)} onChange={(e) => onPatch({ global: e.target.checked })} className="accent-accent" />
          <span className="text-[12.5px] text-body">Global section (reused on every page)</span>
        </label>
      </div>

      <div className="mt-auto grid gap-2 border-t border-line p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" disabled title="Coming soon">✦ Generate copy</Button>
          <Button size="sm" variant="secondary" disabled title="Coming soon">↻ Regenerate</Button>
        </div>
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
