"use client";

// New-project fork: choose a Wix Headless Site (template gallery → assembled,
// deployable site) or a Design Project (the existing QuickStart flow).
import { startTransition, useActionState, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuickStart } from "@/components/projects/quick-start";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { SITE_TEMPLATES } from "@/lib/site-templates";

type Mode = "choose" | "wix" | "design" | "shopify";

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
    // shopping bag
    shopify: <><path d="M6 8h12l-1 12H7L6 8Z" {...p} /><path d="M9 8a3 3 0 0 1 6 0" {...p} /><path d="M9.5 12v.01M14.5 12v.01" {...p} /></>,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" className={className} aria-hidden="true">{paths[name]}</svg>;
}

const TEMPLATE_ICON: Record<string, string> = { store: "store", bookings: "bookings", events: "events", content: "content" };

const CHOICES = [
  { id: "wix" as const, icon: "headless", tint: "rose", title: "Wix Headless Site", body: "Bind a template to live Wix data and publish — or export.", tags: ["Store", "Bookings", "Events"] },
  { id: "shopify" as const, icon: "shopify", tint: "green", title: "Shopify Store", body: "Assemble a native Shopify theme and export it.", tags: ["Theme", "Sections", "Export"] },
  { id: "design" as const, icon: "design", tint: "slate", title: "Design Project", body: "Plan a site from a brief or a reference.", tags: ["Brief", "Reference", "Studio"] },
];

export function NewProjectChooser({ clients }: { clients: { id: string; name: string }[] }) {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode === "choose" ? (
        <motion.div
          key="choose"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {CHOICES.map((c, i) => (
            <ChoiceCard key={c.id} {...c} index={i} onClick={() => setMode(c.id)} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.26, ease: EASE }}
        >
          {mode === "design" && <QuickStart clients={clients} />}
          {mode === "wix" && <WixHeadlessCreate onBack={() => setMode("choose")} />}
          {mode === "shopify" && <ShopifyCreate onBack={() => setMode("choose")} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const TINT: Record<string, string> = {
  rose: "bg-accent-soft text-accent",
  slate: "bg-panel text-ink",
  green: "bg-success-soft text-success",
};

function ChoiceCard({ icon, tint, title, body, tags, index, onClick }: {
  icon: string; tint: keyof typeof TINT | string; title: string; body: string; tags: string[]; index: number; onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group flex h-full flex-col rounded-xl border border-line bg-white p-4 text-left transition-colors hover:border-accent/40 hover:shadow-[0_6px_20px_-6px_rgba(17,24,39,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TINT[tint] ?? TINT.slate}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="mt-3 text-[15px] font-semibold text-ink">{title}</span>
      <p className="mt-1 text-[12.5px] leading-snug text-muted">{body}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-md bg-panel px-1.5 py-0.5 text-[10.5px] font-medium text-body">{t}</span>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-muted transition-colors group-hover:text-accent">
        Continue
        <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
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
    >
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-muted transition-colors hover:text-ink">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" /> Back
      </button>

      <p className="mt-4 text-[13px] font-semibold text-ink">Choose a template</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
              className={`relative flex items-start gap-3 rounded-[8px] border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active ? "border-accent bg-accent-soft/50" : "border-line hover:border-ink/20"
              } ${tpl.available ? "" : "cursor-not-allowed opacity-60"}`}
            >
              <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active ? "bg-accent text-white" : "bg-panel text-ink"}`}>
                <Icon name={TEMPLATE_ICON[tpl.id] ?? "content"} className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">{tpl.name}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-body">{tpl.tagline}</span>
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
          className="mt-1.5 w-full rounded-[8px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-accent" />
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

function ShopifyCreate({ onBack }: { onBack: () => void }) {
  const [state, formAction] = useActionState<FormState, FormData>(createProjectAction, {});
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("businessName", name);
    fd.set("type", "SHOPIFY");
    setPending(true);
    startTransition(() => formAction(fd));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE }}>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-muted transition-colors hover:text-ink">
        <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" /> Back
      </button>

      <div className="mt-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-success-soft text-success"><Icon name="shopify" /></span>
        <div>
          <p className="text-[15px] font-semibold text-ink">New Shopify store</p>
          <p className="text-[12.5px] text-body">A native Online Store 2.0 theme, built from brand + page sections and exported as a Shopify-ready ZIP.</p>
        </div>
      </div>

      <label className="mt-6 block text-[13px] font-semibold text-ink">Store name <span className="text-accent">*</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Aurora Home"
          className="mt-1.5 w-full rounded-[8px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-accent" />
      </label>

      {state?.error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{state.error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-muted">Next: set your brand, assemble page sections, preview &amp; export the theme.</p>
        <Button size="lg" onClick={submit} disabled={pending || !name.trim()} className="min-w-[150px]">
          {pending ? "Creating…" : "Create store"}
        </Button>
      </div>
    </motion.div>
  );
}
