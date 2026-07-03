"use client";

// Multi-step project onboarding. All step panels stay mounted (hidden, not
// unmounted) inside one form so text values persist; card/chip selections live
// in React state and submit via hidden inputs. Goal + feature selection is
// smart: suggested features are derived from the chosen industry + website type.

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  WEBSITE_TYPES,
  GOAL_OPTIONS,
  FEATURE_OPTIONS,
  PAGE_OPTIONS,
  REFERENCE_LEARN_OPTIONS,
  suggestFeatures,
  estimateAccuracy,
} from "@/lib/onboarding";

const STEPS = [
  { id: 1, label: "Business" },
  { id: 2, label: "Website type" },
  { id: 3, label: "Goals & features" },
  { id: 4, label: "Pages" },
  { id: 5, label: "References" },
  { id: 6, label: "Review" },
];
const LAST = STEPS.length;

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
  value,
  onChange,
  invalid,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  value?: string;
  onChange?: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5">
        {label}{" "}
        {required ? (
          <span className="text-accent">*</span>
        ) : (
          <span className="text-faint text-xs font-normal">optional</span>
        )}
      </Label>
      <Input
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        aria-invalid={invalid || undefined}
      />
      {invalid && <p className="mt-1 text-xs text-danger">This field is required.</p>}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
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
      <Label htmlFor={name} className="mb-1.5">
        {label} <span className="text-faint text-xs font-normal">optional</span>
      </Label>
      <Textarea id={name} name={name} rows={rows} placeholder={placeholder} />
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}

/** Large single-select card (website type). */
function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors duration-150 ${
        selected
          ? "border-accent bg-accent-soft/50 text-ink shadow-sm"
          : "border-line bg-surface text-body hover:border-line-strong hover:text-ink"
      }`}
    >
      <span>{label}</span>
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[10px] ${
          selected ? "border-accent bg-accent text-white" : "border-line"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
    </motion.button>
  );
}

/** Toggle chip for multi-select groups. */
function Chip({
  label,
  selected,
  suggested,
  onClick,
}: {
  label: string;
  selected: boolean;
  suggested?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
        selected
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-line bg-surface text-body hover:border-line-strong hover:text-ink"
      }`}
    >
      {selected && <span className="text-[11px]">✓</span>}
      {label}
      {suggested && !selected && (
        <span className="rounded-full bg-accent-soft px-1.5 text-[10px] font-semibold text-accent">
          suggested
        </span>
      )}
    </motion.button>
  );
}

