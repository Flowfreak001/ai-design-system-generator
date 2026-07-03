"use client";

// Multi-step project creation wizard. All step panels stay mounted (hidden,
// not unmounted) inside one form, so values persist and submit as one
// FormData. Only 6 fields are required; everything else is optional and the
// Review step lists what's missing so users know what will be assumed.

import { useActionState, useRef, useState } from "react";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  PLATFORM_TARGETS,
  ANIMATION_PREFERENCES,
  STYLE_PREFERENCES,
} from "@/lib/validators/project";

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "References" },
  { id: 3, label: "Brand" },
  { id: 4, label: "Structure" },
  { id: 5, label: "Review" },
];

// Required fields per step (names must match inputs below).
const REQUIRED: Record<number, string[]> = {
  1: ["name", "businessName", "businessType", "goal"],
  2: [],
  3: [],
  4: ["keyItems", "platformTarget"],
};

const REQUIRED_LABELS: Record<string, string> = {
  name: "Project name",
  businessName: "Business name",
  businessType: "Business type",
  goal: "Website goal",
  keyItems: "Required pages",
  platformTarget: "Platform target",
};

const OPTIONAL_LABELS: [string, string][] = [
  ["clientName", "Client name"],
  ["targetAudience", "Target audience"],
  ["referenceUrls", "Reference websites"],
  ["existingWebsiteUrl", "Existing website"],
  ["competitorUrls", "Competitor URLs"],
  ["stylePreference", "Style preference"],
  ["primaryColor", "Primary color"],
  ["secondaryColor", "Secondary color"],
  ["fontPreference", "Font preference"],
  ["brandPersonality", "Brand personality"],
  ["toneOfVoice", "Tone of voice"],
  ["services", "Services / products"],
  ["ctaGoal", "CTA goal"],
  ["seoKeywords", "SEO keywords"],
];

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

