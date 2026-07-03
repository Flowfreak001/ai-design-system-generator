"use client";

// Visual Design Editor. Four editable canvases — Sitemap, Wireframe, Style
// Guide, Design — whose state is the source of truth for MD generation. Edits
// (add/remove/rename/reorder/notes/source/approval) are saved as JSON canvas
// files. Scope: editable cards + move up/down (no full drag-and-drop yet).

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

const SECTION_PRESETS = [
  "Navbar", "Hero", "Features", "Services", "Cards", "Gallery", "Booking Form",
  "Quote Form", "Pricing", "FAQ", "Testimonials", "Reviews", "CTA", "Footer",
];

export function DesignEditor({
  projectId,
  projectName,
  initialSitemap,
  initialStyle,
  approvals: initialApprovals,
  previewHtml,
  saveSitemap,
  saveStyle,
  approveStage,
}: {
  projectId: string;
  projectName: string;
  initialSitemap: SitemapCanvas;
  initialStyle: StyleGuideCanvas;
  approvals: Approvals;
  previewHtml: string | null;
  saveSitemap: (projectId: string, canvas: SitemapCanvas) => Promise<{ error?: string }>;
  saveStyle: (projectId: string, canvas: StyleGuideCanvas) => Promise<{ error?: string }>;
  approveStage: (projectId: string, stage: string) => Promise<{ error?: string }>;
}) {
  const [tab, setTab] = useState<Tab>("sitemap");
  const [pages, setPagesState] = useState<CanvasPage[]>(initialSitemap.pages);
  const [style, setStyleState] = useState<StyleGuideCanvas>(initialStyle);
  const [approvals, setApprovals] = useState<Approvals>(initialApprovals);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialSitemap.pages[0]?.id ?? "");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
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
  const cyclePageSource = (id: string) =>
    setPages((p) => p.map((x) => (x.id === id ? { ...x, source: nextSource(x.source) } : x)));
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

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? pages[0];
  const deviceW = device === "mobile" ? 390 : device === "tablet" ? 768 : 1200;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
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
              onSelect={setSelectedPageId}
              onAddSection={addSection}
              onRemoveSection={removeSection}
              onPatchSection={patchSection}
              onReorder={reorderSections}
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
              onSelect={setSelectedPageId}
              onPatchSection={patchSection}
              onReorder={reorderSections}
              device={device}
              setDevice={setDevice}
              deviceW={deviceW}
              previewHtml={previewHtml}
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

/** A draggable (dnd-kit) row with a grab handle; children are the row content. */
function SortableSectionRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 rounded-lg border border-line bg-surface p-3">
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className="mt-0.5 cursor-grab touch-none text-faint hover:text-ink active:cursor-grabbing"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">{children}</div>
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

