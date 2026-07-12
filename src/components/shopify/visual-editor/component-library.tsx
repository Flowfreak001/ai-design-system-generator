"use client";

// Left component library — the existing Shopify content sections as draggable /
// clickable cards with a live mini-preview, filtered by the current template and
// grouped by category. Adds to the canvas on click or drag.

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CONTENT_SECTIONS, type BrandTokens, type ShopifySectionDefinition, type ShopifySectionInstance } from "@/modules/shopify";
import { renderSection, storeVars, STORE_CSS } from "@/components/shopify/storefront-preview";

/** Build a sample instance so the thumbnail reflects the section's defaults. */
function sampleInstance(def: ShopifySectionDefinition): ShopifySectionInstance {
  return {
    key: `thumb-${def.id}`,
    sectionId: def.id,
    settings: { ...def.defaultSettings },
    blocks: def.schema.presets?.[0]?.blocks?.map((b, i) => ({ key: `tb-${i}`, type: b.type, settings: { ...(b.settings ?? {}) } })),
  };
}

function LibraryCard({ def, brand, onAdd }: { def: ShopifySectionDefinition; brand: BrandTokens; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `new::${def.id}`, data: { kind: "new", sectionId: def.id } });
  const sample = useMemo(() => sampleInstance(def), [def]);
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      title={def.description}
      className={`group block w-full overflow-hidden rounded-lg border border-line bg-white text-left transition-colors hover:border-accent ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="pointer-events-none relative h-[112px] w-full overflow-hidden bg-white">
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: 1200, transform: "scale(0.2)" }}>
          <div className="ff-store" style={{ ...storeVars(brand), width: 1200 }}>{renderSection(sample)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 py-1.5">
        <span className="truncate text-[12px] font-medium text-ink">{def.name}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="shrink-0 text-muted group-hover:text-accent"><path d="M12 5v14M5 12h14" /></svg>
      </div>
    </button>
  );
}

export function ComponentLibrary({ template, brand, onAdd }: {
  template: string; brand: BrandTokens; onAdd: (sectionId: string) => void;
}) {
  const [q, setQ] = useState("");
  const available = CONTENT_SECTIONS.filter((d) => d.supportedTemplates.includes(template as ShopifySectionDefinition["supportedTemplates"][number]));
  const needle = q.trim().toLowerCase();
  const filtered = needle ? available.filter((d) => (d.name + " " + d.category + " " + d.description).toLowerCase().includes(needle)) : available;

  const byCategory = useMemo(() => {
    const m = new Map<string, ShopifySectionDefinition[]>();
    for (const d of filtered) { const list = m.get(d.category) ?? []; list.push(d); m.set(d.category, list); }
    return [...m.entries()];
  }, [filtered]);

  return (
    <div className="flex h-full flex-col">
      <style>{STORE_CSS}</style>
      <div className="border-b border-line p-3">
        <div className="text-[13px] font-semibold text-ink">Components</div>
        <div className="relative mt-2">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.2-3.2" strokeLinecap="round" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sections" className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-[12.5px] text-ink outline-none placeholder:text-faint focus:border-accent" />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {byCategory.length === 0 && <p className="px-1 py-6 text-center text-[12.5px] text-muted">No sections match.</p>}
        {byCategory.map(([cat, defs]) => (
          <div key={cat}>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">{cat}</div>
            <div className="grid grid-cols-2 gap-2">
              {defs.map((d) => <LibraryCard key={d.id} def={d} brand={brand} onAdd={() => onAdd(d.id)} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
