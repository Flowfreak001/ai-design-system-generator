"use client";

import { useActionState } from "react";
import { createClientAction, type FormState } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_STAGES, CLIENT_SERVICES } from "@/lib/clients-constants";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

export function ClientForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createClientAction,
    undefined,
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state?.error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <fieldset className="card grid gap-5 p-6">
        <legend className="eyebrow px-1">Company</legend>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Company name <span className="text-accent">*</span>
          </label>
          <input id="name" name="name" required placeholder="Simba Car Hire" className={inputCls} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="mb-1.5 block text-sm font-medium">Business type</label>
            <input id="type" name="type" placeholder="Car rental, plumber, restaurant…" className={inputCls} />
          </div>
          <div>
            <label htmlFor="website" className="mb-1.5 block text-sm font-medium">Website</label>
            <input id="website" name="website" placeholder="https://…" className={inputCls} />
          </div>
        </div>
      </fieldset>

      <fieldset className="card grid gap-5 p-6">
        <legend className="eyebrow px-1">Contact</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contactName" className="mb-1.5 block text-sm font-medium">Contact name</label>
            <input id="contactName" name="contactName" placeholder="Sunil" className={inputCls} />
          </div>
          <div>
            <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-medium">Contact email</label>
            <input id="contactEmail" name="contactEmail" type="email" placeholder="owner@business.com" className={inputCls} />
          </div>
        </div>
      </fieldset>

      <fieldset className="card grid gap-5 p-6">
        <legend className="eyebrow px-1">Engagement</legend>
        <div>
          <label htmlFor="stage" className="mb-1.5 block text-sm font-medium">Stage</label>
          <select id="stage" name="stage" defaultValue="Onboarding" className={`${inputCls} cursor-pointer`}>
            {CLIENT_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium">Services</span>
          <div className="flex flex-wrap gap-2">
            {CLIENT_SERVICES.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-body transition-colors has-checked:border-accent/50 has-checked:bg-accent-soft has-checked:text-accent"
              >
                <input type="checkbox" name="services" value={s} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-50">
          {pending ? "Adding…" : "Add client"}
        </Button>
        <span className="text-xs text-faint">You can create projects under this client next.</span>
      </div>
    </form>
  );
}
