"use client";

// Editable project brief (the Inputs tab). A lean set of the facts that still
// matter in the Library-driven flow — business type, industry, audience, goal,
// notes. View mode shows what's set; Edit mode saves inline via a server action.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Brief = { businessType?: string; industry?: string; targetAudience?: string; goal?: string; notes?: string };

const FIELDS: { key: keyof Brief; label: string; placeholder: string; textarea?: boolean }[] = [
  { key: "businessType", label: "Business type", placeholder: "e.g. Plumbing, Restaurant, Agency" },
  { key: "industry", label: "Industry", placeholder: "e.g. Trades / home services" },
  { key: "targetAudience", label: "Target audience", placeholder: "Who is this site for?" },
  { key: "goal", label: "Primary goal", placeholder: "What should the site achieve?" },
  { key: "notes", label: "Notes", placeholder: "Anything else worth capturing…", textarea: true },
];

const inputCls = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-accent";

export function ProjectBrief({
  projectId, businessName, initial, save,
}: {
  projectId: string;
  businessName?: string | null;
  initial: Brief;
  save: (projectId: string, patch: Brief) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Brief>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = (k: keyof Brief, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = () => {
    setErr(null);
    start(async () => {
      const res = await save(projectId, form);
      if (res?.error) { setErr(res.error); return; }
      setEditing(false);
      router.refresh();
    });
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Project brief</p>
          <p className="mt-0.5 text-[13px] text-muted">{businessName || "The key facts for this project."}</p>
        </div>
        {!editing ? (
          <button type="button" onClick={() => { setForm(initial); setEditing(true); }} className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-panel">
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink disabled:opacity-50">Cancel</button>
            <button type="button" disabled={pending} onClick={onSave} className="rounded-lg bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-hover disabled:opacity-50">{pending ? "Saving…" : "Save"}</button>
          </div>
        )}
      </div>

      {err && <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{err}</p>}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, placeholder, textarea }) => (
          <div key={key} className={textarea ? "sm:col-span-2" : undefined}>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-faint">{label}</dt>
            <dd className="mt-1">
              {editing ? (
                textarea ? (
                  <textarea value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} rows={3} className={inputCls} />
                ) : (
                  <input value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inputCls} />
                )
              ) : (
                <span className={`text-[13.5px] ${initial[key]?.trim() ? "text-body" : "text-faint"}`}>
                  {initial[key]?.trim() || "Not set"}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
