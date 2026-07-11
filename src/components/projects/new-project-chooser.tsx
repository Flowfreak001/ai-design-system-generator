"use client";

// New-project fork: choose a Wix Headless Site (template gallery → assembled,
// deployable site) or a Design Project (the existing QuickStart flow).
import { startTransition, useActionState, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuickStart } from "@/components/projects/quick-start";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { SITE_TEMPLATES } from "@/lib/site-templates";

type Mode = "choose" | "wix" | "design";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Inline line icons (stroke 1.7, currentColor) — no emoji, one visual family ─
function Icon({ name, className }: { name: string; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    // live site / globe with spark
    headless: <><circle cx="12" cy="12" r="9" {...p} /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" {...p} /></>,
    // design / pen-nib
    design: <><path d="M12 3 5 10l-2 9 9-2 7-7-7-7Z" {...p} /><path d="m11 11 5-5M8.5 15.5 5 19" {...p} /></>,
    store: <><path d="M4 8h16l-1 12H5L4 8Z" {...p} /><path d="M9 8a3 3 0 0 1 6 0" {...p} /></>,
    bookings: <><rect x="3.5" y="4.5" width="17" height="16" rx="2" {...p} /><path d="M3.5 9h17M8 3v3M16 3v3M8 13h3" {...p} /></>,
    events: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" {...p} /><path d="M14 6v12" strokeDasharray="1.5 2.5" {...p} /></>,
    content: <><rect x="4" y="3.5" width="16" height="17" rx="2" {...p} /><path d="M8 8h8M8 12h8M8 16h5" {...p} /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" {...p} />,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true">{paths[name]}</svg>;
}

const TEMPLATE_ICON: Record<string, string> = { store: "store", bookings: "bookings", events: "events", content: "content" };

export function NewProjectChooser({ clients }: { clients: { id: string; name: string }[] }) {
  const [mode, setMode] = useState<Mode>("choose");

  if (mode === "design") return <QuickStart clients={clients} />;
  if (mode === "wix") return <WixHeadlessCreate onBack={() => setMode("choose")} />;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <ChoiceCard
        icon="headless"
        eyebrow="Publish"
        title="Wix Headless Site"
        body="Pick a template, bind it to your Wix data, and publish a live site — or download the design file."
        tags={["Store", "Bookings", "Events"]}
        footer="Live site + design file"
        onClick={() => setMode("wix")}
        primary
      />
      <ChoiceCard
        icon="design"
        eyebrow="Design"
        title="Design Project"
        body="Plan and design a website from a brief or reference site using the section library and studio."
        tags={["Brief", "Reference", "Studio"]}
        footer="Sections + studio"
        onClick={() => setMode("design")}
      />
    </div>
  );
}

function ChoiceCard({ icon, eyebrow, title, body, tags, footer, onClick, primary }: {
  icon: string; eyebrow: string; title: string; body: string; tags: string[]; footer: string; onClick: () => void; primary?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 text-left shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-[box-shadow,border-color] hover:border-accent/40 hover:shadow-[0_18px_40px_-20px_rgba(233,75,111,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* corner glow */}
      <span aria-hidden className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-2xl transition-opacity ${primary ? "bg-accent/20" : "bg-accent/10"} opacity-60 group-hover:opacity-100`} />

      <div className="relative flex items-start justify-between">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ${primary ? "bg-gradient-to-br from-accent to-accent-hover text-white ring-accent/30" : "bg-accent-soft text-accent ring-accent/15"}`}>
          <Icon name={icon} />
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>

      <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{eyebrow}</p>
      <p className="relative mt-1 text-[18px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
      <p className="relative mt-1.5 text-[13.5px] leading-relaxed text-muted">{body}</p>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] font-medium text-body">{t}</span>
        ))}
      </div>

      <div className="relative mt-auto flex items-center gap-2 pt-6">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11.5px] font-medium text-faint">{footer}</span>
      </div>
    </motion.button>
  );
}

function WixHeadlessCreate({ onBack }: { onBack: () => void }) {
  const [state, formAction] = useActionState<FormState, FormData>(createProjectAction, {});
  const [pending, setPending] = useState(false);
  const [template, setTemplate] = useState(SITE_TEMPLATES.find((t) => t.available)?.id ?? "store");
  const [name, setName] = useState("");

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("businessName", name);
    fd.set("siteTemplate", template);
    setPending(true);
    startTransition(() => formAction(fd));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:p-7"
    >
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-muted transition-colors hover:text-ink">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" /> Back
      </button>

      <p className="mt-4 text-[13px] font-semibold text-ink">Choose a template</p>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        {SITE_TEMPLATES.map((tpl) => {
          const active = template === tpl.id;
          return (
            <motion.button
              key={tpl.id}
              type="button"
              disabled={!tpl.available}
              onClick={() => tpl.available && setTemplate(tpl.id)}
              whileHover={tpl.available ? { y: -2 } : undefined}
              whileTap={tpl.available ? { scale: 0.99 } : undefined}
              transition={{ duration: 0.18, ease: EASE }}
              className={`relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active ? "border-accent bg-accent-soft/50" : "border-line hover:border-ink/20"
              } ${tpl.available ? "" : "cursor-not-allowed opacity-60"}`}
            >
              <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-accent text-white" : "bg-panel text-ink"}`}>
                <Icon name={TEMPLATE_ICON[tpl.id] ?? "content"} className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">{tpl.name}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{tpl.tagline}</span>
              </span>
              {!tpl.available && <span className="absolute right-2.5 top-2.5 rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-medium text-muted">Soon</span>}
              {active && (
                <span className="absolute right-2.5 top-2.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4 4 10-10" /></svg>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <label className="mt-6 block text-[13px] font-semibold text-ink">Project name <span className="text-accent">*</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Aurora Home — online store"
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-accent" />
      </label>

      {state?.error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{state.error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-muted">Next: connect Wix, then assemble &amp; publish — or download the design file.</p>
        <Button size="lg" onClick={submit} disabled={pending || !name.trim()} className="min-w-[150px]">
          {pending ? "Creating…" : "Create site"}
        </Button>
      </div>
    </motion.div>
  );
}
