"use client";

// Centre canvas — renders the store shell + the template's sections using the
// SAME preview renderers as export. Each content section is selectable, sortable
// (dnd-kit) and has a hover toolbar (move / duplicate / hide / delete). The
// locked "main" section (product/collection/…) renders first and can't be removed.

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AnnouncementBar, Header, Footer, renderSection, storeVars, sectionSchemeVars, STORE_CSS, mainSectionId,
} from "@/components/shopify/storefront-preview";
import type { BrandTokens, ShopifySectionInstance } from "@/modules/shopify";
import { getSection } from "@/modules/shopify";

function Toolbar({ onUp, onDown, onDup, onHide, onDel, hidden, dragProps }: {
  onUp: () => void; onDown: () => void; onDup: () => void; onHide: () => void; onDel: () => void; hidden: boolean;
  dragProps: Record<string, unknown>;
}) {
  const btn = "grid h-7 w-7 place-items-center rounded-md bg-ink/80 text-white hover:bg-ink";
  const I = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
  return (
    <div className="absolute right-2 top-2 z-20 flex gap-1" onClick={(e) => e.stopPropagation()}>
      <button className={`${btn} cursor-grab`} {...dragProps} title="Drag to reorder" aria-label="Drag"><I d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" /></button>
      <button className={btn} onClick={onUp} title="Move up" aria-label="Move up"><I d="M12 19V5m0 0-6 6m6-6 6 6" /></button>
      <button className={btn} onClick={onDown} title="Move down" aria-label="Move down"><I d="M12 5v14m0 0 6-6m-6 6-6-6" /></button>
      <button className={btn} onClick={onDup} title="Duplicate" aria-label="Duplicate"><I d="M9 9h10v10H9zM5 15V5h10" /></button>
      <button className={btn} onClick={onHide} title={hidden ? "Show" : "Hide"} aria-label="Hide"><I d={hidden ? "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" : "M3 3l18 18M10 10a2 2 0 0 0 3 3"} /></button>
      <button className="grid h-7 w-7 place-items-center rounded-md bg-danger/90 text-white hover:bg-danger" onClick={onDel} title="Delete" aria-label="Delete"><I d="M5 7h14M10 7V5h4v2m-7 0 1 12h6l1-12" /></button>
    </div>
  );
}

function SortableSection({ inst, brand, selected, onSelect, onUp, onDown, onDup, onHide, onDel }: {
  inst: ShopifySectionInstance; brand: BrandTokens; selected: boolean; onSelect: () => void;
  onUp: () => void; onDown: () => void; onDup: () => void; onHide: () => void; onDel: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: inst.key });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : inst.disabled ? 0.45 : 1 };
  const def = getSection(inst.sectionId);
  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}
      className={`group/sec relative cursor-pointer outline-offset-[-2px] ${selected ? "outline outline-2 outline-accent" : "hover:outline hover:outline-2 hover:outline-accent/40"}`}>
      <div className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-ink/80 px-1.5 py-0.5 text-[10.5px] font-medium text-white opacity-0 group-hover/sec:opacity-100">{def?.name ?? inst.sectionId}{inst.disabled ? " · hidden" : ""}</div>
      <div className="opacity-0 group-hover/sec:opacity-100">
        <Toolbar onUp={onUp} onDown={onDown} onDup={onDup} onHide={onHide} onDel={onDel} hidden={!!inst.disabled} dragProps={{ ...attributes, ...listeners }} />
      </div>
      <div style={sectionSchemeVars(brand, inst)}>{renderSection(inst)}</div>
    </div>
  );
}

export function EditorCanvas({ brand, storeName, template, sections, selectedKey, onSelect, onUp, onDown, onDup, onHide, onDel }: {
  brand: BrandTokens; storeName: string; template: string; sections: ShopifySectionInstance[];
  selectedKey: string | null; onSelect: (key: string | null) => void;
  onUp: (i: number) => void; onDown: (i: number) => void; onDup: (key: string) => void; onHide: (key: string) => void; onDel: (key: string) => void;
}) {
  const mainId = mainSectionId(template);
  const mainInst: ShopifySectionInstance | null = mainId ? { key: "__main", sectionId: mainId } : null;

  return (
    <div className="ff-store" style={storeVars(brand)} onClick={() => onSelect(null)}>
      <AnnouncementBar />
      <Header storeName={storeName} />
      <main>
        {mainInst && (
          <div className="relative" onClick={(e) => { e.stopPropagation(); onSelect("__main"); }}>
            <div className={`pointer-events-none absolute left-2 top-2 z-20 rounded bg-ink/80 px-1.5 py-0.5 text-[10.5px] font-medium text-white`}>{getSection(mainId!)?.name} · locked</div>
            <div className={selectedKey === "__main" ? "outline outline-2 -outline-offset-2 outline-accent" : ""} style={sectionSchemeVars(brand, mainInst)}>{renderSection(mainInst)}</div>
          </div>
        )}
        <SortableContext items={sections.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          {sections.map((inst, i) => (
            <SortableSection key={inst.key} inst={inst} brand={brand} selected={selectedKey === inst.key}
              onSelect={() => onSelect(inst.key)} onUp={() => onUp(i)} onDown={() => onDown(i)}
              onDup={() => onDup(inst.key)} onHide={() => onHide(inst.key)} onDel={() => onDel(inst.key)} />
          ))}
        </SortableContext>
        {sections.length === 0 && !mainInst && (
          <div className="ff-empty" style={{ padding: "80px 24px" }}>Add sections from the left panel to build this page.</div>
        )}
      </main>
      <Footer />
      <style>{STORE_CSS}</style>
    </div>
  );
}
