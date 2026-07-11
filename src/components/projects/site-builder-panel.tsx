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
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SITE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplate(tpl.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${template === tpl.id ? "border-accent bg-accent-soft/40" : "border-line hover:border-ink/25"}`}
              >
                <p className="text-[13px] font-semibold text-ink">{tpl.name}</p>
                <p className="mt-0.5 text-[11.5px] text-muted">{tpl.tagline}</p>
              </button>
            ))}
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
