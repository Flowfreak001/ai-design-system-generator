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
      <button onClick={add} className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add {blockDef.name.toLowerCase()}
      </button>
    </div>
  );
}
