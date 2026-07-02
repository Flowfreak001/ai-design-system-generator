"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import { PROJECT_TYPES } from "@/lib/validators/project";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint transition-colors duration-200 " +
  "focus:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input id={name} name={name} required={required} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

function Area({
  label,
  name,
  placeholder,
  hint,
  rows = 2,
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-6">
      <legend className="eyebrow px-1">{title}</legend>
      <div className="mt-5 grid gap-5">{children}</div>
    </fieldset>
  );
}

export function ProjectForm({
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
  const [type, setType] = useState<string>("WEBSITE_APP");
  const reduce = useReducedMotion();
  const isAutomation = type === "AUTOMATION_WORKFLOW";

  return (
    <form action={formAction} className="grid gap-5">
      {state?.error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      {/* Project type selector */}
      <fieldset className="card p-6">
        <legend className="eyebrow px-1">Project type</legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Project type">
          {PROJECT_TYPES.map((t) => {
            const on = type === t.value;
            return (
              <label
                key={t.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-200 ${
                  on ? "border-accent/50 bg-accent-soft" : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={on}
                  onChange={() => setType(t.value)}
                  className="mt-1 accent-[#E94B6F]"
                />
                <span>
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {t.value === "WEBSITE_APP"
                      ? "Websites, SaaS apps, dashboards, portals, landing pages."
                      : "Leads, bookings, follow-ups, approvals — automation for a small business."}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Group title="Basics">
        <Field label="Project name" name="name" required placeholder="Acme Plumbing — enquiry automation" />
        <div>
          <label htmlFor="businessId" className="mb-1.5 block text-sm font-medium">
            Client <span className="text-accent">*</span>
          </label>
          {clients.length ? (
            <select
              id="businessId"
              name="businessId"
              required
              defaultValue={defaultClientId ?? ""}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="" disabled>
                Select a client…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-muted">
              No clients yet —{" "}
              <a href="/clients/new" className="text-accent hover:underline">
                add a client first
              </a>
              , then create their project.
            </p>
          )}
        </div>
        <Field label="Business type" name="businessType" placeholder="Plumber, restaurant, real estate…" />
      </Group>

      <Group title="Goals & audience">
        <Area label="Goal / problem" name="goal" placeholder="What should this project achieve or fix?" />
        <Area label="Target audience / customer type" name="targetAudience" placeholder="Who are the customers?" />
        <Area
          label={isAutomation ? "Key workflows needed" : "Key pages / features needed"}
          name="keyItems"
          placeholder={isAutomation ? "Enquiry handling, quote follow-up, review requests…" : "Home, Pricing, Booking, Dashboard…"}
          hint="One per line or comma-separated."
        />
      </Group>

      {/* Automation-only helper fields */}
      <AnimatePresence initial={false}>
        {isAutomation && (
          <motion.div
            key="automation-fields"
            initial={{ opacity: 0, height: reduce ? "auto" : 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: reduce ? "auto" : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <Group title="Automation details">
              <Area label="Current process" name="currentProcess" placeholder="How are enquiries handled today?" />
              <Area label="Main pain point" name="mainPainPoint" placeholder="What's costing the most time or leads?" />
              <Field label="Trigger source" name="triggerSource" placeholder="Website form, WhatsApp, phone, email…" />
              <Area label="What should AI do?" name="aiShouldDo" placeholder="Read enquiries, classify urgency, draft replies…" />
              <Area label="What needs human approval?" name="needsHumanApproval" placeholder="Outgoing replies, quotes, refunds…" />
            </Group>
          </motion.div>
        )}
      </AnimatePresence>

      <Group title="Context (optional)">
        <Area label="Brand colors / reference links" name="brandRefs" placeholder="#6D5EF6, https://example.com…" />
        <Area label="Current tools" name="currentTools" placeholder="Google Calendar, WhatsApp Business, Stripe…" />
        <Area label="Notes" name="notes" placeholder="Anything else worth knowing…" rows={3} />
      </Group>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? "Creating…" : "Create project"}
        </Button>
        <span className="text-xs text-faint">Generate files from the detail page after creating.</span>
      </div>
    </form>
  );
}