// -------------------------------------------------------------- Wireframe
function WireframeEditor({
  pages, selectedPage, onSelect, onAddSection, onRemoveSection, onPatchSection, onReorder, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  selectedPage?: CanvasPage;
  onSelect: (id: string) => void;
  onAddSection: (pageId: string, name: string) => void;
  onRemoveSection: (pageId: string, sid: string) => void;
  onPatchSection: (pageId: string, sid: string, patch: Partial<CanvasSection>) => void;
  onReorder: (pageId: string, activeId: string, overId: string) => void;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  const [custom, setCustom] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  if (!selectedPage) return <div className="p-6 text-[13px] text-muted">Add a page in the Sitemap first.</div>;
  const pageId = selectedPage.id;
  const onDragEnd = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) onReorder(pageId, String(e.active.id), String(e.over.id));
  };
  return (
    <div className="flex min-h-full">
      {/* Left panel: page list + add-section */}
      <div className="w-56 shrink-0 border-r border-line bg-surface p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Pages</p>
        <div className="grid gap-1">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`truncate rounded-lg px-2.5 py-1.5 text-left text-[13px] ${p.id === selectedPage.id ? "bg-accent-soft text-accent" : "text-body hover:bg-panel"}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-faint">Add section</p>
        <div className="flex flex-wrap gap-1.5">
          {SECTION_PRESETS.map((s) => (
            <button key={s} type="button" onClick={() => onAddSection(selectedPage.id, s)} className="rounded-md border border-line px-2 py-0.5 text-[11.5px] text-body hover:border-accent hover:text-accent">
              {s}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom…" className="w-full rounded-md border border-line bg-surface px-2 py-1 text-[12px]" />
          <Button size="sm" variant="secondary" onClick={() => { if (custom.trim()) { onAddSection(selectedPage.id, custom.trim()); setCustom(""); } }}>Add</Button>
        </div>
      </div>

      {/* Section stack */}
      <div className="min-w-0 flex-1 p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">{selectedPage.name} — sections</h2>
            <p className="text-[12.5px] text-muted">Reorder, rename, add notes, mark global, or change the source label.</p>
          </div>
          <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="wireframe" />
        </div>
        <div className="mx-auto max-w-lg">
          {selectedPage.sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-[13px] text-faint">
              No sections yet — add from the panel. Nothing is forced; only what you add or the crawl detected.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={selectedPage.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-2">
                  {selectedPage.sections.map((s) => (
                    <SortableSectionRow key={s.id} id={s.id}>
                      <div className="flex items-center gap-2">
                        <input value={s.name} onChange={(e) => onPatchSection(pageId, s.id, { name: e.target.value })} className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none" />
                        <SourceTag source={s.source} onClick={() => onPatchSection(pageId, s.id, { source: nextSource(s.source) })} />
                        <button type="button" onClick={() => onPatchSection(pageId, s.id, { global: !s.global })} title="Toggle global" className={`rounded px-1.5 text-[10px] font-medium ${s.global ? "bg-info-soft text-info" : "bg-panel text-faint"}`}>global</button>
                        <button type="button" onClick={() => onRemoveSection(pageId, s.id)} className="text-faint hover:text-danger">✕</button>
                      </div>
                      <input
                        value={s.note ?? ""}
                        onChange={(e) => onPatchSection(pageId, s.id, { note: e.target.value })}
                        placeholder="Section note / copy direction…"
                        className="mt-1.5 w-full bg-transparent text-[12px] text-muted outline-none placeholder:text-faint"
                      />
                    </SortableSectionRow>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
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

// ---------------------------------------------------------------- Design
function DesignTab({
  pages, selectedPage, onSelect, onPatchSection, onReorder, device, setDevice, deviceW, previewHtml, approved, onApprove, busy,
}: {
  pages: CanvasPage[];
  selectedPage?: CanvasPage;
  onSelect: (id: string) => void;
  onPatchSection: (pageId: string, sid: string, patch: Partial<CanvasSection>) => void;
  onReorder: (pageId: string, activeId: string, overId: string) => void;
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  deviceW: number;
  previewHtml: string | null;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const sections = selectedPage?.sections ?? [];
  const onDragEnd = (e: DragEndEvent) => {
    if (selectedPage && e.over && e.active.id !== e.over.id) onReorder(selectedPage.id, String(e.active.id), String(e.over.id));
  };
  return (
    <div className="flex min-h-full">
      <div className="w-56 shrink-0 border-r border-line bg-surface p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Pages</p>
        <div className="grid gap-1">
          {pages.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelect(p.id)} className={`truncate rounded-lg px-2.5 py-1.5 text-left text-[13px] ${p.id === selectedPage?.id ? "bg-accent-soft text-accent" : "text-body hover:bg-panel"}`}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Design — {selectedPage?.name}</h2>
            <p className="text-[12.5px] text-muted">Composed from the approved brand, sitemap, wireframe, and style guide.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-panel p-1">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setDevice(d)} className={`rounded px-2 py-0.5 text-[11px] ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted"}`}>{d}</button>
              ))}
            </div>
            <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label="design" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {previewHtml ? (
              <iframe title="preview" srcDoc={previewHtml} style={{ width: deviceW, maxWidth: "100%", height: 560 }} className="mx-auto block" />
            ) : (
              <div className="grid h-[560px] place-items-center px-6 text-center text-[13px] text-muted">
                No preview yet. Generate the preview from the Design Canvas stage, then it renders here.
              </div>
            )}
          </div>

          {/* Section reorder + notes (dnd-kit) */}
          <div className="grid content-start gap-2">
            <p className="text-[12px] font-semibold text-ink">{selectedPage?.name} sections — drag to reorder</p>
            {sections.length === 0 ? (
              <p className="text-[12px] text-faint">Add sections in the Wireframe tab to compose this page.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-2">
                    {sections.map((s) => (
                      <SortableSectionRow key={s.id} id={s.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12.5px] font-medium text-ink">{s.name}</span>
                          <SourceTag source={s.source} />
                        </div>
                        <input
                          value={s.note ?? ""}
                          onChange={(e) => onPatchSection(selectedPage!.id, s.id, { note: e.target.value })}
                          placeholder="Design note for this section…"
                          className="mt-1 w-full bg-transparent text-[12px] text-muted outline-none placeholder:text-faint"
                        />
                      </SortableSectionRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
