"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { removeSavedSectionAction } from "@/lib/saved-sections/actions";

type Saved = { id: string; sectionId: string; name: string; category: string };

export function SavedSectionsList({ items }: { items: Saved[] }) {
  const [rows, setRows] = useState(items);
  const [pending, start] = useTransition();

  const remove = (sectionId: string) => {
    setRows((r) => r.filter((x) => x.sectionId !== sectionId)); // optimistic
    start(async () => {
      const res = await removeSavedSectionAction(sectionId);
      if (!res.ok) setRows(items); // revert on failure
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4.2L5.5 20V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
        </span>
        <p className="mt-4 text-[15px] font-semibold text-ink">No saved sections yet</p>
        <p className="mt-1 text-sm text-muted">Browse the library and tap the bookmark to save sections here.</p>
        <Link href="/components" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white hover:bg-ink/90">
          Browse sections
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3 px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4.2L5.5 20V5a1 1 0 0 1 1-1Z" /></svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold text-ink">{r.name}</p>
            <p className="truncate text-[12.5px] capitalize text-muted">{r.category}</p>
          </div>
          <Link href={`/section-preview/${r.sectionId}`} target="_blank" className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-panel">View</Link>
          <button type="button" onClick={() => remove(r.sectionId)} disabled={pending} aria-label="Remove" title="Remove" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 7V5h4v2m-6 0 .7 12h6.6L18 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