const toggle = (set: Set<string>, v: string) => {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
};

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
  const formRef = useRef<HTMLFormElement>(null);

  // Controlled selections
  const [industry, setIndustry] = useState("");
  const [websiteType, setWebsiteType] = useState("");
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [features, setFeatures] = useState<Set<string>>(new Set());
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [pages, setPages] = useState<Set<string>>(new Set(["Home", "About", "Contact"]));
  const [learn, setLearn] = useState<Set<string>>(
    new Set(["Colors", "Typography", "Layout", "Overall style"]),
  );
  const featuresTouched = useRef(false);

  const suggested = useMemo(() => suggestFeatures(industry, websiteType), [industry, websiteType]);

  // Pre-select suggested features until the user manually edits the set.
  useEffect(() => {
    if (!featuresTouched.current) setFeatures(new Set(suggested));
  }, [suggested]);

  const toggleFeature = (f: string) => {
    featuresTouched.current = true;
    setFeatures((s) => toggle(s, f));
  };
  const addCustomFeature = () => {
    const v = customFeatureInput.trim();
    if (!v) return;
    if (![...customFeatures, ...FEATURE_OPTIONS].some((x) => x.toLowerCase() === v.toLowerCase())) {
      setCustomFeatures((c) => [...c, v]);
    }
    setCustomFeatureInput("");
  };

  const readText = (name: string): string => {
    const el = formRef.current?.elements.namedItem(name) as HTMLInputElement | null;
    return el?.value?.trim() ?? "";
  };

  const allFeatures = [...features, ...customFeatures];

  // Per-step validation. Returns an error message or null.
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      const miss: string[] = [];
      if (!readText("name")) miss.push("name");
      if (!readText("businessName")) miss.push("businessName");
      if (!readText("businessType")) miss.push("businessType");
      if (!industry.trim()) miss.push("industry");
      setMissing(miss);
      if (miss.length) return "Please fill the required business details.";
    }
    if (s === 2 && !websiteType) return "Choose what you want to create.";
    if (s === 3) {
      if (goals.size === 0) return "Select at least one goal.";
      if (allFeatures.length === 0) return "Select at least one feature.";
    }
    if (s === 4 && pages.size === 0) return "Select at least one page.";
    if (s === 5 && !readText("mainReferenceUrl")) return "Add the main reference website URL.";
    return null;
  };

  const goTo = (next: number) => {
    if (next > step) {
      // Validate every step from current up to (but not including) the target.
      for (let s = 1; s < next; s++) {
        const err = validateStep(s);
        if (err) {
          setStep(s);
          setStepError(err);
          return;
        }
      }
    }
    setStepError(null);
    if (next !== step && next <= step) setMissing([]);
    setStep(next);
  };

  const panel = (n: number) =>
    n === step ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : "hidden";

  const accuracy = estimateAccuracy({
    hasMainReference: Boolean(readText("mainReferenceUrl")),
    referenceCount: readText("referenceUrls").split(/[\n,]/).filter((s) => s.trim()).length,
    featureCount: allFeatures.length,
    pageCount: pages.size,
  });

  return (
    <form ref={formRef} action={formAction} className="grid gap-6">
      {/* Hidden inputs carrying card/chip selections (newline-joined → listField). */}
      <input type="hidden" name="type" value="WEBSITE_APP" />
      <input type="hidden" name="websiteType" value={websiteType} />
      <input type="hidden" name="goals" value={[...goals].join("\n")} />
      <input type="hidden" name="features" value={allFeatures.join("\n")} />
      <input type="hidden" name="keyItems" value={[...pages].join("\n")} />
      <input type="hidden" name="referenceLearn" value={[...learn].join("\n")} />

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
        {/* Step 1 — Business basics */}
        <div className={panel(1)}>
          <div className="card grid gap-5 p-6">
            <div>
              <h3 className="text-base font-semibold">Business basics</h3>
              <p className="mt-1 text-[13px] text-muted">Who is this design system for?</p>
            </div>
            <Field label="Project name" name="name" required placeholder="e.g. Simba Car Hire — new website" invalid={missing.includes("name")} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Business name" name="businessName" required placeholder="e.g. Simba Car Hire" invalid={missing.includes("businessName")} />
              <Field label="Business type" name="businessType" required placeholder="e.g. Car rental, plumber, restaurant" invalid={missing.includes("businessType")} />
            </div>
            <Field
              label="Industry"
              name="industry"
              required
              placeholder="e.g. Car rental, trades / home services, SaaS, real estate"
              hint="Used to suggest the right features for your site."
              value={industry}
              onChange={setIndustry}
              invalid={missing.includes("industry")}
            />
            <Area label="Target audience" name="targetAudience" placeholder="Who is this for? e.g. Tourists and business travelers renting cars in Nairobi" />
            {clients.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Client name" name="clientName" placeholder="Contact person" />
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
              </div>
            ) : (
              <Field label="Client name" name="clientName" placeholder="Contact person" />
            )}
          </div>
        </div>

        {/* Step 2 — Website type */}
        <div className={panel(2)}>
          <div className="card grid gap-5 p-6">
            <div>
              <h3 className="text-base font-semibold">What do you want to create?</h3>
              <p className="mt-1 text-[13px] text-muted">Pick the type of site or product. This shapes the suggested goals and features.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WEBSITE_TYPES.map((t) => (
                <OptionCard key={t} label={t} selected={websiteType === t} onClick={() => setWebsiteType(t)} />
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 — Goals & features */}
        <div className={panel(3)}>
          <div className="grid gap-4">
            <div className="card grid gap-4 p-6">
              <div>
                <h3 className="text-base font-semibold">What are the main goals?</h3>
                <p className="mt-1 text-[13px] text-muted">Select all that apply.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <Chip key={g} label={g} selected={goals.has(g)} onClick={() => setGoals((s) => toggle(s, g))} />
                ))}
              </div>
            </div>

            <div className="card grid gap-4 p-6">
              <div>
                <h3 className="text-base font-semibold">Which features do you need?</h3>
                <p className="mt-1 text-[13px] text-muted">
                  Suggested for {websiteType || "your site"}
                  {industry ? ` · ${industry}` : ""}. Toggle any, or add your own.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    selected={features.has(f)}
                    suggested={suggested.includes(f)}
                    onClick={() => toggleFeature(f)}
                  />
                ))}
                {customFeatures.map((f) => (
                  <Chip key={f} label={f} selected onClick={() => setCustomFeatures((c) => c.filter((x) => x !== f))} />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="Add a custom feature (e.g. Live chat)"
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomFeature();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addCustomFeature}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 — Pages needed */}
        <div className={panel(4)}>
          <div className="card grid gap-4 p-6">
            <div>
              <h3 className="text-base font-semibold">Which pages do you need?</h3>
              <p className="mt-1 text-[13px] text-muted">Select the pages this site should include.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PAGE_OPTIONS.map((p) => (
                <Chip key={p} label={p} selected={pages.has(p)} onClick={() => setPages((s) => toggle(s, p))} />
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Approx number of pages" name="pageCount" placeholder="e.g. 6" />
            </div>
            <Area label="Notes for special pages" name="pageNotes" placeholder="e.g. Booking page needs a multi-step form; blog pulls from a CMS." />
          </div>
        </div>

        {/* Step 5 — Brand references */}
        <div className={panel(5)}>
          <div className="card grid gap-5 p-6">
            <div>
              <h3 className="text-base font-semibold">Brand references</h3>
              <p className="mt-1 text-[13px] text-muted">
                We learn the design from real sites. The more you add, the more accurate the system.
              </p>
            </div>
            <Field label="Existing website URL" name="existingWebsiteUrl" placeholder="https://yourcurrentsite.com (if any)" />
            <Field
              label="Main reference website URL"
              name="mainReferenceUrl"
              required
              placeholder="https://a-site-whose-design-you-like.com"
              hint="The primary site we analyze for tokens, layout, and sections."
              invalid={Boolean(stepError) && step === 5}
            />
            <Area label="Additional reference URLs" name="referenceUrls" placeholder="One per line — other sites whose style you like" />
            <div>
              <p className="mb-2 text-sm font-medium">What should we learn from the reference?</p>
              <div className="flex flex-wrap gap-2">
                {REFERENCE_LEARN_OPTIONS.map((l) => (
                  <Chip key={l} label={l} selected={learn.has(l)} onClick={() => setLearn((s) => toggle(s, l))} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 6 — Review */}
        <div className={panel(6)}>
          <div className="grid gap-4">
            <div className="card p-6">
              <h3 className="text-base font-semibold">Review &amp; create</h3>
              <dl className="mt-4 grid gap-2.5">
                {[
                  ["Project", readText("name")],
                  ["Business", `${readText("businessName")}${readText("businessType") ? ` · ${readText("businessType")}` : ""}`],
                  ["Industry", industry],
                  ["Website type", websiteType],
                  ["Goals", [...goals].join(", ")],
                  ["Features", allFeatures.join(", ")],
                  ["Pages", [...pages].join(", ")],
                  ["Main reference", readText("mainReferenceUrl")],
                  ["Learn from ref", [...learn].join(", ")],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[130px_1fr] gap-3 text-sm">
                      <dt className="pt-0.5 font-mono text-[11px] uppercase tracking-wider text-faint">{k}</dt>
                      <dd className="text-body">{v}</dd>
                    </div>
                  ))}
              </dl>
            </div>
            <div className="card flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-semibold text-ink">Estimated accuracy</p>
                <p className="mt-0.5 text-[13px] text-muted">{accuracy.note}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  accuracy.level === "Low"
                    ? "bg-warning-soft text-warning"
                    : "bg-success-soft text-success"
                }`}
              >
                {accuracy.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} className={step === 1 ? "invisible" : ""}>
          ← Back
        </Button>
        {step < LAST ? (
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
