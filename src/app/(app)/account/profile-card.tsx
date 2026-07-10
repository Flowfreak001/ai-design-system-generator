"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction, type ProfileState } from "./actions";

type Field = { label: string; value: string; cap?: boolean };

export function ProfileCard({
  name,
  email,
  initials,
  workspace,
  canEditWorkspace,
  fields,
}: {
  name: string;
  email: string;
  initials: string;
  workspace: string;
  canEditWorkspace: boolean;
  fields: Field[];
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateProfileAction, undefined);

  // Close the editor once a save succeeds.
  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state?.ok]);

  return (
    <div className="card mt-6 max-w-2xl overflow-hidden p-0">
      {/* Identity header. */}
      <div className="flex items-center gap-4 border-b border-line px-6 py-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-[18px] font-semibold text-white">{initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-ink">{name}</p>
          <p className="truncate text-[13px] text-muted">{email}</p>
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="-ml-0.5" aria-hidden="true">
              <path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <form action={formAction} className="grid gap-4 px-6 py-5">
          {state?.error && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-danger">{state.error}</p>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={name} required autoComplete="name" placeholder="Your name" />
          </div>
          {canEditWorkspace && (
            <div className="grid gap-1.5">
              <Label htmlFor="agencyName">Workspace</Label>
              <Input id="agencyName" name="agencyName" defaultValue={workspace} placeholder="Workspace name" />
            </div>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={pending}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <dl className="divide-y divide-line">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center gap-4 px-6 py-3.5">
                <dt className="w-40 shrink-0 text-[12.5px] font-medium text-muted">{f.label}</dt>
                <dd className={`min-w-0 flex-1 truncate text-[13.5px] text-ink ${f.cap ? "capitalize" : ""}`}>{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-line bg-panel/40 px-6 py-3 text-[12px] text-muted">
            Update your name{canEditWorkspace ? " and workspace" : ""} anytime with Edit.
          </div>
        </>
      )}
    </div>
  );
}
