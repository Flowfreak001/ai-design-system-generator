"use client";

// Two-step Add Client flow, mirroring the project-creation wizard:
//   1) Company  — name (required) + business type + website
//   2) Contact & engagement — contact, stage, services
// Only the company name is required, so most clients can be added fast.

import { startTransition, useActionState, useState } from "react";
import { createClientAction, type FormState } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_STAGES, CLIENT_SERVICES } from "@/lib/clients-constants";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

export function ClientForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createClientAction, undefined);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [website, setWebsite] = useState("");
  // Step 2
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [stage, setStage] = useState("Onboarding");
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    if (type) fd.set("type", type);
    if (website) fd.set("website", website);
    if (contactName) fd.set("contactName", contactName);
    if (contactEmail) fd.set("contactEmail", contactEmail);
    fd.set("stage", stage);
    services.forEach((s) => fd.append("services", s));
    setPending(true);
    startTransition(() => formAction(fd));
  };

  return (
    <div>
      {state?.error && (
        <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="card grid gap-5 p-6 sm:p-7">
        {step === 1 ? (
          <>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Company name <span className="text-accent">*</span>
              </label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="Simba Car Hire" className={inputCls} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-medium">Business type</label>
                <input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Car rental, plumber, restaurant…" className={inputCls} />
              </div>
              <div>
                <label htmlFor="website" className="mb-1.5 block text-sm font-medium">Website</label>
                <input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button size="lg" onClick={() => setStep(2)} disabled={!name.trim()}>Continue</Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contactName" className="mb-1.5 block text-sm font-medium">Contact name</label>
                <input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} autoFocus placeholder="Sunil" className={inputCls} />
              </div>
              <div>
                <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-medium">Contact email</label>
                <input id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="owner@business.com" className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="stage" className="mb-1.5 block text-sm font-medium">Stage</label>
              <select id="stage" value={stage} onChange={(e) => setStage(e.target.value)} className={`${inputCls} cursor-pointer`}>
                {CLIENT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium">Services</span>
              <div className="flex flex-wrap gap-2">
                {CLIENT_SERVICES.map((s) => {
                  const on = services.includes(s);
                  return (
                    <button key={s} type="button" onClick={() => toggleService(s)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-accent/50 bg-accent-soft text-accent" : "border-line bg-surface text-body hover:text-ink"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
              <Button size="lg" onClick={submit} disabled={pending} className="min-w-[140px]">
                {pending ? "Adding…" : "Add client"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
