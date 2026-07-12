"use client";

// Elementor-style visual editor shell. Three panes (component library · canvas ·
// settings) over the EXISTING pages model, so it maps 1:1 to the deterministic
// theme generator. Reuses the preview renderers, shared section controls, the
// existing savePagesAction (autosave) and exportThemeAction.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { resolveSchemes, getSection, type BrandTokens, type ShopifyPage, type ShopifySectionInstance } from "@/modules/shopify";
import { savePagesAction, exportThemeAction } from "@/app/(app)/projects/[id]/shopify/actions";
import { mainSectionId } from "@/components/shopify/storefront-preview";
import { ComponentLibrary } from "./component-library";
import { EditorCanvas } from "./editor-canvas";
import { SettingsPanel } from "./settings-panel";
import { useEditorHistory } from "./use-editor-history";

type TemplateType = ShopifyPage["template"];
const CANONICAL: { template: TemplateType; label: string }[] = [
  { template: "index", label: "Home" }, { template: "product", label: "Product" },
  { template: "collection", label: "Collection" }, { template: "cart", label: "Cart" },
  { template: "search", label: "Search" }, { template: "blog", label: "Blog" },
];
const DEVICES: { id: "desktop" | "tablet" | "mobile"; label: string; w: number | "100%" }[] = [
  { id: "desktop", label: "Desktop", w: "100%" }, { id: "tablet", label: "Tablet", w: 820 }, { id: "mobile", label: "Mobile", w: 390 },
];

