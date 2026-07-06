"use client";

// Minimal one-screen project start. Only a project name is required; a reference
// URL is recommended (we learn the brand from it). Everything else is optional
// and tucked behind "Add details" — no multi-step wizard.

import { startTransition, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { INDUSTRIES } from "@/lib/onboarding";

const INPUT = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-accent";

function SubmitButton({ hasRef }: { hasRef: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="min-w-[160px]">
      {pending ? (hasRef ? "Analyzing site…" : "Creating…") : "Create website"}
    </Button>
  );
}

export function QuickStart({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createProjectAction, {});
  const [ref, setRef] = useState("");
  const [details, setDetails] = useState(false);
  const [start, setStart] = useState<"reference" | "blank">("reference");

  return (
    <form action={(fd) => startTransition(() => formAction(fd))} className="max-w-2xl">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        {/* Project name */}
        <label className="block text-[13px] font-semibold text-ink">Project name <span className="text-accent">*</span>
          <input name="name" required autoFocus placeholder="e.g. Simba Car Hire — new website" className={`mt-1.5 ${INPUT}`} />
        </label>

        {/* Starting point */}
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-ink">How should we start?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setStart("reference")} className={`rounded-xl border p-3 text-left transition-colors ${start === "reference" ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}>
              <span className="block text-[13px] font-semibold text-ink">Learn from a site</span>
              <span className="mt-0.5 block text-[11.5px] text-muted">We extract the brand, colours & layout.</span>
            </button>
            <button type="button" onClick={() => setStart("blank")} className={`rounded-xl border p-3 text-left transition-colors ${start === "blank" ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}>
              <span className="block text-[13px] font-semibold text-ink">Start blank</span>
              <span className="mt-0.5 block text-[11.5px] text-muted">Build from the section library.</span>
            </button>
          </div>
          {start === "reference" && (
            <div className="mt-3">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <input name="mainReferenceUrl" value={ref} onChange={(e) => setRef(e.target.value)} type="url" placeholder="https://a-site-you-like.com" className={`${INPUT} pl-9`} />
              </div>
              <p className="mt-1.5 text-[11.5px] text-muted">Paste a reference site — we recreate its structure & style with original content and placeholder media (we never copy images or text).</p>
            </div>
          )}
        </div>

        {/* Optional details */}
        <div className="mt-6 border-t border-line pt-4">
          <button type="button" onClick={() => setDetails((v) => !v)} className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={`transition-transform ${details ? "rotate-90" : ""}`}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Add business details <span className="text-faint">(optional)</span>
          </button>
          {details && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] font-medium text-muted">Business type
                <input name="businessType" placeholder="e.g. Car rental, restaurant" className={`mt-1 ${INPUT}`} />
              </label>
              <label className="text-[12px] font-medium text-muted">Industry
                <select name="industry" defaultValue="" className={`mt-1 ${INPUT}`}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
              {clients.length > 0 && (
                <label className="text-[12px] font-medium text-muted">Link to client
                  <select name="businessId" defaultValue="" className={`mt-1 ${INPUT}`}>
                    <option value="">No client link</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
            </div>
          )}
        </div>

        {state?.error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{state.error}</p>}

        <div className="mt-6 flex items-center justify-end">
          <SubmitButton hasRef={start === "reference" && ref.trim().length > 0} />
        </div>
      </div>
    </form>
  );
}
