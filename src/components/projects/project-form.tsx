"use client";

import { useActionState } from "react";
import { createProjectAction, type FormState } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import { PLATFORM_TARGETS, ANIMATION_PREFERENCES } from "@/lib/validators/project";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand";

function Field({
  label,
  name,
  required,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder} className={inputCls} />
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

function Area({
  label,
  name,
  placeholder,
  hint,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} placeholder={placeholder} className={inputCls} />
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: readonly string[] }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <select id={name} name={name} defaultValue="" className={`${inputCls} cursor-pointer`}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-6">
      <legend className="eyebrow px-1">{title}</legend>
      <div className="mt-5 grid gap-5">{children}</div>
    </fieldset>
  );
}

export function ProjectForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createProjectAction,
    undefined,
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state?.error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <Group title="Basics">
        <Field label="Project name" name="name" required placeholder="Aurora marketing site" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client name" name="clientName" placeholder="Aurora Inc." />
          <Field label="Business name" name="businessName" placeholder="Aurora" />
        </div>
        <Field label="Business type" name="businessType" placeholder="SaaS, agency, e-commerce…" />
      </Group>

      <Group title="Strategy">
        <Field label="Website goal" name="websiteGoal" placeholder="Generate qualified leads" />
        <Area label="Target audience" name="targetAudience" placeholder="Who is this for?" rows={2} />
        <Area label="Services / products" name="servicesProducts" placeholder="What do they offer?" rows={2} />
      </Group>

      <Group title="References">
        <Field label="Existing website URL" name="existingWebsiteUrl" placeholder="https://…" />
        <Area label="Reference URLs" name="referenceUrls" placeholder="One per line or comma-separated" hint="Sites you admire, for tone and structure." rows={2} />
        <Area label="Competitor URLs" name="competitorUrls" placeholder="One per line or comma-separated" rows={2} />
      </Group>

      <Group title="Brand & content">
        <Area label="Brand colors" name="brandColors" placeholder="#6D5EF6, #0E1017 …" hint="Hex values, comma-separated." rows={2} />
        <Area label="Required pages" name="requiredPages" placeholder="Home, Pricing, About, Contact…" rows={2} />
        <Area label="SEO keywords" name="seoKeywords" placeholder="One per line or comma-separated" rows={2} />
      </Group>

      <Group title="Technical">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Platform target" name="platformTarget" options={PLATFORM_TARGETS} />
          <Select label="Animation preference" name="animationPreference" options={ANIMATION_PREFERENCES} />
        </div>
        <Area label="Notes" name="notes" placeholder="Anything else the agents should know…" rows={3} />
      </Group>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? "Creating…" : "Create project"}
        </Button>
        <span className="text-xs text-faint">You can generate files after creating the project.</span>
      </div>
    </form>
  );
}