export function ShopifyVisualEditor({ projectId, storeName, brand, initialPages }: {
  projectId: string; storeName: string; brand: BrandTokens; initialPages: ShopifyPage[];
}) {
  const { pages, commit, undo, redo, canUndo, canRedo } = useEditorHistory(initialPages);
  const [template, setTemplate] = useState<TemplateType>("index");
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [save, setSave] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [exporting, setExporting] = useState(false);
  const firstRun = useRef(true);
  const schemes = useMemo(() => resolveSchemes(brand), [brand]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Debounced autosave — never per keystroke.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setSave("saving");
    const t = setTimeout(async () => {
      const res = await savePagesAction(projectId, JSON.stringify(pages));
      setSave(res.ok ? "ok" : "err");
    }, 700);
    return () => clearTimeout(t);
  }, [pages, projectId]);

  const activeSections = useMemo(() => pages.find((p) => p.template === template && !p.handle)?.sections ?? [], [pages, template]);

  const setSections = useCallback((sections: ShopifySectionInstance[]) => {
    const idx = pages.findIndex((p) => p.template === template && !p.handle);
    if (idx >= 0) commit(pages.map((p, i) => (i === idx ? { ...p, sections } : p)));
    else commit([...pages, { template, sections }]);
  }, [pages, template, commit]);

  const addSection = useCallback((sectionId: string, atIndex?: number) => {
    const def = getSection(sectionId);
    if (!def) return;
    const inst: ShopifySectionInstance = {
      key: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      sectionId,
      settings: { ...def.defaultSettings },
      blocks: def.schema.presets?.[0]?.blocks?.map((b, i) => ({ key: `b-${Date.now().toString(36)}-${i}`, type: b.type, settings: { ...(b.settings ?? {}) } })),
    };
    const next = [...activeSections];
    next.splice(atIndex ?? next.length, 0, inst);
    setSections(next);
    setSelectedKey(inst.key);
  }, [activeSections, setSections]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= activeSections.length) return;
    setSections(arrayMove(activeSections, i, j));
  };
  const duplicate = (key: string) => {
    const i = activeSections.findIndex((s) => s.key === key);
    if (i < 0) return;
    const copy = { ...activeSections[i], key: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}` };
    const next = [...activeSections]; next.splice(i + 1, 0, copy); setSections(next);
  };
  const hide = (key: string) => setSections(activeSections.map((s) => (s.key === key ? { ...s, disabled: !s.disabled } : s)));
  const del = (key: string) => { setSections(activeSections.filter((s) => s.key !== key)); if (selectedKey === key) setSelectedKey(null); };
  const patch = (settings: Record<string, string | number | boolean>, blocks?: ShopifySectionInstance["blocks"]) => {
    if (!selectedKey || selectedKey === "__main") return;
    setSections(activeSections.map((s) => (s.key === selectedKey ? { ...s, settings, ...(blocks ? { blocks } : {}) } : s)));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    if (activeId.startsWith("new::")) {
      const sectionId = activeId.slice(5);
      const overIdx = activeSections.findIndex((s) => s.key === String(over.id));
      addSection(sectionId, overIdx >= 0 ? overIdx : undefined);
      return;
    }
    if (active.id !== over.id) {
      const from = activeSections.findIndex((s) => s.key === active.id);
      const to = activeSections.findIndex((s) => s.key === over.id);
      if (from >= 0 && to >= 0) setSections(arrayMove(activeSections, from, to));
    }
  };

  // Selected instance for the panel (or the locked main).
  const selectedInst: ShopifySectionInstance | null = selectedKey === "__main"
    ? (mainSectionId(template) ? { key: "__main", sectionId: mainSectionId(template)!, settings: {} } : null)
    : activeSections.find((s) => s.key === selectedKey) ?? null;

  const doExport = async () => {
    setExporting(true);
    const res = await exportThemeAction(projectId);
    setExporting(false);
    if (!res.ok) { alert(res.error + (res.issues?.length ? "\n" + res.issues.slice(0, 6).join("\n") : "")); return; }
    const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
    const a = document.createElement("a"); a.href = url; a.download = res.fileName; a.click(); URL.revokeObjectURL(url);
  };

  const deviceW = DEVICES.find((d) => d.id === device)!.w;
  const tb = "grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-panel hover:text-ink disabled:opacity-30";

  return (
    <div className="flex h-[100dvh] flex-col bg-panel">
      {/* Top toolbar */}
      <header className="flex items-center gap-2 border-b border-line bg-white px-3 py-2">
        <Link href={`/projects/${projectId}/shopify`} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-medium text-muted hover:bg-panel hover:text-ink">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>Builder
        </Link>
        <span className="mx-1 h-5 w-px bg-line" />
        <select value={template} onChange={(e) => { setTemplate(e.target.value as TemplateType); setSelectedKey(null); }} className="rounded-md border border-line bg-surface px-2 py-1.5 text-[13px] font-medium text-ink outline-none">
          {CANONICAL.map((t) => <option key={t.template} value={t.template}>{t.label}</option>)}
        </select>
        <div className="mx-auto flex items-center gap-1 rounded-lg bg-panel p-0.5">
          {DEVICES.map((d) => (
            <button key={d.id} onClick={() => setDevice(d.id)} className={`rounded-md px-2.5 py-1 text-[12px] font-medium capitalize ${device === d.id ? "bg-white text-ink shadow-sm" : "text-muted"}`}>{d.label}</button>
          ))}
        </div>
        <button className={tb} onClick={undo} disabled={!canUndo} title="Undo" aria-label="Undo"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-1" /></svg></button>
        <button className={tb} onClick={redo} disabled={!canRedo} title="Redo" aria-label="Redo"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h1" /></svg></button>
        <span className="w-24 text-right text-[11.5px] text-muted">{save === "saving" ? "Saving…" : save === "ok" ? "Saved" : save === "err" ? "Save failed" : ""}</span>
        <button onClick={doExport} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-accent-hover disabled:opacity-60">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0-12 4 4m-4-4-4 4M5 15v4h14v-4" /></svg>{exporting ? "Exporting…" : "Export"}
        </button>
      </header>

      {/* Three panes */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_300px]">
          <aside className="min-h-0 overflow-hidden border-r border-line bg-white">
            <ComponentLibrary template={template} brand={brand} onAdd={(id) => addSection(id)} />
          </aside>
          <div className="min-h-0 overflow-y-auto bg-panel/60 p-5">
            <div className="mx-auto overflow-hidden rounded-[10px] border border-line bg-white shadow-sm transition-all" style={{ maxWidth: deviceW }}>
              <EditorCanvas
                brand={brand} storeName={storeName} template={template} sections={activeSections}
                selectedKey={selectedKey} onSelect={setSelectedKey}
                onUp={(i) => move(i, -1)} onDown={(i) => move(i, 1)} onDup={duplicate} onHide={hide} onDel={del}
              />
            </div>
          </div>
          <aside className="min-h-0 overflow-hidden border-l border-line bg-white">
            <SettingsPanel inst={selectedInst} schemes={schemes} locked={selectedKey === "__main"} onPatch={patch} />
          </aside>
        </div>
      </DndContext>
    </div>
  );
}
