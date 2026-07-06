"use client";

// Small control on the client detail page to attach an existing, unlinked
// project to this client. Sits next to "New project" — pick from the agency's
// projects that aren't yet assigned to a client, then Link.

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { linkProjectAction } from "@/app/(app)/clients/actions";

type Option = { id: string; name: string; type: string };

export function LinkProject({ clientId, options }: { clientId: string; options: Option[] }) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (options.length === 0) return null; // nothing to link

  const submit = () => {
    setError(null);
    start(async () => {
      const res = await linkProjectAction(clientId, projectId);
      if (res?.error) setError(res.error);
      else { setOpen(false); setProjectId(""); }
    });
  };

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="-ml-0.5" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Link existing project
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
        autoFocus
      >
        <option value="">Select a project…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} · {o.type === "WEBSITE_APP" ? "Website" : "Automation"}
          </option>
        ))}
      </select>
      <Button onClick={submit} disabled={!projectId || pending}>{pending ? "Linking…" : "Link"}</Button>
      <Button variant="ghost" onClick={() => { setOpen(false); setError(null); }}>Cancel</Button>
      {error && <span className="text-[12.5px] text-danger">{error}</span>}
    </div>
  );
}
