"use client";

// Repeatable ordered-item editor: add / remove / duplicate / move up-down.
// Controlled list only (no freeform drag, no absolute positioning); the final
// order is what saves, reloads and exports.

import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { SectionEditSchema, SectionItem } from "@/lib/section-editor/types";

const inputCls = "w-full rounded-md bg-panel px-2.5 py-1.5 text-[13px] text-ink outline-none focus:ring-1 focus:ring-accent";

function IconBtn({ title, onClick, disabled, children, danger }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md text-[13px] transition-colors disabled:opacity-25 ${danger ? "text-faint hover:bg-danger-soft hover:text-danger" : "text-muted hover:bg-panel hover:text-ink"}`}>
      {children}
    </button>
  );
}

export function ItemListFields({ schema, items, onChange }: {
  schema: NonNullable<SectionEditSchema["items"]>;
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(items.length ? 0 : null);
  const patch = (i: number, key: string, value: string) => onChange(items.map((x, j) => (j === i ? { ...x, [key]: value } : x)));
  const move = (i: number, dir: -1 | 1) => onChange(arrayMove(items, i, i + dir));
  const remove = (i: number) => { onChange(items.filter((_, j) => j !== i)); setOpen(null); };
  const duplicate = (i: number) => onChange([...items.slice(0, i + 1), { ...items[i] }, ...items.slice(i + 1)]);
  const add = () => { onChange([...items, { ...schema.defaultItem }]); setOpen(items.length); };

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{schema.label} <span className="text-faint/70">({items.length})</span></p>
      <div className="grid gap-1.5">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={`overflow-hidden rounded-lg border ${isOpen ? "border-accent" : "border-line"}`}>
              <div className={`flex items-center gap-1 py-1 pl-2.5 pr-1 ${isOpen ? "bg-accent-soft/30" : ""}`}>
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="min-w-0 flex-1 truncate py-1 text-left text-[12.5px] font-medium text-ink">
                  {item.title || item.text || `${schema.itemNoun} ${i + 1}`}
                </button>
                <IconBtn title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</IconBtn>
                <IconBtn title="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</IconBtn>
                <IconBtn title="Duplicate" onClick={() => duplicate(i)}>⧉</IconBtn>
                <IconBtn title="Delete" onClick={() => remove(i)} danger>✕</IconBtn>
              </div>
              {isOpen && (
                <div className="grid gap-2 border-t border-line p-2.5">
                  {schema.fields.map((f) => (
                    <div key={f.key}>
                      <label className="mb-0.5 block text-[10.5px] font-medium uppercase tracking-wide text-faint">{f.label}</label>
                      {f.kind === "textarea"
                        ? <textarea rows={2} value={(item as Record<string, string | undefined>)[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => patch(i, f.key, e.target.value)} className={`${inputCls} leading-relaxed`} />
                        : <input value={(item as Record<string, string | undefined>)[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => patch(i, f.key, e.target.value)} className={inputCls} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button type="button" onClick={add} className="mt-2 w-full rounded-lg border border-dashed border-accent px-3 py-2 text-[12.5px] font-medium text-accent hover:bg-accent-soft">
        + Add {schema.itemNoun}
      </button>
    </div>
  );
}
