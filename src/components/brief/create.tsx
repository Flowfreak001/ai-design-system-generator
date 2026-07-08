"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FadeUp } from "@/components/ui/motion";
import { briefStore } from "@/lib/brief/store";
import { runFullBrief } from "@/lib/brief/ai";
import { GUIDED_FIELDS, GUIDED_GROUPS } from "@/lib/brief/mock";
import { INDUSTRY_TEMPLATES } from "@/lib/brief/ai";
import { TemplateIcon } from "./shared";
import type { InputMethod } from "@/lib/brief/types";

type Method = InputMethod;
const METHODS: { id: Method; title: string; desc: string; icon: React.ReactNode }[] = [
  { id: "guided", title: "Guided Brief", desc: "Answer structured questions field by field.", icon: <path d="M9 11l3 3 8-8M4 12v6a2 2 0 0 0 2 2h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: "notes", title: "Paste Meeting Notes", desc: "Drop raw notes — AI structures them.", icon: <path d="M8 6h9M8 10h9M8 14h6M5 6h.01M5 10h.01M5 14h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /> },
  { id: "transcript", title: "Paste Transcript", desc: "Extract a brief from a call transcript.", icon: <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /> },
  { id: "template", title: "Use Industry Template", desc: "Start from a proven industry structure.", icon: <path d="M4 5h16M4 5v14h16V5M9 5v14M14 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
];

export function CreateBrief() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("guided");

  return (
    <PageContainer>
      <PageHeader title="Create a new brief" description="Choose how you'd like to capture the client's requirements." />

      <FadeUp className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={`rounded-xl border p-5 text-left transition-colors ${method === m.id ? "border-accent bg-accent-soft/40" : "border-line bg-surface hover:border-accent/40"}`}
          >
            <span className={`grid size-10 place-items-center rounded-lg ${method === m.id ? "bg-accent text-white" : "bg-panel text-accent"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{m.icon}</svg>
            </span>
            <p className="mt-4 text-[15px] font-semibold text-ink">{m.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{m.desc}</p>
          </button>
        ))}
      </FadeUp>

      <div className="mt-8">
        {method === "guided" && <GuidedForm onDone={(id) => router.push(`/brief/${id}`)} />}
        {method === "notes" && <NotesForm onDone={(id) => router.push(`/brief/${id}`)} />}
        {method === "transcript" && <TranscriptForm onDone={(id) => router.push(`/brief/${id}`)} />}
        {method === "template" && <TemplatePicker onDone={(id) => router.push(`/brief/${id}`)} />}
      </div>
    </PageContainer>
  );
}

function generateAndGo(id: string, onDone: (id: string) => void) {
  const b = briefStore.get(id);
  if (b) briefStore.update(id, { ...runFullBrief(b), status: "in-review" });
  onDone(id);
}

/* ── Guided ── */
function GuidedForm({ onDone }: { onDone: (id: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div className="space-y-9">
        {GUIDED_GROUPS.map((group) => (
          <fieldset key={group}>
            <legend className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-faint">{group}</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              {GUIDED_FIELDS.filter((f) => f.group === group).map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={f.key} className="mb-1.5 block text-[13px] text-body">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea id={f.key} rows={2} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === "select" ? (
                    <select id={f.key} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-body">
                      <option value="">Select…</option>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <Input id={f.key} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          size="md"
          onClick={() => {
            const b = briefStore.create({ inputMethod: "guided", guided: values, clientName: values.clientName, businessName: values.businessName, industry: values.industry });
            generateAndGo(b.id, onDone);
          }}
        >
          Generate Structured Brief
        </Button>
      </div>
    </div>
  );
}

/* ── Notes ── */
function NotesForm({ onDone }: { onDone: (id: string) => void }) {
  const [notes, setNotes] = useState("");
  const [client, setClient] = useState("");
  const [business, setBusiness] = useState("");
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-xl border border-line bg-surface p-6">
        <Label className="mb-1.5 block text-[13px] text-body">Meeting notes</Label>
        <Textarea rows={14} placeholder="Paste your raw meeting notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-faint">Optional details</p>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block text-[13px] text-body">Client name</Label><Input value={client} onChange={(e) => setClient(e.target.value)} /></div>
          <div><Label className="mb-1.5 block text-[13px] text-body">Business name</Label><Input value={business} onChange={(e) => setBusiness(e.target.value)} /></div>
        </div>
        <Button
          size="md"
          className="mt-6 w-full"
          disabled={!notes.trim()}
          onClick={() => { const b = briefStore.create({ inputMethod: "notes", rawInput: notes, clientName: client, businessName: business }); generateAndGo(b.id, onDone); }}
        >
          Generate Structured Brief
        </Button>
      </div>
    </div>
  );
}

/* ── Transcript ── */
function TranscriptForm({ onDone }: { onDone: (id: string) => void }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-xl border border-line bg-surface p-6">
        <Label className="mb-1.5 block text-[13px] text-body">Transcript</Label>
        <Textarea rows={14} placeholder="Paste the call transcript here…" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-faint">Optional details</p>
        <div><Label className="mb-1.5 block text-[13px] text-body">Transcript source</Label><Input placeholder="e.g. Zoom call — 20 min" value={source} onChange={(e) => setSource(e.target.value)} /></div>
        <Button
          size="md"
          className="mt-6 w-full"
          disabled={!text.trim()}
          onClick={() => { const b = briefStore.create({ inputMethod: "transcript", rawInput: text, transcriptSource: source }); generateAndGo(b.id, onDone); }}
        >
          Extract Brief
        </Button>
      </div>
    </div>
  );
}

/* ── Template ── */
function TemplatePicker({ onDone }: { onDone: (id: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {INDUSTRY_TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            const b = briefStore.create({ inputMethod: "template", industry: t.name, businessName: `New ${t.name} site`, guided: { industryTemplate: t.id, industry: t.name, websiteType: t.websiteType } });
            generateAndGo(b.id, onDone);
          }}
          className="rounded-xl border border-line bg-surface p-5 text-left transition-colors hover:border-accent/40"
        >
          <span className="grid size-10 place-items-center rounded-lg bg-panel text-accent"><TemplateIcon icon={t.icon} /></span>
          <p className="mt-4 text-[15px] font-semibold text-ink">{t.name}</p>
          <p className="mt-1 text-[13px] text-muted">{t.tagline}</p>
        </button>
      ))}
    </div>
  );
}
