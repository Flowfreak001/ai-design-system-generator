"use client";

// Project setup workspace (the Overview tab). Two jobs, no step gauntlet:
//   1. Define the pages the site needs (name them; add as many as you want).
//   2. Drop Library sections onto each page — the raw material for the
//      wireframe & design, arranged and styled later in the Design Editor.
// Page structure is persisted to SITEMAP_CANVAS.json via server actions that
// mutate the canvas server-side, so section content is never clobbered.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { LibrarySection } from "@/lib/section-library/manual-sections";

export type SetupPage = { id: string; name: string; sections: { id: string; name: string }[] };

const COMMON_PAGES = ["Home", "About", "Services", "Contact", "Pricing", "Blog", "FAQ", "Gallery", "Testimonials"];

const Icon = {
  plus: <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  trash: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  pencil: <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z M13.5 6.5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  ext: <path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  layers: <path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 18l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
};
const Svg = ({ d, size = 15 }: { d: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">{d}</svg>
);

type Actions = {
  addPage: (projectId: string, name: string) => Promise<{ error?: string; pageId?: string }>;
  renamePage: (projectId: string, pageId: string, name: string) => Promise<{ error?: string }>;
  removePage: (projectId: string, pageId: string) => Promise<{ error?: string }>;
  removeSection: (projectId: string, pageId: string, sectionId: string) => Promise<{ error?: string }>;
  addSection: (projectId: string, pageId: string, sectionId: string) => Promise<{ error?: string; pageId?: string }>;
};

export function ProjectSetup({
  projectId, pages, librarySections, editorHref, actions,
}: {
  projectId: string;
  pages: SetupPage[];
  librarySections: LibrarySection[];
  editorHref: string;
  actions: Actions;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<SetupPage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      setErr(null);
      const res = await fn();
      if (res?.error) { setErr(res.error); return; }
      router.refresh();
    });

  const addPage = (n: string) => {
    const clean = n.trim();
    if (!clean) return;
    setName("");
    run(() => actions.addPage(projectId, clean));
  };

  const totalSections = pages.reduce((n, p) => n + p.sections.length, 0);
  const remaining = COMMON_PAGES.filter((c) => !pages.some((p) => p.name.toLowerCase() === c.toLowerCase()));

  return (
    <div className="grid gap-4">
      {/* Intro + add-page bar */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Pages</p>
            <p className="mt-0.5 max-w-xl text-[13px] text-muted">
              Add the pages your site needs, then drop Library sections onto each one.
              Arrange, reorder and style everything in the Design Editor.
            </p>
          </div>
          <span className="rounded-full bg-panel px-2.5 py-1 text-[11.5px] font-medium text-muted">
            {pages.length} {pages.length === 1 ? "page" : "pages"} · {totalSections} {totalSections === 1 ? "section" : "sections"}
          </span>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); addPage(name); }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Page name — e.g. Home, About, Services…"
            className="min-w-[220px] flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            <Svg d={Icon.plus} /> Add page
          </button>
        </form>

        {remaining.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] text-faint">Quick add:</span>
            {remaining.map((c) => (
              <button
                key={c}
                type="button"
                disabled={pending}
                onClick={() => addPage(c)}
                className="rounded-full border border-line px-2.5 py-1 text-[12px] font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {err && <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{err}</p>}
      </div>

      {/* Page cards */}
      {pages.length === 0 ? (
        <div className="card flex flex-col items-center gap-1 p-12 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-panel text-muted"><Svg d={Icon.layers} size={20} /></span>
          <p className="mt-2 text-sm font-medium text-ink">No pages yet</p>
          <p className="max-w-sm text-[13px] text-muted">Add your first page above, or pick from the quick-add list to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {pages.map((page) => (
              <motion.div
                key={page.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {editingId === page.id ? (
                      <input
                        autoFocus
                        defaultValue={page.name}
                        onBlur={(e) => { setEditingId(null); if (e.target.value.trim() && e.target.value !== page.name) run(() => actions.renamePage(projectId, page.id, e.target.value)); }}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditingId(null); }}
                        className="rounded-md border border-accent bg-surface px-2 py-1 text-[14px] font-semibold text-ink outline-none"
                      />
                    ) : (
                      <h3 className="truncate text-[14px] font-semibold text-ink">{page.name}</h3>
                    )}
                    <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-muted">
                      {page.sections.length} {page.sections.length === 1 ? "section" : "sections"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditingId(page.id)} aria-label={`Rename ${page.name}`} className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-panel hover:text-ink"><Svg d={Icon.pencil} /></button>
                    <button type="button" disabled={pending} onClick={() => run(() => actions.removePage(projectId, page.id))} aria-label={`Remove ${page.name}`} className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"><Svg d={Icon.trash} /></button>
                  </div>
                </div>

                {/* Section chips */}
                {page.sections.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {page.sections.map((s) => (
                      <span key={s.id} className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-2.5 pr-1.5 text-[12px] text-body">
                        {s.name}
                        <button type="button" disabled={pending} onClick={() => run(() => actions.removeSection(projectId, page.id, s.id))} aria-label={`Remove ${s.name}`} className="grid h-4 w-4 place-items-center rounded-full text-faint hover:bg-danger-soft hover:text-danger disabled:opacity-50"><Svg d={Icon.close} size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPickerFor(page)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Svg d={Icon.plus} /> Add section
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Open the editor to arrange & style */}
      {totalSections > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-sm font-semibold text-ink">Ready to design</p>
            <p className="mt-0.5 text-[13px] text-muted">Arrange, reorder, edit content and style your sections in the Design Editor.</p>
          </div>
          <Link href={editorHref} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover">
            ✦ Open Design Editor
          </Link>
        </div>
      )}

      {/* Section picker modal */}
      <AnimatePresence>
        {pickerFor && (
          <SectionPicker
            key={pickerFor.id}
            projectId={projectId}
            page={pickerFor}
            librarySections={librarySections}
            onAdd={(sectionId) => actions.addSection(projectId, pickerFor.id, sectionId)}
            onAdded={() => router.refresh()}
            onClose={() => setPickerFor(null)}
            reduce={Boolean(reduce)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionPicker({
  page, librarySections, onAdd, onAdded, onClose, reduce,
}: {
  projectId: string;
  page: SetupPage;
  librarySections: LibrarySection[];
  onAdd: (sectionId: string) => Promise<{ error?: string }>;
  onAdded: () => void;
  onClose: () => void;
  reduce: boolean;
}) {
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const list = librarySections.filter((s) => !query || [s.name, s.category, ...(s.tags ?? [])].join(" ").toLowerCase().includes(query));

  const add = async (id: string) => {
    setErr(null);
    setBusyId(id);
    const res = await onAdd(id);
    setBusyId(null);
    if (res?.error) { setErr(res.error); return; }
    setAddedIds((a) => [...a, id]);
    onAdded();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-ink">Add section to {page.name}</h3>
            <p className="text-[12px] text-muted">{librarySections.length} sections in your Library</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink"><Svg d={Icon.close} size={16} /></button>
        </div>

        <div className="border-b border-line px-5 py-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search the Library…" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-accent" />
          {err && <p className="mt-2 rounded-lg bg-danger-soft px-3 py-1.5 text-[12px] text-danger">{err}</p>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {list.length === 0 ? (
            <p className="px-1 py-8 text-center text-[13px] text-faint">No sections match “{q}”.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((s) => {
                const added = addedIds.includes(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">{s.name}</p>
                      <p className="truncate text-[11.5px] capitalize text-faint">{s.category}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <a href={`/library/preview/${s.id}`} target="_blank" rel="noopener noreferrer" title="Full-page preview" className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-panel hover:text-ink"><Svg d={Icon.ext} /></a>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => add(s.id)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60 ${added ? "bg-success-soft text-success" : "bg-accent text-white hover:bg-accent-hover"}`}
                      >
                        {busyId === s.id ? "Adding…" : added ? "Added ✓" : (<><Svg d={Icon.plus} size={13} /> Add</>)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-[12px] text-muted">{addedIds.length > 0 ? `${addedIds.length} added to ${page.name}` : "Click Add to drop a section on this page"}</span>
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-ink hover:bg-panel">Done</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
