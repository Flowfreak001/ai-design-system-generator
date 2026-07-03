"use client";

// Full-page live preview: renders a page's sections stacked in a real,
// window-scrolled document (no editor zoom, no nested scroll container) so
// scroll-driven sections (e.g. Sticky Expanding Media) actually animate.
// A small floating bar switches pages and returns to the editor.

import { useState } from "react";
import Link from "next/link";
import { renderSectionByKind } from "@/components/sections/render-section";
import { createSectionTheme } from "@/components/sections/section-theme";
import { sectionKind } from "@/lib/sections";
import type { CanvasPage, StyleGuideCanvas } from "@/lib/canvas";

export function PagePreview({ projectId, pages, style, initialPageId }: {
  projectId: string;
  pages: CanvasPage[];
  style: StyleGuideCanvas;
  initialPageId?: string;
}) {
  const theme = createSectionTheme(style);
  const [pageId, setPageId] = useState<string>(initialPageId && pages.some((p) => p.id === initialPageId) ? initialPageId : pages[0]?.id ?? "");
  const page = pages.find((p) => p.id === pageId) ?? pages[0];

  return (
    <div style={{ background: theme.backgroundColor }}>
      {/* Rendered page — real window scroll drives scroll-based sections. */}
      <main>
        {page?.sections.filter((s) => s.status !== "rejected").map((s) => (
          <div key={s.id}>
            {renderSectionByKind(sectionKind(s.name), s.variant, {
              name: s.name,
              note: s.note,
              theme,
              assetSide: s.asset === "left" ? "left" : "right",
            })}
          </div>
        ))}
        {(!page || page.sections.length === 0) && (
          <div className="grid min-h-[60vh] place-items-center text-[14px] text-neutral-500">This page has no sections yet.</div>
        )}
      </main>

      {/* Floating control bar (bottom center) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
        <div className="pointer-events-auto flex max-w-[92vw] items-center gap-1 overflow-x-auto rounded-full border border-black/10 bg-white/95 p-1 shadow-xl backdrop-blur">
          <Link href={`/projects/${projectId}/editor`} className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium text-neutral-600 hover:bg-neutral-100">← Editor</Link>
          <span className="mx-0.5 h-4 w-px bg-black/10" />
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setPageId(p.id); window.scrollTo({ top: 0 }); }}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium ${p.id === pageId ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
