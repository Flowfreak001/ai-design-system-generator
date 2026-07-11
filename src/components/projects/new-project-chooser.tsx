"use client";

// New-project fork: choose a Wix Headless Site (template gallery → assembled,
// deployable site) or a Design Project (the existing QuickStart flow).
import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuickStart } from "@/components/projects/quick-start";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { SITE_TEMPLATES } from "@/lib/site-templates";

type Mode = "choose" | "wix" | "design";

export function NewProjectChooser({ clients }: { clients: { id: string; name: string }[] }) {
  const [mode, setMode] = useState<Mode>("choose");

  if (mode === "design") return <QuickStart clients={clients} />;
  if (mode === "wix") return <WixHeadlessCreate onBack={() => setMode("choose")} />;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setMode("wix")}
        className="rounded-2xl border border-line bg-surface p-6 text-left transition-colors hover:border-accent hover:bg-accent-soft/30"
      >
        <span className="text-2xl">🚀</span>
        <p className="mt-3 text-[16px] font-semibold text-ink">Wix Headless Site</p>
        <p className="mt-1 text-[13px] text-muted">Pick a template (store, bookings, events…), bind it to your Wix data, and publish a live site — or download the design file.</p>
      </button>
      <button
        type="button"
        onClick={() => setMode("design")}
        className="rounded-2xl border border-line bg-surface p-6 text-left transition-colors hover:border-accent hover:bg-accent-soft/30"
      >
        <span className="text-2xl">🎨</span>
        <p className="mt-3 text-[16px] font-semibold text-ink">Design Project</p>
        <p className="mt-1 text-[13px] text-muted">Plan and design a website from a brief or reference site using the section library and studio.</p>
      </button>
    </div>
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
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <button type="button" onClick={onBack} className="text-[12.5px] text-muted underline hover:text-ink">← Back</button>

      <p className="mt-4 text-[13px] font-semibold text-ink">Choose a template</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {SITE_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            disabled={!tpl.available}
            onClick={() => tpl.available && setTemplate(tpl.id)}
            className={`relative rounded-xl border p-3.5 text-left transition-colors ${
              template === tpl.id ? "border-accent bg-accent-soft/40" : "border-line hover:border-ink/25"
            } ${tpl.available ? "" : "cursor-not-allowed opacity-55"}`}
          >
            <span className="text-xl">{tpl.glyph}</span>
            <p className="mt-1.5 text-[13px] font-semibold text-ink">{tpl.name}</p>
            <p className="mt-0.5 text-[11.5px] text-muted">{tpl.tagline}</p>
            {!tpl.available && <span className="absolute right-2.5 top-2.5 rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-medium text-muted">Soon</span>}
          </button>
        ))}
      </div>

      <label className="mt-6 block text-[13px] font-semibold text-ink">Project name <span className="text-accent">*</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Aurora Home — online store"
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-accent" />
      </label>

      {state?.error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{state.error}</p>}

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={submit} disabled={pending || !name.trim()} className="min-w-[160px]">
          {pending ? "Creating…" : "Create site"}
        </Button>
      </div>
      <p className="mt-3 text-[11.5px] text-muted">Next: connect your Wix site, then assemble & publish — or download the design file.</p>
    </div>
  );
}
