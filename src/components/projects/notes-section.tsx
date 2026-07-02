"use client";

import { useActionState } from "react";
import { addNoteAction, type FormState } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";

export type NoteItem = {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date | string;
};

export function NotesSection({
  projectId,
  notes,
}: {
  projectId: string;
  notes: NoteItem[];
}) {
  const action = addNoteAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <form action={formAction} className="card h-fit p-5">
        <p className="eyebrow mb-4">Add note / decision</p>
        {state?.error && (
          <p role="alert" className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {state.error}
          </p>
        )}
        <input
          name="title"
          placeholder="Title (optional)"
          className="mb-3 w-full rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-sm placeholder:text-faint focus:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        />
        <textarea
          name="content"
          rows={4}
          required
          placeholder="Client approved the scope on the call. Payment terms: 50/50."
          className="w-full rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-sm placeholder:text-faint focus:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        />
        <Button type="submit" disabled={pending} className="mt-4 disabled:opacity-50">
          {pending ? "Saving…" : "Save note"}
        </Button>
      </form>

      <div className="grid h-fit gap-3">
        {notes.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">
            No notes yet. Record decisions, client feedback, and agreements here.
          </div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">{n.title || "Note"}</p>
                <p className="shrink-0 font-mono text-[11px] text-faint">
                  {new Date(n.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {n.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
