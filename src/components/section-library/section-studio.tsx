"use client";

// Section Studio — the admin, full-page code+preview editor for authoring
// component-based sections. Monaco (VS Code engine) on the left, live compiled
// preview on the right, with a device toolbar, inline error overlay, debounced
// recompile, metadata/default-content, and per-section version history.
//
// Keeps our secure sucrase render engine (DynamicSectionRenderer) — Monaco only
// edits; the engine compiles with the fixed {content, theme} prop contract.

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { createSectionTheme } from "@/components/sections/section-theme";
import type { StyleGuideCanvas } from "@/lib/canvas";
import {
  DynamicSectionRenderer, type SectionRenderStatus,
} from "@/components/section-library/dynamic-renderer";
import {
  SECTION_LIBRARY_CATEGORIES, type SectionLibraryCategory, type SectionLibraryStatus,
} from "@/lib/section-library/manual-sections";
import { type DynamicSectionDef } from "@/lib/section-library/dynamic-section";
import { saveAdminSectionAction, deleteAdminSectionAction } from "@/app/(app)/projects/[id]/editor/actions";
import { saveLibrarySectionAction, deleteLibrarySectionAction } from "@/app/(app)/library/actions";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 820, mobile: 390 };
const STATUSES: SectionLibraryStatus[] = ["draft", "ready", "archived"];
const INPUT = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-accent";

// Ambient types so Monaco's IntelliSense understands the section props contract.
const AMBIENT_DTS = `
declare interface SectionContentItem { title?: string; text?: string; href?: string; icon?: string }
declare interface SectionContent {
  eyebrow?: string; title?: string; subtitle?: string; description?: string;
  primaryButtonLabel?: string; secondaryButtonLabel?: string; items?: SectionContentItem[];
}
declare interface SectionTheme {
  primaryColor: string; accentColor: string; backgroundColor: string; surfaceColor: string;
  textColor: string; mutedTextColor: string; borderColor: string; radius: string;
  shadow: string; spacing: string; headingFont: string; bodyFont: string;
}
declare interface SectionProps { content: SectionContent; theme: SectionTheme; items?: SectionContentItem[] }
`;

