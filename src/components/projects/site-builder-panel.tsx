"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_TEMPLATES } from "@/lib/site-templates";
import {
  createSiteFromTemplateAction,
  publishSiteAction,
  unpublishSiteAction,
  downloadDesignFileAction,
} from "@/app/(app)/projects/[id]/site-actions";

// Inline line icons (stroke 1.7) — one visual family, no emoji.
function TemplateIcon({ id }: { id: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    store: <><path d="M4 8h16l-1 12H5L4 8Z" {...p} /><path d="M9 8a3 3 0 0 1 6 0" {...p} /></>,
    bookings: <><rect x="3.5" y="4.5" width="17" height="16" rx="2" {...p} /><path d="M3.5 9h17M8 3v3M16 3v3M8 13h3" {...p} /></>,
    events: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" {...p} /><path d="M14 6v12" strokeDasharray="1.5 2.5" {...p} /></>,
    content: <><rect x="4" y="3.5" width="16" height="17" rx="2" {...p} /><path d="M8 8h8M8 12h8M8 16h5" {...p} /></>,
  };
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">{paths[id] ?? paths.content}</svg>;
}

/** Assemble + publish a hosted storefront from a prebuilt template. */
export function SiteBuilderPanel({
  projectId,
  connected,
  initial,
}: {
  projectId: string;
  connected: boolean;
  initial: { template: string | null; slug: string | null; published: boolean };
}) {
  const [pending, start] = useTransition();
  const [template, setTemplate] = useState(initial.template ?? SITE_TEMPLATES[0].id);
  const [assembled, setAssembled] = useState(Boolean(initial.template));
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [published, setPublished] = useState(initial.published);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const liveUrl = slug ? `/s/${slug}` : "";

  const assemble = () =>
    start(async () => {
      setError(null); setMsg(null);
      const res = await createSiteFromTemplateAction(projectId, template);
      if (!res.ok) setError(res.error);
      else { setAssembled(true); setMsg(`Assembled ${res.pages} page · ${res.sections} sections from your live catalog.`); }
    });

  const publish = () =>
    start(async () => {
      setError(null); setMsg(null);
      const res = await publishSiteAction(projectId, slug);
      if (!res.ok) setError(res.error);
      else { setPublished(true); setSlug(res.slug); setMsg("Live!"); }
    });

  const unpublish = () =>
    start(async () => { await unpublishSiteAction(projectId); setPublished(false); setMsg("Taken offline."); });

  const downloadDesignFile = () =>
    start(async () => {
      setError(null); setMsg(null);
      const res = await downloadDesignFileAction(projectId);
      if (!res.ok) { setError(res.error); return; }
      const blob = new Blob([res.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = res.filename; a.click();
      URL.revokeObjectURL(url);
      setMsg(`Design file downloaded — ${res.pages} pages · ${res.sections} sections.`);
    });

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold text-ink">Website</p>
          <p className="mt-0.5 text-[12.5px] text-muted">Publish a professional site from a prebuilt template, backed by your Wix data.</p>
        </div>
        {published && liveUrl && (
          <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-hover">
            View live ↗
          </a>
        )}
      </div>

      {!connected ? (
        <p className="mt-3 text-[12.5px] text-muted">Connect a Wix site above to build a store.</p>
      ) : (
        <>
          {/* Template picker */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SITE_TEMPLATES.map((tpl) => {
              const active = template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  disabled={!tpl.available}
                  onClick={() => tpl.available && setTemplate(tpl.id)}
                  className={`relative flex items-start gap-3 rounded-[8px] border p-3.5 text-left transition-colors ${
                    active ? "border-accent bg-accent-soft/50" : "border-line hover:border-ink/20"
                  } ${tpl.available ? "" : "cursor-not-allowed opacity-60"}`}
                >
                  <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active ? "bg-accent text-white" : "bg-panel text-ink"}`}>
                    <TemplateIcon id={tpl.id} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink">{tpl.name}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-body">{tpl.tagline}</span>
                  </span>
                  {!tpl.available && <span className="absolute right-2.5 top-2.5 rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-medium text-muted">Soon</span>}
                  {active && (
                    <span className="absolute right-2.5 top-2.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4 4 10-10" /></svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" disabled={pending} onClick={assemble}>
              {pending ? "Assembling…" : assembled ? "Re-assemble" : "Assemble site"}
            </Button>
            {assembled && (
              <>
                <Button variant="secondary" size="sm" disabled={pending} onClick={downloadDesignFile}>Download design file</Button>
                <a href={`/projects/${projectId}/editor`} className="text-[12.5px] text-muted underline hover:text-ink">Edit in designer</a>
              </>
            )}
          </div>

          {/* Publish */}
          {assembled && (
            <div className="mt-4 border-t border-line pt-4">
              <label className="text-[12.5px] font-medium text-ink">Site URL</label>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-muted">/s/</span>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-store" className="h-9 w-48" />
                {published ? (
                  <Button variant="secondary" size="sm" disabled={pending} onClick={unpublish}>Unpublish</Button>
                ) : (
                  <Button size="sm" disabled={pending || slug.length < 3} onClick={publish}>{pending ? "Publishing…" : "Publish"}</Button>
                )}
              </div>
              {published && liveUrl && (
                <p className="mt-2 text-[12.5px] text-success">✓ Live at <a href={liveUrl} target="_blank" rel="noreferrer" className="underline">{liveUrl}</a></p>
              )}
            </div>
          )}
        </>
      )}

      {msg && !error && <p className="mt-3 text-[12.5px] text-success">{msg}</p>}
      {error && <p className="mt-3 text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}
