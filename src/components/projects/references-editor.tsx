"use client";

// Editable reference URLs for the References tab: view mode lists the saved
// links; edit mode lets the user change the existing-site URL and add/remove
// reference + competitor URLs, save, and then re-run analysis (via the
// confirm-first ActionDialog) against the new links.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionDialog } from "@/components/projects/action-dialog";

type SaveResult = { error?: string };

export function ReferencesEditor({
  projectId,
  existingWebsiteUrl,
  referenceUrls,
  competitorUrls,
  save,
  analyze,
}: {
  projectId: string;
  existingWebsiteUrl?: string;
  referenceUrls: string[];
  competitorUrls: string[];
  save: (data: { existingWebsiteUrl?: string; referenceUrls: string[]; competitorUrls: string[] }) => Promise<SaveResult>;
  analyze: () => Promise<void>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [existing, setExisting] = useState(existingWebsiteUrl ?? "");
  const [refs, setRefs] = useState<string[]>(referenceUrls.length ? referenceUrls : [""]);
  const [comps, setComps] = useState<string[]>(competitorUrls);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const rows = [
    ...(existingWebsiteUrl ? [{ label: "Existing website", url: existingWebsiteUrl }] : []),
    ...referenceUrls.map((u) => ({ label: "Reference", url: u })),
    ...competitorUrls.map((u) => ({ label: "Competitor", url: u })),
  ];

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await save({
        existingWebsiteUrl: existing.trim() || undefined,
        referenceUrls: refs.map((u) => u.trim()).filter(Boolean),
        competitorUrls: comps.map((u) => u.trim()).filter(Boolean),
      });
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setEditing(false);
        router.refresh();
      }
    });
  };

  const urlList = (
    label: string,
    values: string[],
    setValues: (v: string[]) => void,
    placeholder: string,
  ) => (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium text-ink">{label}</p>
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            type="url"
            value={v}
            placeholder={placeholder}
            onChange={(e) => setValues(values.map((x, j) => (j === i ? e.target.value : x)))}
            className="font-mono text-xs"
          />
          <button
            type="button"
            aria-label={`Remove ${label} ${i + 1}`}
            onClick={() => setValues(values.filter((_, j) => j !== i))}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-panel hover:text-danger"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setValues([...values, ""])}
        className="w-fit cursor-pointer text-[13px] font-medium text-accent hover:underline"
      >
        + Add {label.toLowerCase().replace(/s$/, "")}
      </button>
    </div>
  );

  if (!editing) {
    return (
      <div className="grid gap-4">
        {rows.length === 0 ? (
          <div className="card flex flex-col items-center p-12 text-center">
            <p className="text-sm font-medium text-ink">No reference URLs yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Add reference websites to improve design accuracy — the system
              analyzes their colors, structure, and animation patterns.
            </p>
            <Button type="button" className="mt-5" onClick={() => setEditing(true)}>
              Add references
            </Button>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="text-sm font-semibold text-ink">Reference links</p>
              <Button type="button" variant="secondary" onClick={() => { setEditing(true); setSaved(false); }}>
                Edit links
              </Button>
            </div>
            <div className="divide-y divide-line">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="rounded-full bg-panel px-2.5 py-0.5 font-mono text-[11px] text-muted">{r.label}</span>
                  <a href={r.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-right font-mono text-xs text-accent hover:underline">
                    {r.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {saved && (
          <p className="text-[13px] text-success">
            Links updated — run the analysis below to regenerate from the new site.
          </p>
        )}
        {rows.length > 0 && (
          <ActionDialog
            projectId={projectId}
            trigger="button"
            title="Analyze References"
            description="Scan the reference site for tokens, metrics, and motion."
            confirmText={`Scan ${existingWebsiteUrl ?? referenceUrls[0] ?? "the reference site"} in a real browser and refresh the four analysis files. Existing analysis is versioned, not lost. Run it now?`}
            runName="Website analysis run"
            action={analyze}
          />
        )}
      </div>
    );
  }

  return (
    <div className="card grid gap-5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Edit reference links</p>
        <p className="text-[12px] text-muted">Analysis uses: existing website → first reference → competitor</p>
      </div>

      <div className="grid gap-2">
        <p className="text-[13px] font-medium text-ink">Existing website</p>
        <Input
          type="url"
          value={existing}
          placeholder="https://current-site.com"
          onChange={(e) => setExisting(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      {urlList("References", refs, setRefs, "https://site-to-extract-design-from.com")}
      {urlList("Competitors", comps, setComps, "https://competitor.com")}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-2.5">
        <Button type="button" onClick={onSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save links"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => { setEditing(false); setError(null); }} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
