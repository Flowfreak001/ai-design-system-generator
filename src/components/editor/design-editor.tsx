"use client";

// Visual Design Editor. Four editable canvases — Sitemap, Wireframe, Style
// Guide, Design — whose state is the source of truth for MD generation. Edits
// (add/remove/rename/reorder/notes/source/approval) are saved as JSON canvas
// files. Scope: editable cards + move up/down (no full drag-and-drop yet).

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PuckPageEditor } from "./puck-stage";
import { OverviewCanvas } from "./overview-canvas";
import { suggestSectionsForPage, type SectionKind } from "@/lib/sections";
import { SitemapFlow } from "./sitemap-flow";
import {
  ensurePages,
  KIND_LABEL,
  WIREFRAME_TYPE,
  DESIGN_TYPE,
  type MultiPagePuck,
  type PuckData,
} from "@/lib/puck-canvas";
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


export function DesignEditor({
  projectId,
  projectName,
  initialSitemap,
  initialStyle,
  initialWireframe = null,
  initialDesign = null,
  features = [],
  approvals: initialApprovals,
  saveSitemap,
  saveStyle,
  saveWireframe,
  saveDesign,
  approveStage,
}: {
  projectId: string;
  projectName: string;
  initialSitemap: SitemapCanvas;
  initialStyle: StyleGuideCanvas;
  initialWireframe?: MultiPagePuck | null;
  initialDesign?: MultiPagePuck | null;
  features?: string[];
  approvals: Approvals;
  saveSitemap: (projectId: string, canvas: SitemapCanvas) => Promise<{ error?: string }>;
  saveStyle: (projectId: string, canvas: StyleGuideCanvas) => Promise<{ error?: string }>;
  saveWireframe: (projectId: string, doc: MultiPagePuck) => Promise<{ error?: string }>;
  saveDesign: (projectId: string, doc: MultiPagePuck) => Promise<{ error?: string }>;
  approveStage: (projectId: string, stage: string) => Promise<{ error?: string }>;
}) {
  const [tab, setTab] = useState<Tab>("sitemap");
  const [pages, setPagesState] = useState<CanvasPage[]>(initialSitemap.pages);
  const [style, setStyleState] = useState<StyleGuideCanvas>(initialStyle);
  const [approvals, setApprovals] = useState<Approvals>(initialApprovals);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialSitemap.pages[0]?.id ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();

  // Per-page Puck data for the Wireframe (low-fi) and Design (styled) stages,
  // seeded from the Sitemap and any saved WIREFRAME_CANVAS / DESIGN_CANVAS.
  const [wireframeDoc, setWireframeDoc] = useState<MultiPagePuck>(() =>
    ensurePages(initialWireframe, initialSitemap.pages, "wireframe"),
  );
  const [designDoc, setDesignDoc] = useState<MultiPagePuck>(() =>
    ensurePages(initialDesign, initialSitemap.pages, "design"),
  );

  // Keep the Puck docs' page set aligned with the Sitemap (add new / drop
  // removed pages) without rebuilding on mere section edits — only when the
  // set of page ids actually changes, so Puck fields don't lose focus.
  useEffect(() => {
    const ids = pages.map((p) => p.id).join(",");
    setWireframeDoc((d) => (d.pages.map((p) => p.id).join(",") === ids ? d : ensurePages(d, pages, "wireframe")));
    setDesignDoc((d) => (d.pages.map((p) => p.id).join(",") === ids ? d : ensurePages(d, pages, "design")));
  }, [pages]);

  // Mirror a page's Puck content back into the Sitemap sections so MD/export
  // stay in sync with the latest edited structure (order, names, sources).
  const mirrorSitemap = (pageId: string, data: PuckData) => {
    const secs: CanvasSection[] = data.content.map((item) => ({
      id: String(item.props.id),
      name: String(item.props.name ?? KIND_LABEL[(item.props.kind as keyof typeof KIND_LABEL)] ?? "Section"),
      note: item.props.note ? String(item.props.note) : undefined,
      source: (item.props.source as CanvasSource) ?? "user-added",
      status: item.props.status as CanvasSection["status"],
      variant: item.props.variant ? String(item.props.variant) : undefined,
    }));
    setPagesState((p) => p.map((x) => (x.id === pageId ? { ...x, sections: secs } : x)));
    setDirty(true);
  };

  const onWireframeChange = (pageId: string, data: PuckData) => {
    setWireframeDoc((d) => ({ ...d, pages: d.pages.map((p) => (p.id === pageId ? { ...p, data } : p)) }));
    mirrorSitemap(pageId, data);
  };
  const onDesignChange = (pageId: string, data: PuckData) => {
    setDesignDoc((d) => ({ ...d, pages: d.pages.map((p) => (p.id === pageId ? { ...p, data } : p)) }));
    mirrorSitemap(pageId, data);
  };

  // Which page (if any) is open in the single-page Puck editor, per stage.
  const [wfEditId, setWfEditId] = useState<string | null>(null);
  const [dsEditId, setDsEditId] = useState<string | null>(null);

  // Quick "Add section" from the overview: append a Puck item to a page.
  const addPuckSection = (mode: "wireframe" | "design", pageId: string, kind: SectionKind) => {
    const type = (mode === "wireframe" ? WIREFRAME_TYPE : DESIGN_TYPE)[kind];
    const item = { type, props: { id: uid("s"), kind, name: KIND_LABEL[kind], note: "", source: "user-added", status: "draft", variant: "default" } };
    const doc = mode === "wireframe" ? wireframeDoc : designDoc;
    const page = doc.pages.find((p) => p.id === pageId);
    if (!page) return;
    const data: PuckData = { ...page.data, content: [...page.data.content, item] };
    (mode === "wireframe" ? onWireframeChange : onDesignChange)(pageId, data);
  };

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
      await saveWireframe(projectId, wireframeDoc);
      await saveDesign(projectId, designDoc);
      setDirty(false);
    });

  const approve = (stage: Tab) =>
    startSave(async () => {
      await saveSitemap(projectId, { pages, approved: stage === "sitemap" ? true : approvals.sitemap });
      await saveStyle(projectId, { ...style, approved: stage === "style" ? true : style.approved });
      await saveWireframe(projectId, wireframeDoc);
      await saveDesign(projectId, designDoc);
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

  // Auto-create the wireframe for a page: seed AI-suggested sections (from the
  // page type + selected features) for any that aren't already present. Writes
  // to the Sitemap; the reconcile effect flows new pages into the Puck docs,
  // and re-deriving wireframe/design from the updated Sitemap picks them up.
  const autoWireframe = (pageId: string) =>
    setPages((p) =>
      p.map((pg) => {
        if (pg.id !== pageId) return pg;
        const existing = new Set(pg.sections.map((s) => s.name.toLowerCase()));
        const suggested = suggestSectionsForPage(pg.name, features)
          .filter((name) => !existing.has(name.toLowerCase()))
          .map((name) => ({ id: uid("s"), name, source: "AI-suggested" as const }));
        return { ...pg, sections: [...pg.sections, ...suggested] };
      }),
    );

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
          <ToolBtn label="Add page" onClick={addPage}>＋</ToolBtn>
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
            <div className="flex min-h-full flex-col">
              <StageHeader
                title="Wireframe"
                subtitle={wfEditId ? "Editing one page — add / reorder / duplicate / delete sections." : "All pages overview. Click Edit on a page to open its low-fi Puck editor."}
                approved={approvals.wireframe}
                onApprove={() => approve("wireframe")}
                busy={saving}
                extra={
                  !wfEditId && (
                    <Button size="sm" variant="secondary" onClick={() => autoWireframe(selectedPage?.id ?? "")} disabled={!selectedPage} title="Seed the selected page's sections from its type + features">
                      ✦ Auto-generate
                    </Button>
                  )
                }
              />
              {wfEditId && wireframeDoc.pages.some((p) => p.id === wfEditId) ? (
                <PuckPageEditor
                  mode="wireframe"
                  page={wireframeDoc.pages.find((p) => p.id === wfEditId)!}
                  style={style}
                  onChange={onWireframeChange}
                  onBack={() => setWfEditId(null)}
                />
              ) : (
                <OverviewCanvas
                  mode="wireframe"
                  doc={wireframeDoc}
                  style={style}
                  selectedPageId={selectedPageId}
                  onSelectPage={setSelectedPageId}
                  onEditPage={(id) => { setSelectedPageId(id); setWfEditId(id); }}
                  onAddPage={addPage}
                  onAddSection={(pid, kind) => addPuckSection("wireframe", pid, kind)}
                />
              )}
            </div>
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
            <div className="flex min-h-full flex-col">
              <StageHeader
                title="Design"
                subtitle={dsEditId ? "Editing one page — real styled sections from the Style Guide tokens." : "All pages design overview. Click Edit on a page to open its styled Puck editor."}
                approved={approvals.design}
                onApprove={() => approve("design")}
                busy={saving}
              />
              {dsEditId && designDoc.pages.some((p) => p.id === dsEditId) ? (
                <PuckPageEditor
                  mode="design"
                  page={designDoc.pages.find((p) => p.id === dsEditId)!}
                  style={style}
                  onChange={onDesignChange}
                  onBack={() => setDsEditId(null)}
                />
              ) : (
                <OverviewCanvas
                  mode="design"
                  doc={designDoc}
                  style={style}
                  selectedPageId={selectedPageId}
                  onSelectPage={setSelectedPageId}
                  onEditPage={(id) => { setSelectedPageId(id); setDsEditId(id); }}
                  onAddPage={addPage}
                  onAddSection={(pid, kind) => addPuckSection("design", pid, kind)}
                />
              )}
            </div>
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

function StageHeader({
  title, subtitle, approved, onApprove, busy, extra,
}: {
  title: string;
  subtitle: string;
  approved: boolean;
  onApprove: () => void;
  busy: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/70 px-4 py-2 backdrop-blur">
      <div className="min-w-0">
        <span className="text-[14px] font-semibold text-ink">{title}</span>
        <p className="text-[11.5px] text-muted">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <ApproveBar approved={approved} onApprove={onApprove} busy={busy} label={title.toLowerCase()} />
      </div>
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