function Field({
  label,
  name,
  required,
  placeholder,
  hint,
  type = "text",
  invalid,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  type?: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5">
        {label} {required ? <span className="text-accent">*</span> : <span className="text-faint text-xs font-normal">optional</span>}
      </Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} aria-invalid={invalid || undefined} />
      {invalid && <p className="mt-1 text-xs text-danger">This field is required.</p>}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

function Area({
  label,
  name,
  required,
  placeholder,
  hint,
  rows = 2,
  invalid,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
  invalid?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5">
        {label} {required ? <span className="text-accent">*</span> : <span className="text-faint text-xs font-normal">optional</span>}
      </Label>
      <Textarea id={name} name={name} rows={rows} placeholder={placeholder} aria-invalid={invalid || undefined} />
      {invalid && <p className="mt-1 text-xs text-danger">This field is required.</p>}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required,
  placeholder = "Select…",
  invalid,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label} {required ? <span className="text-accent">*</span> : <span className="text-faint text-xs font-normal">optional</span>}
      </label>
      <select id={name} name={name} defaultValue="" aria-invalid={invalid || undefined} className={`${inputCls} cursor-pointer ${invalid ? "border-danger" : ""}`}>
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ProjectWizard({
  clients = [],
  defaultClientId,
}: {
  clients?: { id: string; name: string }[];
  defaultClientId?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createProjectAction,
    undefined,
  );
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [summary, setSummary] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const readForm = (): Record<string, string> => {
    const fd = new FormData(formRef.current ?? undefined);
    const out: Record<string, string> = {};
    fd.forEach((v, k) => {
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    });
    return out;
  };

  const goTo = (next: number) => {
    if (next > step) {
      const values = readForm();
      for (const s of Object.keys(REQUIRED).map(Number)) {
        if (s >= next) break;
        const miss = REQUIRED[s].filter((f) => !values[f]);
        if (miss.length) {
          setStep(s);
          setMissing(miss);
          setStepError(
            `Please fill: ${miss.map((f) => REQUIRED_LABELS[f] ?? f).join(", ")}. (The gray text in empty fields is just an example.)`,
          );
          return;
        }
      }
    }
    setStepError(null);
    setMissing([]);
    if (next === 5) setSummary(readForm());
    setStep(next);
  };

  const missingOptionals = OPTIONAL_LABELS.filter(([k]) => !summary[k]).map(([, l]) => l);
  const panel = (n: number) =>
    n === step
      ? "animate-in fade-in slide-in-from-bottom-2 duration-300"
      : "hidden";

  return (
    <form ref={formRef} action={formAction} className="grid gap-6">
      {/* Progress */}
      <Progress value={(step / STEPS.length) * 100} aria-label={`Step ${step} of ${STEPS.length}`} />
      <ol className="-mt-3 flex items-center gap-1" aria-label="Progress steps">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(s.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  active
                    ? "bg-accent text-white"
                    : done
                      ? "bg-accent-soft text-accent"
                      : "bg-panel text-faint"
                }`}
              >
                <span>{done ? "✓" : s.id}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {(state?.error || stepError) && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {state?.error ?? stepError}
        </p>
      )}

      <div>
          {/* All panels stay mounted; visibility toggles so FormData persists. */}
          <div className={panel(1)}>
            <div className="card grid gap-5 p-6">
              <div>
                <h3 className="text-base font-semibold">Basic details</h3>
                <p className="mt-1 text-[13px] text-muted">Who is this design system for?</p>
              </div>
              <Field label="Project name" name="name" required placeholder="e.g. Simba Car Hire — new website" invalid={missing.includes("name")} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Business name" name="businessName" required placeholder="e.g. Simba Car Hire" invalid={missing.includes("businessName")} />
                <Field label="Business type" name="businessType" required placeholder="e.g. Car rental, plumber, restaurant" invalid={missing.includes("businessType")} />
              </div>
              <Area label="Website goal" name="goal" required placeholder="What should the website achieve? e.g. Generate booking enquiries" invalid={missing.includes("goal")} />
              <Area label="Target audience" name="targetAudience" placeholder="Who are the customers?" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Client name" name="clientName" placeholder="Contact person" />
                {clients.length > 0 && (
                  <div>
                    <label htmlFor="businessId" className="mb-1.5 block text-sm font-medium">
                      Link to client <span className="text-faint text-xs font-normal">optional</span>
                    </label>
                    <select id="businessId" name="businessId" defaultValue={defaultClientId ?? ""} className={`${inputCls} cursor-pointer`}>
                      <option value="">No client link</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <input type="hidden" name="type" value="WEBSITE_APP" />
            </div>
          </div>

          <div className={panel(2)}>
            <div className="card grid gap-5 p-6">
              <div>
                <h3 className="text-base font-semibold">Design references</h3>
                <p className="mt-1 text-[13px] text-muted">
                  Reference websites help us understand the design style. They are optional but recommended.
                </p>
              </div>
              <Field label="Existing website / homepage URL" name="existingWebsiteUrl" placeholder="https://… (the client's own site)" />
              <Area
                label="Additional page URLs to analyze"
                name="pageUrls"
                placeholder="One per line — about, services, pricing, FAQ, contact, booking, portfolio, blog…"
              />
              <p className="-mt-3 text-[12px] text-muted">
                Add as many page URLs as available. More pages help the system capture the real
                section structure, forms, cards, FAQs, buttons, and responsive behavior — instead of
                assuming a fixed layout. Page types are detected automatically.
              </p>
              <Area label="Reference website URLs" name="referenceUrls" placeholder="One per line — other sites whose style you like" />
              <Area label="Competitor URLs" name="competitorUrls" placeholder="One per line" />
              <Select label="Style preference" name="stylePreference" options={STYLE_PREFERENCES} />
            </div>
          </div>

          <div className={panel(3)}>
            <div className="card grid gap-5 p-6">
              <div>
                <h3 className="text-base font-semibold">Brand inputs</h3>
                <p className="mt-1 text-[13px] text-muted">
                  If you don&apos;t have brand colors or a logo yet, leave this blank — the system will create clear assumptions.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-line-strong bg-panel px-4 py-6 text-center text-sm text-muted">
                Logo upload coming soon — files aren&apos;t required to generate.
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Primary color" name="primaryColor" placeholder="#1E5AFF" />
                <Field label="Secondary color" name="secondaryColor" placeholder="#0B1B3F" />
              </div>
              <Field label="Font preference" name="fontPreference" placeholder="e.g. Inter, Manrope, 'something modern'" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Brand personality" name="brandPersonality" placeholder="e.g. dependable, friendly, premium" />
                <Field label="Tone of voice" name="toneOfVoice" placeholder="e.g. plain-spoken and warm" />
              </div>
            </div>
          </div>

          <div className={panel(4)}>
            <div className="card grid gap-5 p-6">
              <div>
                <h3 className="text-base font-semibold">Website structure</h3>
                <p className="mt-1 text-[13px] text-muted">What should the site contain, and where will it be built?</p>
              </div>
              <Area label="Required pages" name="keyItems" required placeholder="e.g. Home, Fleet, Pricing, Locations, Contact" hint="One per line or comma-separated." invalid={missing.includes("keyItems")} />
              <Area label="Services / products" name="services" placeholder="What does the business offer?" />
              <Field label="CTA goal" name="ctaGoal" placeholder="e.g. Book a car, Request a quote" />
              <Area label="SEO keywords" name="seoKeywords" placeholder="One per line or comma-separated" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Select label="Platform target" name="platformTarget" options={PLATFORM_TARGETS} required invalid={missing.includes("platformTarget")} />
                <Select label="Animation preference" name="animationPreference" options={ANIMATION_PREFERENCES} />
              </div>
              <Area label="Notes" name="notes" placeholder="Anything else worth knowing…" />
            </div>
          </div>

          <div className={panel(5)}>
            <div className="grid gap-4">
              <div className="card p-6">
                <h3 className="text-base font-semibold">Review &amp; create</h3>
                <dl className="mt-4 grid gap-2.5">
                  {[
                    ["Project", summary.name],
                    ["Business", `${summary.businessName ?? ""}${summary.businessType ? ` · ${summary.businessType}` : ""}`],
                    ["Goal", summary.goal],
                    ["Audience", summary.targetAudience],
                    ["References", summary.referenceUrls ?? summary.existingWebsiteUrl],
                    ["Brand colors", [summary.primaryColor, summary.secondaryColor].filter(Boolean).join(", ")],
                    ["Pages", summary.keyItems],
                    ["Platform", summary.platformTarget],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <dt className="font-mono text-[11px] uppercase tracking-wider text-faint pt-0.5">{k}</dt>
                        <dd className="text-body">{v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
              {missingOptionals.length > 0 && (
                <div className="rounded-xl border border-warning/25 bg-warning-soft px-4 py-3">
                  <p className="text-sm font-medium text-warning">
                    Not provided (the system will make clear assumptions):
                  </p>
                  <p className="mt-1 text-[13px] text-body">{missingOptionals.join(" · ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} className={step === 1 ? "invisible" : ""}>
          ← Back
        </Button>
        {step < 5 ? (
          <Button type="button" onClick={() => goTo(step + 1)}>
            Continue →
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-50">
            {pending ? "Creating…" : "Create Design System Project"}
          </Button>
        )}
      </div>
    </form>
  );
}