export function SectionStudio({
  projectId, initial, sections, style,
}: {
  /** When absent, the Studio runs standalone under /library (no project). */
  projectId?: string | null;
  initial: DynamicSectionDef;
  sections: DynamicSectionDef[];
  style?: StyleGuideCanvas | null;
}) {
  const router = useRouter();
  const theme = useMemo(() => createSectionTheme(style ?? undefined), [style]);
  const base = projectId ? `/projects/${projectId}/references` : "/library";
  const backHref = base;
  const studioBase = `${base}/studio`;

  const [draft, setDraft] = useState<DynamicSectionDef>(initial);
  const [previewCode, setPreviewCode] = useState(initial.componentCode);
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<SectionRenderStatus>({ state: "ok" });
  const [showDetails, setShowDetails] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [sectionMenu, setSectionMenu] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Device preview: render the section at the TRUE device width and scale it to
  // fit the panel, so the section's own responsive logic sees the real width.
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [pvScale, setPvScale] = useState(1);
  const [pvHeight, setPvHeight] = useState<number | undefined>(undefined);

  // Debounce code → preview so typing doesn't recompile on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setPreviewCode(draft.componentCode), 300);
    return () => clearTimeout(t);
  }, [draft.componentCode]);

  const set = <K extends keyof DynamicSectionDef>(k: K, v: DynamicSectionDef[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setContent = (k: string, v: string) => setDraft((d) => ({ ...d, defaultContent: { ...d.defaultContent, [k]: v } }));

  const save = (thenBack: boolean) => {
    setMsg(null);
    start(async () => {
      const res = projectId ? await saveAdminSectionAction(projectId, draft) : await saveLibrarySectionAction(draft);
      if (res.error) { setMsg(res.error); return; }
      const savedId = res.id ?? draft.id;
      // Reflect the saved id in the draft so subsequent saves update the same row
      // (never mint duplicates) even before the route reloads.
      if (savedId !== draft.id) setDraft((d) => ({ ...d, id: savedId }));
      if (thenBack) { router.push(backHref); router.refresh(); return; }
      setMsg("Saved.");
      // Move to the saved section's canonical Studio URL. Without this, a Studio
      // opened for a NEW section (no id in the URL) reloads a fresh blank
      // "Untitled section" draft on refresh — making renames/edits look lost and
      // creating a new row on every save. replace() keeps history clean.
      router.replace(`${studioBase}/${savedId}`);
      router.refresh();
    });
  };
  const remove = () => {
    if (sections.every((s) => s.id !== draft.id)) { router.push(backHref); return; }
    start(async () => { if (projectId) await deleteAdminSectionAction(projectId, draft.id); else await deleteLibrarySectionAction(draft.id); router.push(backHref); router.refresh(); });
  };
  const restore = (code: string) => { setDraft((d) => ({ ...d, componentCode: code })); setPreviewCode(code); };

  const width = DEVICE_WIDTH[device];

  // Recompute the fit-scale + reserved height whenever the device, code, or
  // available space changes.
  useEffect(() => {
    const area = previewAreaRef.current;
    const content = previewContentRef.current;
    if (!area || !content) return;
    const compute = () => {
      const avail = area.clientWidth - 32; // account for p-4 padding
      const s = width ? Math.min(1, avail / width) : 1;
      setPvScale(s);
      setPvHeight(width ? content.offsetHeight * s : undefined);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(area);
    ro.observe(content);
    return () => ro.disconnect();
  }, [width, previewCode, draft.codeMode, status.state]);

  const scaledW = width ? Math.round(width * pvScale) : undefined;
  const pill = status.state === "error"
    ? "border-danger/40 bg-danger-soft/50 text-danger"
    : status.state === "compiling" ? "border-warning/40 bg-warning-soft/50 text-warning" : "border-success/40 bg-success-soft/50 text-success";

  return (
    <div className="flex h-[100dvh] flex-col gap-3 bg-panel p-4">
      {/* Floating header — Miro-style pill toolbars on the canvas. */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-line bg-surface px-1.5 py-1 shadow-sm">
          <Link href={backHref} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-muted hover:bg-panel hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Library
          </Link>
          <span className="mx-0.5 h-5 w-px bg-line" />
          <input value={draft.name} onChange={(e) => set("name", e.target.value)} className="w-48 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[13.5px] font-semibold text-ink outline-none hover:border-line focus:border-accent" />
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${pill}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />{status.state === "compiling" ? "Compiling" : status.state}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-1.5 py-1 shadow-sm">
          {msg && <span className="text-[12.5px] text-muted">{msg}</span>}

          {/* Sections menu — clubs "switch section" + "new section" in one. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSectionMenu((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={sectionMenu}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-body hover:bg-panel"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" /></svg>
              Sections
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {sectionMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSectionMenu(false)} />
                <div className="absolute right-0 top-10 z-50 max-h-[70vh] w-64 overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg">
                  <Link href={studioBase} onClick={() => setSectionMenu(false)} className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-accent hover:bg-panel">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
                    New section
                  </Link>
                  {sections.length > 0 && <div className="my-1 border-t border-line" />}
                  {sections.map((s) => (
                    <Link key={s.id} href={`${studioBase}/${s.id}`} onClick={() => setSectionMenu(false)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 text-[12.5px] hover:bg-panel ${s.id === draft.id ? "text-accent" : "text-ink"}`}>
                      <span className="truncate">{s.name}</span>
                      <span className="shrink-0 text-[10.5px] uppercase tracking-wide text-muted">{s.status}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Category — custom dropdown that always opens BELOW the field. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              title="Section category"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] font-medium capitalize text-ink hover:bg-panel"
            >
              {draft.category}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-muted transition-transform ${catOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {catOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCatOpen(false)} />
                <div className="absolute left-0 top-9 z-50 max-h-72 w-44 overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg">
                  {!SECTION_LIBRARY_CATEGORIES.includes(draft.category) && (
                    <CatItem label={draft.category} active onClick={() => setCatOpen(false)} />
                  )}
                  {SECTION_LIBRARY_CATEGORIES.map((cat) => (
                    <CatItem key={cat} label={cat} active={cat === draft.category} onClick={() => { set("category", cat); setCatOpen(false); }} />
                  ))}
                  <div className="my-1 border-t border-line" />
                  <button
                    type="button"
                    onClick={() => {
                      const custom = (typeof window !== "undefined" ? window.prompt("New category name") : "")?.trim().toLowerCase();
                      if (custom) set("category", custom as SectionLibraryCategory);
                      setCatOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-medium text-accent hover:bg-panel"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
                    Add category…
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            aria-pressed={showDetails}
            title="Section settings"
            aria-label="Section settings"
            className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${showDetails ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:bg-panel hover:text-ink"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h9M18 7h2M4 12h2M11 12h9M4 17h9M18 17h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="15.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.7" /><circle cx="8.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.7" /><circle cx="15.5" cy="17" r="2" stroke="currentColor" strokeWidth="1.7" /></svg>
          </button>
          <Button variant="secondary" onClick={() => save(false)} disabled={pending}>Save</Button>
          <Button onClick={() => save(true)} disabled={pending}>{pending ? "Saving…" : "Save & close"}</Button>
        </div>
      </header>

      {/* Editor + preview + (optional) settings panel. */}
      <div className="flex min-h-0 flex-1 gap-3">
      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize={48} minSize={25} className="flex flex-col overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between border-b border-line bg-ink px-3 py-1.5 text-[11.5px] font-medium text-white/70">
            <span className="font-mono">section.tsx</span>
            <span className="uppercase tracking-wide">{draft.codeMode === "html" ? "HTML" : "React / TSX"}</span>
          </div>
          <div className="min-h-0 flex-1">
            <MonacoEditor
              height="100%"
              theme="vs-dark"
              defaultLanguage={draft.codeMode === "html" ? "html" : "typescript"}
              path={draft.codeMode === "html" ? "section.html" : "section.tsx"}
              value={draft.componentCode}
              onChange={(v) => set("componentCode", v ?? "")}
              onMount={(_editor, monaco) => {
                const ts = monaco.languages.typescript.typescriptDefaults;
                ts.setCompilerOptions({
                  jsx: monaco.languages.typescript.JsxEmit.React,
                  jsxFactory: "React.createElement",
                  reactNamespace: "React",
                  target: monaco.languages.typescript.ScriptTarget.ESNext,
                  allowNonTsExtensions: true,
                  allowJs: true,
                  noEmit: true,
                });
                ts.addExtraLib(AMBIENT_DTS, "file:///section-props.d.ts");
              }}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 2,
                wordWrap: "on",
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </Panel>

        <Separator className="w-3 shrink-0 cursor-col-resize bg-transparent" />

        <Panel defaultSize={52} minSize={25} className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line">
          {/* Device toolbar. */}
          <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-1.5">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-panel p-0.5">
              {(Object.keys(DEVICE_WIDTH) as Device[]).map((d) => (
                <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium capitalize transition-colors ${device === d ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>{d}</button>
              ))}
            </div>
            <span className="ml-auto text-[11.5px] text-muted">{width ? `${width}px` : "full width"}</span>
          </div>

          {/* Preview surface — renders at the true device width, scaled to fit,
              so the section's own responsive breakpoints behave like a device. */}
          <div ref={previewAreaRef} className="relative min-h-0 flex-1 overflow-auto bg-panel p-4">
            <div className="mx-auto" style={width ? { width: scaledW, height: pvHeight } : { width: "100%" }}>
              <div
                ref={previewContentRef}
                className="overflow-hidden rounded-xl border border-line bg-white shadow-sm"
                style={width ? { width: `${width}px`, transformOrigin: "top left", transform: `scale(${pvScale})` } : { width: "100%" }}
              >
                <DynamicSectionRenderer key={draft.codeMode} code={previewCode} mode={draft.codeMode} content={draft.defaultContent} theme={theme} onStatus={setStatus} />
              </div>
            </div>
            {status.state === "error" && status.message && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-danger/40 bg-danger-soft/95 px-4 py-3 shadow-lg backdrop-blur">
                <p className="text-[12px] font-semibold text-danger">Error</p>
                <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap text-[11.5px] text-danger/90">{status.message}</pre>
              </div>
            )}
          </div>
        </Panel>
      </Group>

      {/* Settings panel — closed by default; toggled from the header. Keeps the
          editor + preview clean like a real design tool. */}
      {showDetails && (
        <aside className="flex w-[340px] shrink-0 flex-col overflow-y-auto rounded-xl border border-line bg-surface shadow-sm">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
            <span className="text-[13px] font-semibold text-ink">Section settings</span>
            <button type="button" onClick={() => setShowDetails(false)} aria-label="Close settings" className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Metadata</p>
              <label className="text-[11px] font-medium text-muted">Status
                <select value={draft.status} onChange={(e) => set("status", e.target.value as SectionLibraryStatus)} className={INPUT}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-[11px] font-medium text-muted">Primary category
                <select
                  value={draft.category}
                  onChange={(e) => {
                    const c = e.target.value as SectionLibraryCategory;
                    setDraft((d) => {
                      const cats = d.categories?.length ? d.categories : [d.category];
                      return { ...d, category: c, categories: Array.from(new Set([c, ...cats])) };
                    });
                  }}
                  className={INPUT}
                >
                  {SECTION_LIBRARY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-muted">Also appears under (assign extra categories)</span>
                <div className="flex flex-wrap gap-1.5">
                  {SECTION_LIBRARY_CATEGORIES.map((c) => {
                    const cats = draft.categories?.length ? draft.categories : [draft.category];
                    const on = cats.includes(c);
                    const isPrimary = c === draft.category;
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={isPrimary}
                        onClick={() => {
                          const cur = draft.categories?.length ? [...draft.categories] : [draft.category];
                          let next = on ? cur.filter((x) => x !== c) : [...cur, c];
                          if (!next.includes(draft.category)) next = [draft.category, ...next];
                          set("categories", Array.from(new Set(next)) as SectionLibraryCategory[]);
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[11px] capitalize transition-colors ${on ? "border-accent bg-accent-soft text-accent" : "border-line text-body hover:bg-panel"} ${isPrimary ? "cursor-default opacity-90" : ""}`}
                        title={isPrimary ? "Primary category" : on ? "Remove category" : "Add category"}
                      >
                        {c}{isPrimary ? " ★" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
              <select value={draft.codeMode} onChange={(e) => set("codeMode", e.target.value as DynamicSectionDef["codeMode"])} className={INPUT}>
                <option value="react">React / TSX</option>
                <option value="html">HTML + CSS</option>
              </select>
              <input value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} placeholder="Tags (comma separated)" className={INPUT} />
              <input value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description" className={INPUT} />
              <input value={draft.originalityRule} onChange={(e) => set("originalityRule", e.target.value)} placeholder="Originality rule" className={INPUT} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Default content</p>
              <input value={draft.defaultContent.eyebrow ?? ""} onChange={(e) => setContent("eyebrow", e.target.value)} placeholder="Eyebrow" className={INPUT} />
              <input value={draft.defaultContent.title ?? ""} onChange={(e) => setContent("title", e.target.value)} placeholder="Heading" className={INPUT} />
              <textarea value={draft.defaultContent.description ?? ""} onChange={(e) => setContent("description", e.target.value)} placeholder="Description" rows={2} className={INPUT} />
              <input value={draft.defaultContent.primaryButtonLabel ?? ""} onChange={(e) => setContent("primaryButtonLabel", e.target.value)} placeholder="Primary button" className={INPUT} />
              <input value={draft.defaultContent.secondaryButtonLabel ?? ""} onChange={(e) => setContent("secondaryButtonLabel", e.target.value)} placeholder="Secondary button" className={INPUT} />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Version history</p>
              {draft.history && draft.history.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {draft.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-line px-3 py-1.5 text-[12px]">
                      <span className="text-muted">{new Date(h.at).toLocaleString()}</span>
                      <button type="button" onClick={() => restore(h.code)} className="font-medium text-accent hover:underline">Restore</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted">No previous versions yet. Each save with changed code adds one.</p>
              )}
            </div>

            <button type="button" onClick={remove} className="self-start text-[12px] font-medium text-danger hover:underline">Delete section</button>
          </div>
        </aside>
      )}
      </div>
    </div>
  );
}

function CatItem({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12.5px] capitalize hover:bg-panel ${active ? "font-semibold text-accent" : "text-ink"}`}
    >
      {label}
      {active && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  );
}
