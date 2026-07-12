"use client";

// Shared, schema-driven section controls used by BOTH the form builder
// (shopify-builder.tsx) and the visual editor's settings panel. Renders a
// Shopify section setting field + a block repeater. No section logic here — it
// reads each field's ShopifySettingField and calls back with the new value.

import { getSection, type ShopifySectionInstance, type ShopifySettingField } from "@/modules/shopify";

export const inputCls = "w-full rounded-md border border-line bg-surface px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-faint focus:border-accent";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[12px] font-medium text-body">{label}</span>{children}</label>;
}

export function SettingInput({ field, value, onChange }: { field: ShopifySettingField; value: string | number | boolean | undefined; onChange: (v: string | number | boolean) => void }) {
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

export function BlockEditor({ inst, def, onChange }: { inst: ShopifySectionInstance; def: NonNullable<ReturnType<typeof getSection>>; onChange: (b: ShopifySectionInstance["blocks"]) => void }) {
  const blocks = inst.blocks ?? [];
  const blockDefs = def.schema.blocks ?? [];
  if (blockDefs.length === 0) return null;
  const defByType = new Map(blockDefs.map((bd) => [bd.type, bd]));
  const multi = blockDefs.length > 1; // block composer (custom-section) vs single-type repeater
  const label = multi ? "Blocks" : `${blockDefs[0].name} blocks`;

  const addOf = (bd: (typeof blockDefs)[number]) =>
    onChange([...blocks, { key: `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`, type: bd.type, settings: Object.fromEntries(bd.settings.filter((f) => f.id).map((f) => [f.id!, f.default ?? ""])) }]);
  const remove = (k: string) => onChange(blocks.filter((b) => b.key !== k));
  const move = (k: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.key === k);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const setF = (k: string, id: string, val: string | number | boolean) => onChange(blocks.map((b) => (b.key === k ? { ...b, settings: { ...(b.settings ?? {}), [id]: val } } : b)));

  return (
    <div className="space-y-2 rounded-md bg-panel/50 p-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      {blocks.map((b, i) => {
        const bd = defByType.get(b.type);
        const fields = (bd?.settings ?? []).filter((f) => f.id);
        return (
          <div key={b.key} className="space-y-2 rounded-md border border-line bg-white p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-ink">{bd?.name ?? b.type}</span>
              <div className="flex items-center gap-1 text-muted">
                <button onClick={() => move(b.key, -1)} disabled={i === 0} aria-label="Move up" className="rounded p-0.5 hover:bg-panel disabled:opacity-30"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m0 0-6 6m6-6 6 6" /></svg></button>
                <button onClick={() => move(b.key, 1)} disabled={i === blocks.length - 1} aria-label="Move down" className="rounded p-0.5 hover:bg-panel disabled:opacity-30"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m0 0 6-6m-6 6-6-6" /></svg></button>
                <button onClick={() => remove(b.key)} aria-label="Remove" className="rounded p-0.5 text-danger hover:bg-danger-soft/40"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5h6v2m-7 0 1 13h6l1-13" /></svg></button>
              </div>
            </div>
            {fields.map((f) => <SettingInput key={f.id} field={f} value={b.settings?.[f.id!]} onChange={(v) => setF(b.key, f.id!, v)} />)}
          </div>
        );
      })}
      {multi ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {blockDefs.map((bd) => (
            <button key={bd.type} onClick={() => addOf(bd)} className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-[11.5px] font-medium text-body hover:border-accent hover:text-accent">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>{bd.name}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={() => addOf(blockDefs[0])} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add {blockDefs[0].name.toLowerCase()}
        </button>
      )}
    </div>
  );
}
