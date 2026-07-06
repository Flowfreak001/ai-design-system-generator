"use client";

// In-editor Section Library — the section builder for the sitemap/wireframe.
// Research note: good section builders (Relume, Framer, Webflow) let you pick a
// section by its STRUCTURE, not its brand colours. So every thumbnail renders in
// one neutral grayscale wireframe theme at a fixed aspect — uniform, scannable,
// low-fidelity — then the real brand theme applies once it's on the canvas.

import { useMemo, useRef, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import type { SectionTheme } from "@/components/sections/types";
import type { LibrarySection } from "@/lib/section-library/manual-sections";
import { SECTION_LIBRARY_CATEGORIES } from "@/lib/section-library/manual-sections";
import { WIREFRAME_SECTION_THEME } from "@/components/sections/section-theme";
import { SectionErrorBoundary, renderLibrarySection } from "@/components/section-library/section-render";

/** Uniform, low-fidelity wireframe thumbnail: the section rendered at page width
 *  in the neutral grayscale theme, scaled to a fixed-height frame. */
function WireframeThumb({ section }: { section: LibrarySection }) {
  const BASE = 1280;
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BASE));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="pointer-events-none relative h-[92px] w-full overflow-hidden rounded-md bg-white">
      <div style={{ width: BASE, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <SectionErrorBoundary>{renderLibrarySection(section, WIREFRAME_SECTION_THEME, false)}</SectionErrorBoundary>
      </div>
      {/* Faint grid tint sells the "wireframe" read. */}
      <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-line/70" />
    </div>
  );
}

export function SectionLibraryPanel({
  sections, pageName, canAdd, onAdd, onManage,
}: {
  sections: LibrarySection[];
  theme?: SectionTheme; // (unused now — thumbnails are always wireframe)
  pageName: string | null;
  canAdd: boolean;
  onAdd: (section: LibrarySection) => void;
  onManage: () => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  const cats = useMemo(
    () => ["all", ...SECTION_LIBRARY_CATEGORIES.filter((c) => sections.some((s) => s.category === c))],
    [sections],
  );
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sections.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (!needle) return true;
      return [s.name, s.description, ...s.tags].join(" ").toLowerCase().includes(needle);
    });
  }, [sections, q, cat]);

  const add = (s: LibrarySection) => {
    if (!canAdd) return;
    onAdd(s);
    setAddedId(s.id);
    setTimeout(() => setAddedId((c) => (c === s.id ? null : c)), 1100);
  };

  return (
    <div className="flex h-full flex-col bg-panel/30">
      {/* Destination + search + filters. */}
      <div className="space-y-2.5 border-b border-line bg-surface px-4 py-3">
        <p className="text-[12px] text-muted">
          {canAdd ? <>Adding to <span className="font-medium text-ink">{pageName}</span></> : "Select a page to add sections."}
        </p>
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections…"
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-[13px] text-ink outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors ${
                cat === c ? "bg-ink text-surface" : "bg-panel text-muted hover:text-ink"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of uniform wireframe tiles. */}
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {filtered.length === 0 ? (
          <p className="pt-8 text-center text-[13px] text-faint">No sections match.</p>
        ) : (
          <div className="grid gap-2.5">
            {filtered.map((s) => {
              const added = addedId === s.id;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={canAdd ? { y: -2 } : undefined}
                  className={`group overflow-hidden rounded-xl border bg-surface transition-colors ${added ? "border-success" : "border-line hover:border-accent/60"}`}
                >
                  {/* Wireframe preview on a soft well. */}
                  <div className="bg-panel/60 p-2">
                    <WireframeThumb section={s} />
                  </div>
                  {/* Meta + add. */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{s.name}</p>
                      <p className="truncate text-[11px] capitalize text-faint">{s.category} · {s.layoutType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => add(s)}
                      disabled={!canAdd}
                      title={canAdd ? "Add to page" : "Select a page first"}
                      className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-40 ${
                        added ? "bg-success-soft text-success" : "bg-accent text-white hover:bg-accent-hover"
                      }`}
                    >
                      {added ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Added</>
                      ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Add</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer → full library for authoring / Studio. */}
      <div className="border-t border-line bg-surface px-4 py-2.5">
        <button type="button" onClick={onManage} className="text-[12px] font-medium text-accent hover:underline">
          Manage library &amp; create sections →
        </button>
      </div>
    </div>
  );
}
