"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { LibrarySection } from "@/lib/section-library/manual-sections";
import { CardThumb, PreviewModule, buildPrompt } from "./public-library";
import { removeSavedSectionAction } from "@/lib/saved-sections/actions";
import { Button } from "@/components/ui/button";

export function SavedSectionsGrid({ sections }: { sections: LibrarySection[] }) {
  const [rows, setRows] = useState(sections);
  const [fullView, setFullView] = useState<LibrarySection | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const copyPrompt = async (s: LibrarySection) => {
    try {
      await navigator.clipboard.writeText(buildPrompt(s));
      setCopiedId(s.id);
      setTimeout(() => setCopiedId((c) => (c === s.id ? null : c)), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const remove = (s: LibrarySection) => {
    setRows((r) => r.filter((x) => x.id !== s.id)); // optimistic
    start(async () => {
      const res = await removeSavedSectionAction(s.id);
      if (!res.ok) setRows(sections); // revert
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4.2L5.5 20V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
        </span>
        <h3 className="mt-5 text-lg font-semibold text-ink">No saved sections yet</h3>
        <p className="mt-2 text-sm text-muted">Browse the library and tap the bookmark on any section to save it here.</p>
        <Link href="/components" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white hover:bg-ink/90">Browse sections</Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((s) => (
          <div key={s.id} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(8,9,10,0.03)]">
            <div role="button" tabIndex={0} onClick={() => setFullView(s)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFullView(s); } }} className="cursor-pointer px-3 pt-3" aria-label={`Full view of ${s.name}`}>
              <CardThumb section={s} />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-ink">{s.name}</span>
                <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted">{s.category}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="secondary" size="icon-sm" onClick={() => setFullView(s)} aria-label="Full view" title="Full view">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>
                </Button>
                <Button variant="secondary" size="icon-sm" onClick={() => copyPrompt(s)} aria-label={copiedId === s.id ? "Copied" : "Copy prompt"} title="Copy prompt">
                  {copiedId === s.id ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                  )}
                </Button>
                <Button variant="secondary" size="icon-sm" onClick={() => remove(s)} disabled={pending} aria-label="Remove from saved" title="Remove from saved" className="ml-auto text-muted hover:text-danger">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5h4v2m-6 0 .7 12h6.6L18 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {fullView && (
        <PreviewModule section={fullView} onClose={() => setFullView(null)} onCopy={() => copyPrompt(fullView)} copied={copiedId === fullView.id} />
      )}
    </>
  );
}
