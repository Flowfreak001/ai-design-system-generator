"use client";

// Shopify Builder workspace — tabs for Overview, Brand, Pages (section editor),
// Preview (React storefront), and Export (deterministic Liquid theme ZIP).
// State is held here and persisted via server actions; generation/validation and
// the Liquid output live in the isolated src/modules/shopify module.

import { useState, useMemo, useRef, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StorefrontPreview } from "@/components/shopify/storefront-preview";
import { CONTENT_SECTIONS, getSection, type BrandTokens, type ShopifyPage, type ShopifySectionInstance, type ShopifySettingField } from "@/modules/shopify";
import { saveBrandAction, savePagesAction, exportThemeAction } from "@/app/(app)/projects/[id]/shopify/actions";

type Tab = "overview" | "brand" | "pages" | "preview" | "export";
const EASE = [0.22, 1, 0.36, 1] as const;

export interface BuilderInit {
  projectId: string;
  projectName: string;
  storeName: string;
  themeName: string;
  industry: string;
  brand: BrandTokens;
  pages: ShopifyPage[];
}

const TEMPLATE_LABEL: Record<string, string> = { index: "Home", product: "Product", collection: "Collection", "list-collections": "Collections", cart: "Cart", search: "Search", blog: "Blog", article: "Article", page: "Page" };

// Templates the storefront preview can show (main sections auto-injected).
const PREVIEW_TEMPLATES: { template: string; label: string }[] = [
  { template: "index", label: "Home" }, { template: "product", label: "Product" },
  { template: "collection", label: "Collection" }, { template: "cart", label: "Cart" },
  { template: "search", label: "Search" }, { template: "blog", label: "Blog" },
];

function Icon({ d, className }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden><path d={d} /></svg>;
}
const ICONS = {
  overview: "M4 5h16M4 12h16M4 19h10",
  brand: "M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4Z",
  pages: "M5 4h9l5 5v11H5V4Zm9 0v5h5",
  preview: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  export: "M12 3v12m0-12 4 4m-4-4-4 4M5 15v4h14v-4",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M9 7V5h6v2m-7 0 1 13h6l1-13",
  up: "M12 19V5m0 0-6 6m6-6 6 6",
  down: "M12 5v14m0 0 6-6m-6 6-6-6",
};

export function ShopifyBuilder(init: BuilderInit) {
  const [tab, setTab] = useState<Tab>("overview");
  const [pages, setPages] = useState<ShopifyPage[]>(init.pages);
  const [brand, setBrand] = useState<BrandTokens>(init.brand);
  const [storeName, setStoreName] = useState(init.storeName);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "brand", label: "Brand" },
    { id: "pages", label: "Pages" },
    { id: "preview", label: "Preview" },
    { id: "export", label: "Export" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5 border-b border-line">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 rounded-t-md px-3.5 py-2.5 text-[13.5px] font-medium transition-colors ${active ? "text-ink" : "text-muted hover:text-body"}`}>
              <Icon d={ICONS[t.id]} className="h-4 w-4" />{t.label}
              {active && <motion.span layoutId="shopify-tab" className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: EASE }}>
          {tab === "overview" && <Overview init={init} pages={pages} brand={brand} storeName={storeName} onGo={setTab} />}
          {tab === "brand" && <BrandTab projectId={init.projectId} storeName={storeName} themeName={init.themeName} industry={init.industry} brand={brand} onSaved={(sn, b) => { setStoreName(sn); setBrand(b); }} />}
          {tab === "pages" && <PagesTab projectId={init.projectId} pages={pages} setPages={setPages} />}
          {tab === "preview" && <PreviewTab pages={pages} brand={brand} storeName={storeName} />}
          {tab === "export" && <ExportTab projectId={init.projectId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ init, pages, brand, storeName, onGo }: { init: BuilderInit; pages: ShopifyPage[]; brand: BrandTokens; storeName: string; onGo: (t: Tab) => void }) {
  const sectionCount = pages.reduce((n, p) => n + p.sections.length, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Store" value={storeName || init.projectName} sub={init.industry || "Shopify Online Store 2.0"} />
        <Stat label="Templates" value={String(pages.length)} sub={pages.map((p) => TEMPLATE_LABEL[p.template] ?? p.template).join(" · ")} />
        <Stat label="Sections placed" value={String(sectionCount)} sub="across all templates" />
      </div>
      <div className="rounded-[10px] border border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-ink">Brand palette</span>
          <div className="flex gap-1.5">
            {[brand.primaryColor, brand.secondaryColor, brand.backgroundColor, brand.textColor].map((c, i) => (
              <span key={i} className="h-6 w-6 rounded-md border border-line" style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
        <p className="mt-3 text-[12.5px] text-body">This Shopify store is built as a native theme — deterministic Liquid + JSON templates. Set your brand, assemble page sections, preview, then export a Shopify-ready theme ZIP.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onGo("brand")}>Edit brand</Button>
          <Button size="sm" variant="secondary" onClick={() => onGo("pages")}>Assemble pages</Button>
          <Button size="sm" variant="secondary" onClick={() => onGo("export")}>Export theme</Button>
        </div>
      </div>
      <div className="rounded-[10px] border border-dashed border-line bg-panel/40 p-4 text-[12px] text-muted">
        <b className="text-body">Not yet connected to Shopify.</b> Direct theme publishing via OAuth is a later phase — for now, export the theme ZIP and upload it in your Shopify admin (Online Store → Themes → Upload).
      </div>
    </div>
  );
}
function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-white p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 truncate text-[19px] font-semibold text-ink">{value}</div>
      <div className="mt-0.5 truncate text-[12px] text-body">{sub}</div>
    </div>
  );
}

// ── Brand ─────────────────────────────────────────────────────────────────────
function BrandTab({ projectId, storeName, themeName, industry, brand, onSaved }: {
  projectId: string; storeName: string; themeName: string; industry: string; brand: BrandTokens; onSaved: (storeName: string, b: BrandTokens) => void;
}) {
  const [form, setForm] = useState({ storeName, themeName, industry, ...brand });
  const [state, setState] = useState<{ ok?: boolean; error?: string }>({});
  const [pending, setPending] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setPending(true); setState({});
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    const res = await saveBrandAction(projectId, {}, fd);
    setPending(false);
    setState(res);
    if (res.ok) onSaved(form.storeName, {
      ...brand,
      primaryColor: form.primaryColor, secondaryColor: form.secondaryColor, backgroundColor: form.backgroundColor, textColor: form.textColor,
      headingFont: form.headingFont, bodyFont: form.bodyFont, borderRadius: form.borderRadius, spacingScale: form.spacingScale,
      headingScale: Number(form.headingScale ?? 1.1), bodyScale: Number(form.bodyScale ?? 1),
      buttonStyle: (form.buttonStyle as BrandTokens["buttonStyle"]) ?? "solid", cardStyle: (form.cardStyle as BrandTokens["cardStyle"]) ?? "bordered",
      animate: form.animate !== false && String(form.animate) !== "false",
    });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Field label="Store name"><input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} className={inputCls} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Theme name"><input value={form.themeName} onChange={(e) => set("themeName", e.target.value)} placeholder="e.g. Aurora" className={inputCls} /></Field>
        <Field label="Industry"><input value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Home goods" className={inputCls} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Primary" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
        <ColorField label="Accent" value={form.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
        <ColorField label="Background" value={form.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <ColorField label="Text" value={form.textColor} onChange={(v) => set("textColor", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Heading font"><input value={form.headingFont} onChange={(e) => set("headingFont", e.target.value)} className={inputCls} /></Field>
        <Field label="Body font"><input value={form.bodyFont} onChange={(e) => set("bodyFont", e.target.value)} className={inputCls} /></Field>
        <Field label="Corner radius"><input value={form.borderRadius} onChange={(e) => set("borderRadius", e.target.value)} placeholder="10px" className={inputCls} /></Field>
        <Field label="Spacing scale"><input value={form.spacingScale} onChange={(e) => set("spacingScale", e.target.value)} placeholder="1" className={inputCls} /></Field>
      </div>

      <div className="border-t border-line pt-5">
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted">Style</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Heading scale: ${Number(form.headingScale ?? 1.1).toFixed(2)}`}><input type="range" min={1} max={1.4} step={0.05} value={Number(form.headingScale ?? 1.1)} onChange={(e) => set("headingScale", e.target.value)} className="w-full" /></Field>
          <Field label={`Body scale: ${Number(form.bodyScale ?? 1).toFixed(2)}`}><input type="range" min={0.9} max={1.2} step={0.05} value={Number(form.bodyScale ?? 1)} onChange={(e) => set("bodyScale", e.target.value)} className="w-full" /></Field>
          <Field label="Button style"><select value={String(form.buttonStyle ?? "solid")} onChange={(e) => set("buttonStyle", e.target.value)} className={inputCls}><option value="solid">Solid</option><option value="outline">Outline</option></select></Field>
          <Field label="Card style"><select value={String(form.cardStyle ?? "bordered")} onChange={(e) => set("cardStyle", e.target.value)} className={inputCls}><option value="bordered">Bordered</option><option value="elevated">Elevated</option><option value="flat">Flat</option></select></Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-[13px] text-body"><input type="checkbox" checked={form.animate !== false && String(form.animate) !== "false"} onChange={(e) => set("animate", e.target.checked ? "true" : "false")} />Reveal sections on scroll</label>
      </div>

      {state.error && <p className="rounded-md bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{state.error}</p>}
      {state.ok && <p className="rounded-md bg-success-soft px-3 py-2 text-[12.5px] text-success">Brand saved.</p>}
      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save brand"}</Button>
        <span className="text-[12px] text-muted">Feeds the theme’s <code>settings_data.json</code> and CSS variables.</span>
      </div>
    </div>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-md border border-line bg-white p-0.5" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      </div>
    </Field>
  );
}

// ── Pages editor ──────────────────────────────────────────────────────────────
// Each storefront template has a locked "main" section (Shopify OS 2.0). Content
// sections are added around it.
const TEMPLATE_MAIN: Record<string, { id: string; label: string }> = {
  product: { id: "main-product", label: "Product details" },
  collection: { id: "main-collection", label: "Product grid" },
  cart: { id: "main-cart", label: "Cart" },
  search: { id: "main-search", label: "Search results" },
  blog: { id: "main-blog", label: "Blog posts" },
  page: { id: "main-page", label: "Page content" },
};
// Templates every store has, shown in the editor even before customization.
const BUILDER_TEMPLATES: { template: ShopifyPage["template"]; label: string }[] = [
  { template: "index", label: "Home" }, { template: "product", label: "Product" },
  { template: "collection", label: "Collection" }, { template: "cart", label: "Cart" },
  { template: "search", label: "Search" }, { template: "blog", label: "Blog" },
];

function PagesTab({ projectId, pages, setPages }: { projectId: string; pages: ShopifyPage[]; setPages: (p: ShopifyPage[]) => void }) {
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const firstRun = useRef(true);

  // The editor lists the canonical storefront templates + any custom pages the
  // user added (page.handle). Templates not yet in state show as empty.
  const templates: ShopifyPage[] = [
    ...BUILDER_TEMPLATES.map((t) => pages.find((p) => p.template === t.template && !p.handle) ?? { template: t.template, sections: [] }),
    ...pages.filter((p) => p.handle),
  ];
  const page = templates[active] ?? templates[0];
  const sameKey = (p: ShopifyPage) => p.template === page.template && (p.handle ?? "") === (page.handle ?? "");

  // Debounced autosave whenever the tree changes.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setSaved("saving");
    const t = setTimeout(async () => {
      const res = await savePagesAction(projectId, JSON.stringify(pages));
      if (res.ok) { setSaved("ok"); setErr(""); } else { setSaved("err"); setErr(res.error ?? "Save failed"); }
    }, 700);
    return () => clearTimeout(t);
  }, [pages, projectId]);

  const mutate = useCallback((fn: (p: ShopifyPage[]) => ShopifyPage[]) => setPages(fn(pages)), [pages, setPages]);

  // Write the active template's sections back into state, creating the page row
  // if it doesn't exist yet (canonical templates start synthetic/empty).
  const updatePageSections = (sections: ShopifySectionInstance[]) =>
    mutate((ps) => {
      const idx = ps.findIndex(sameKey);
      if (idx >= 0) return ps.map((p, i) => (i === idx ? { ...p, sections } : p));
      return [...ps, { template: page.template, handle: page.handle, sections }];
    });

  const addSection = (sectionId: string) => {
    const def = getSection(sectionId);
    if (!def) return;
    const inst: ShopifySectionInstance = {
      key: `s-${Date.now().toString(36)}`,
      sectionId,
      settings: { ...def.defaultSettings },
      blocks: def.schema.presets?.[0]?.blocks?.map((b, i) => ({ key: `b-${Date.now().toString(36)}-${i}`, type: b.type, settings: { ...(b.settings ?? {}) } })),
    };
    updatePageSections([...page.sections, inst]);
  };
  const removeSection = (key: string) => updatePageSections(page.sections.filter((s) => s.key !== key));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...page.sections];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    updatePageSections(next);
  };
  const patch = (key: string, settings: Record<string, string | number | boolean>, blocks?: ShopifySectionInstance["blocks"]) =>
    updatePageSections(page.sections.map((s) => (s.key === key ? { ...s, settings, ...(blocks ? { blocks } : {}) } : s)));

  const addable = CONTENT_SECTIONS.filter((d) => d.supportedTemplates.includes(page.template));

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <div className="space-y-1">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">Templates</div>
        {templates.map((p, i) => (
          <button key={`${p.template}-${p.handle ?? ""}`} onClick={() => setActive(i)}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors ${i === active ? "bg-accent-soft text-accent" : "text-body hover:bg-panel"}`}>
            <span>{TEMPLATE_LABEL[p.template] ?? p.template}{p.handle ? ` · ${p.handle}` : ""}</span>
            <span className="text-[11px] opacity-70">{(TEMPLATE_MAIN[p.template] ? 1 : 0) + p.sections.length}</span>
          </button>
        ))}
        <div className="pt-2 text-[11px] text-muted">
          {saved === "saving" && "Saving…"}
          {saved === "ok" && <span className="text-success">All changes saved</span>}
          {saved === "err" && <span className="text-danger">{err}</span>}
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-ink">{TEMPLATE_LABEL[page.template] ?? page.template} sections</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {addable.map((d) => (
              <button key={d.id} onClick={() => addSection(d.id)}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-body transition-colors hover:border-accent hover:text-accent">
                <Icon d={ICONS.plus} className="h-3.5 w-3.5" />{d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Locked "main" section — the core of this storefront template (Shopify OS 2.0). */}
        {TEMPLATE_MAIN[page.template] && (
          <div className="flex items-center gap-2 rounded-[10px] border border-line bg-panel/50 px-3.5 py-3">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0 text-muted"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            <span className="text-[13px] font-medium text-ink">{TEMPLATE_MAIN[page.template].label}</span>
            <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-medium text-muted">Core · locked</span>
            <span className="ml-auto text-[11.5px] text-muted">Always rendered on this template</span>
          </div>
        )}

        {page.sections.length === 0 && !TEMPLATE_MAIN[page.template] && (
          <div className="rounded-[10px] border border-dashed border-line bg-panel/40 px-4 py-10 text-center text-[13px] text-muted">
            No sections on this template yet. Add one above.
          </div>
        )}
        {page.sections.length === 0 && TEMPLATE_MAIN[page.template] && (
          <p className="px-1 text-[12px] text-muted">Add content sections above to appear around the {TEMPLATE_MAIN[page.template].label.toLowerCase()}.</p>
        )}

        {page.sections.map((inst, idx) => (
          <SectionCard key={inst.key} inst={inst} idx={idx} count={page.sections.length}
            onMove={move} onRemove={removeSection} onPatch={patch} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ inst, idx, count, onMove, onRemove, onPatch }: {
  inst: ShopifySectionInstance; idx: number; count: number;
  onMove: (i: number, d: -1 | 1) => void; onRemove: (k: string) => void;
  onPatch: (k: string, s: Record<string, string | number | boolean>, b?: ShopifySectionInstance["blocks"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const def = getSection(inst.sectionId);
  if (!def) return null;
  const settings = inst.settings ?? {};
  const editable = def.schema.settings.filter((f) => f.id && !["image_picker", "product", "collection", "color_scheme", "video_url"].includes(f.type));

  const setField = (id: string, value: string | number | boolean) => onPatch(inst.key, { ...settings, [id]: value });

  return (
    <div className="rounded-[10px] border border-line bg-white">
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <button onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}><path d="m9 6 6 6-6 6" /></svg>
          <span className="truncate text-[13px] font-medium text-ink">{def.name}</span>
        </button>
        <button onClick={() => onMove(idx, -1)} disabled={idx === 0} className="rounded p-1 text-muted hover:text-ink disabled:opacity-30" aria-label="Move up"><Icon d={ICONS.up} className="h-3.5 w-3.5" /></button>
        <button onClick={() => onMove(idx, 1)} disabled={idx === count - 1} className="rounded p-1 text-muted hover:text-ink disabled:opacity-30" aria-label="Move down"><Icon d={ICONS.down} className="h-3.5 w-3.5" /></button>
        <button onClick={() => onRemove(inst.key)} className="rounded p-1 text-muted hover:text-danger" aria-label="Remove"><Icon d={ICONS.trash} className="h-3.5 w-3.5" /></button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: EASE }} className="overflow-hidden">
            <div className="space-y-3 border-t border-line px-3.5 py-3.5">
              {editable.map((f) => <SettingInput key={f.id} field={f} value={settings[f.id!]} onChange={(v) => setField(f.id!, v)} />)}
              {def.schema.blocks && <BlockEditor inst={inst} def={def} onChange={(blocks) => onPatch(inst.key, settings, blocks)} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingInput({ field, value, onChange }: { field: ShopifySettingField; value: string | number | boolean | undefined; onChange: (v: string | number | boolean) => void }) {
  const v = value ?? field.default ?? "";
  const id = field.id!;
  if (field.type === "checkbox") {
    return <label className="flex items-center gap-2 text-[12.5px] text-body"><input type="checkbox" checked={Boolean(value ?? field.default)} onChange={(e) => onChange(e.target.checked)} />{field.label ?? id}</label>;
  }
  if (field.type === "select") {
    return <Field label={field.label ?? id}><select value={String(v)} onChange={(e) => onChange(e.target.value)} className={inputCls}>{field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>;
  }
  if (field.type === "range") {
    return <Field label={`${field.label ?? id}: ${v}${field.unit ?? ""}`}><input type="range" min={field.min} max={field.max} step={field.step} value={Number(v)} onChange={(e) => onChange(Number(e.target.value))} className="w-full" /></Field>;
  }
  if (field.type === "color") {
    return <Field label={field.label ?? id}><div className="flex items-center gap-2"><input type="color" value={/^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 rounded-md border border-line p-0.5" /><input value={String(v)} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div></Field>;
  }
  if (field.type === "richtext" || field.type === "textarea") {
    return <Field label={field.label ?? id}><textarea value={String(v)} onChange={(e) => onChange(e.target.value)} rows={2} className={`${inputCls} resize-y`} /></Field>;
  }
  return <Field label={field.label ?? id}><input value={String(v)} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={inputCls} /></Field>;
}

function BlockEditor({ inst, def, onChange }: { inst: ShopifySectionInstance; def: NonNullable<ReturnType<typeof getSection>>; onChange: (b: ShopifySectionInstance["blocks"]) => void }) {
  const blocks = inst.blocks ?? [];
  const blockDef = def.schema.blocks?.[0];
  if (!blockDef) return null;
  const fields = blockDef.settings.filter((f) => f.id);
  const add = () => onChange([...blocks, { key: `b-${Date.now().toString(36)}`, type: blockDef.type, settings: Object.fromEntries(fields.map((f) => [f.id!, f.default ?? ""])) }]);
  const remove = (k: string) => onChange(blocks.filter((b) => b.key !== k));
  const setF = (k: string, id: string, val: string | number | boolean) => onChange(blocks.map((b) => (b.key === k ? { ...b, settings: { ...(b.settings ?? {}), [id]: val } } : b)));
  return (
    <div className="space-y-2 rounded-md bg-panel/50 p-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{blockDef.name} blocks</div>
      {blocks.map((b) => (
        <div key={b.key} className="space-y-2 rounded-md border border-line bg-white p-2.5">
          {fields.map((f) => <SettingInput key={f.id} field={f} value={b.settings?.[f.id!]} onChange={(v) => setF(b.key, f.id!, v)} />)}
          <button onClick={() => remove(b.key)} className="text-[11.5px] text-danger hover:underline">Remove</button>
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"><Icon d={ICONS.plus} className="h-3.5 w-3.5" />Add {blockDef.name.toLowerCase()}</button>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────
function PreviewTab({ pages, brand, storeName }: { pages: ShopifyPage[]; brand: BrandTokens; storeName: string }) {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState<number | "full">("full");
  const widths: { id: number | "full"; label: string }[] = [
    { id: 390, label: "Mobile" }, { id: 768, label: "Tablet" }, { id: "full", label: "Desktop" },
  ];
  // Every storefront template is previewable; use the user's page if it exists,
  // otherwise a synthetic empty page (the preview injects the main section).
  const tabs = PREVIEW_TEMPLATES.map((t) => pages.find((p) => p.template === t.template && !p.handle) ?? { template: t.template as ShopifyPage["template"], sections: [] });
  const page = tabs[active] ?? tabs[0];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-md bg-panel p-1">
          {PREVIEW_TEMPLATES.map((t, i) => (
            <button key={t.template} onClick={() => setActive(i)} className={`rounded px-2.5 py-1 text-[12px] font-medium ${i === active ? "bg-white text-ink shadow-sm" : "text-muted"}`}>{t.label}</button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-md bg-panel p-1">
          {widths.map((w) => (
            <button key={String(w.id)} onClick={() => setWidth(w.id)} className={`rounded px-2.5 py-1 text-[12px] font-medium ${width === w.id ? "bg-white text-ink shadow-sm" : "text-muted"}`}>{w.label}</button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-line bg-panel/40 p-4">
        <div className="mx-auto overflow-hidden rounded-[10px] border border-line bg-white shadow-sm transition-all" style={{ maxWidth: width === "full" ? "100%" : width }}>
          <StorefrontPreview brand={brand} page={page} storeName={storeName} />
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
function ExportTab({ projectId }: { projectId: string }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: ReactNode } | null>(null);

  const run = async () => {
    setPending(true); setResult(null);
    const res = await exportThemeAction(projectId);
    setPending(false);
    if (!res.ok) {
      setResult({ ok: false, msg: <><b>{res.error}</b>{res.issues?.length ? <ul className="mt-1 list-disc pl-4">{res.issues.slice(0, 8).map((m, i) => <li key={i}>{m}</li>)}</ul> : null}</> });
      return;
    }
    const bytes = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
    const a = document.createElement("a");
    a.href = url; a.download = res.fileName; a.click();
    URL.revokeObjectURL(url);
    setResult({ ok: true, msg: <>Exported <b>{res.fileName}</b> — {res.fileCount} theme files. Upload it in Shopify: Online Store → Themes → Add theme → Upload ZIP.</> });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-[10px] border border-line bg-white p-5">
        <h3 className="text-[15px] font-semibold text-ink">Export Shopify theme</h3>
        <p className="mt-1.5 text-[13px] text-body">Generates a complete, valid Online Store 2.0 theme (Liquid sections, JSON templates, settings, snippets, locales) from your brand and pages. Output is deterministic — the same store always produces the same theme.</p>
        <div className="mt-4"><Button onClick={run} disabled={pending}>{pending ? "Generating…" : "Generate & download ZIP"}</Button></div>
      </div>
      {result && (
        <div className={`rounded-md px-3.5 py-3 text-[12.5px] ${result.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>{result.msg}</div>
      )}
      <p className="text-[11.5px] text-muted">Direct publishing to a connected Shopify store (OAuth) is planned for a later phase; the theme validator already blocks export on any structural error.</p>
    </div>
  );
}

// ── shared bits ────────────────────────────────────────────────────────────────
const inputCls = "w-full rounded-md border border-line bg-surface px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-faint focus:border-accent";
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[12px] font-medium text-body">{label}</span>{children}</label>;
}
