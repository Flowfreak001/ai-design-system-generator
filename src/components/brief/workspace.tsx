"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { briefStore } from "@/lib/brief/store";
import { runFullBrief, generateClientSummary, generateMissingInfo, generateExportPrompts } from "@/lib/brief/ai";
import type { Brief, BriefStatus, SitemapNode } from "@/lib/brief/types";
import {
  useBrief, StatusBadge, ScoreRing, ScoreBar, KeyValue, Chips, BulletList, CopyButton, downloadFile,
} from "./shared";

const BOARDS = ["Overview", "Structure", "Content & SEO", "Questions", "Outputs"] as const;
type Board = (typeof BOARDS)[number];

/* ── Canvas primitives ── */
function FloatCard({ children, className = "", pad = "p-6" }: { children: ReactNode; className?: string; pad?: string }) {
  return (
    <section className={`rounded-2xl border border-line/70 bg-surface ${pad} shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] ${className}`}>
      {children}
    </section>
  );
}
function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{children}</h3>
      {action}
    </div>
  );
}
function Sticky({ title, color = "#FEF3C7", children }: { title: string; color?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]" style={{ backgroundColor: color }}>
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-black/60">{title}</p>
      {children}
    </div>
  );
}
function Mini({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-line/70 bg-canvas/60 p-3.5">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <div className="mt-1 text-[13.5px] font-medium leading-snug text-body">{value || <span className="text-faint">—</span>}</div>
    </div>
  );
}
const prio = (p: string) => ({ high: "bg-accent-soft text-accent", medium: "bg-warning-soft text-warning", low: "bg-panel text-muted" }[p] || "bg-panel text-muted");

export function BriefWorkspace({ id }: { id: string }) {
  const brief = useBrief(id);
  const [board, setBoard] = useState<Board>("Overview");
  const [notes, setNotes] = useState<string | null>(null);
  const [rawOpen, setRawOpen] = useState(false);

  if (!brief) {
    return (
      <div className="px-5 py-16 text-center sm:px-8">
        <p className="text-[15px] text-muted">Brief not found.</p>
        <Link href="/brief" className="mt-3 inline-block text-[14px] font-medium text-accent">Back to briefs</Link>
      </div>
    );
  }
  const s = brief.structured;
  const rawValue = notes ?? (brief.inputMethod === "guided" ? guidedToText(brief) : brief.rawInput);
  const regenerate = () => {
    const updated = runFullBrief({ ...brief, rawInput: notes ?? brief.rawInput });
    briefStore.update(brief.id, { ...updated, status: brief.status === "draft" ? "in-review" : brief.status });
  };
  const save = () => briefStore.update(brief.id, { rawInput: notes ?? brief.rawInput });
  const setStatus = (status: BriefStatus) => briefStore.update(brief.id, { status });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-5 pt-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/brief" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              All briefs
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-[27px] font-bold tracking-[-0.025em] text-ink">{brief.businessName}</h2>
              <StatusBadge status={brief.status} />
            </div>
            <p className="mt-1 text-[13.5px] text-muted">{brief.clientName} · {brief.industry}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={brief.status} onChange={(e) => setStatus(e.target.value as BriefStatus)} className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-body">
              <option value="draft">Draft</option>
              <option value="in-review">In review</option>
              <option value="ready">Ready</option>
              <option value="exported">Exported</option>
            </select>
            <Button size="md" variant="outline" onClick={save}>Save</Button>
            <Button size="md" variant="outline" onClick={regenerate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 0 0-14-3M4 15a8 8 0 0 0 14 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Regenerate
            </Button>
            <Button size="md" onClick={() => setBoard("Outputs")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Export
            </Button>
          </div>
        </div>

        {/* Grouped board nav */}
        <div className="mt-6 -mb-px flex gap-1 overflow-x-auto">
          {BOARDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBoard(b)}
              className={`relative whitespace-nowrap rounded-t-lg px-4 py-2.5 text-[14px] font-semibold transition-colors ${board === b ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {b}
              {board === b && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </header>

      {/* Canvas */}
      <div
        className="border-t border-line"
        style={{
          backgroundColor: "var(--color-canvas)",
          backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--color-ink) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10">
          {!s ? (
            <FloatCard><p className="text-[14px] text-muted">This brief hasn&apos;t been generated yet. Use Regenerate to build the structured brief.</p></FloatCard>
          ) : board === "Overview" ? (
            <OverviewBoard brief={brief} rawValue={rawValue} rawOpen={rawOpen} setRawOpen={setRawOpen} setNotes={setNotes} regenerate={regenerate} save={save} goTo={setBoard} />
          ) : board === "Structure" ? (
            <StructureBoard brief={brief} />
          ) : board === "Content & SEO" ? (
            <ContentBoard brief={brief} />
          ) : board === "Questions" ? (
            <QuestionsBoard brief={brief} />
          ) : (
            <OutputsBoard brief={brief} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */
function guidedToText(b: Brief) {
  if (!b.guided) return b.rawInput;
  return Object.entries(b.guided).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
}
function scoreLabel(v: number) {
  if (v >= 80) return "Strong brief";
  if (v >= 55) return "Needs a few answers";
  return "Early draft";
}
const methodLabel = (b: Brief) => ({ guided: "Guided", notes: "Meeting notes", transcript: "Transcript", template: "Template" }[b.inputMethod]);

/* ── Overview ── */
function OverviewBoard({ brief, rawValue, rawOpen, setRawOpen, setNotes, regenerate, save, goTo }: {
  brief: Brief; rawValue: string; rawOpen: boolean; setRawOpen: (v: boolean) => void; setNotes: (v: string) => void; regenerate: () => void; save: () => void; goTo: (b: Board) => void;
}) {
  const s = brief.structured!;
  const fullSummary = s.summaryOverride ?? generateClientSummary(s);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(fullSummary);
  const missing = generateMissingInfo(s, brief.score!).slice(0, 3);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Client summary — hero card */}
      <FloatCard className="lg:col-span-2">
        <CardTitle action={
          <div className="flex gap-2">
            <button onClick={() => { setSummary(fullSummary); setEditing(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-body hover:text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 16.5 14.5 6a2.1 2.1 0 0 1 3 3L7 19.5l-4 1 1-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              Edit
            </button>
            <CopyButton text={fullSummary} />
          </div>
        }>Client summary</CardTitle>
        <p className="text-[16px] leading-relaxed text-body">{fullSummary}</p>
      </FloatCard>

      {/* Edit summary — popup */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setEditing(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.5)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-ink">Edit client summary</h3>
              <button onClick={() => setEditing(false)} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            <p className="mb-2 text-[13px] text-muted">This is the summary shown on the card. Regenerating the brief will rebuild it from the latest inputs.</p>
            <Textarea rows={7} value={summary} onChange={(e) => setSummary(e.target.value)} className="text-[14px]" autoFocus />
            <div className="mt-5 flex justify-between gap-2">
              <Button size="md" variant="ghost" onClick={() => setSummary(generateClientSummary(s))}>Reset to generated</Button>
              <div className="flex gap-2">
                <Button size="md" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="md" onClick={() => { briefStore.update(brief.id, { structured: { ...s, summaryOverride: summary } }); setEditing(false); }}>Save changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brief quality */}
      <FloatCard className="lg:row-span-2">
        <CardTitle>Brief quality</CardTitle>
        <div className="flex items-center gap-4">
          <ScoreRing value={brief.score!.overall} size={72} />
          <div>
            <p className="text-[16px] font-semibold text-ink">{scoreLabel(brief.score!.overall)}</p>
            <p className="mt-0.5 text-[13px] text-muted">Completeness across 8 categories.</p>
          </div>
        </div>
        <div className="mt-6 space-y-3.5">
          {Object.entries(brief.score!.categories).map(([k, v]) => <ScoreBar key={k} label={k} value={v} />)}
        </div>
      </FloatCard>

      {/* At a glance */}
      <FloatCard className="lg:col-span-2">
        <CardTitle>At a glance</CardTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <Mini label="Website type" value={s.project.websiteType} />
          <Mini label="Objective" value={s.project.primaryGoal} />
          <Mini label="Primary CTA" value={s.project.primaryCta} />
          <Mini label="Target audience" value={s.business.targetAudience} />
          <Mini label="Location" value={s.business.location} />
          <Mini label="Recommended pages" value={`${s.pages.length} pages`} />
        </div>
      </FloatCard>

      {/* Missing info sticky */}
      <div className="lg:col-span-1">
        <Sticky title="Missing info">
          <ul className="space-y-2.5">
            {missing.map((m, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-snug text-black/80"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black/50" />{m}</li>
            ))}
          </ul>
          <button onClick={() => goTo("Questions")} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black/85 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-black">Generate questions →</button>
        </Sticky>
      </div>

      {/* Meeting notes & client inputs (compact — opens in modal) */}
      <FloatCard>
        <CardTitle action={<span className="rounded-md bg-panel px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted">{methodLabel(brief)}</span>}>Meeting Notes &amp; Client Inputs</CardTitle>
        <p className="text-[13.5px] leading-relaxed text-muted">Review or update the original client notes, guided answers, transcript, and extra context used to generate this brief.</p>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => setRawOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="-ml-0.5"><path d="M8 6h9M8 10h9M8 14h6M5 6h.01M5 10h.01M5 14h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          Open &amp; Edit Inputs
        </Button>
      </FloatCard>

      {/* Inputs modal */}
      {rawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setRawOpen(false)} />
          <div className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl border border-line bg-surface shadow-[0_40px_120px_-40px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-[17px] font-semibold text-ink">Meeting Notes &amp; Client Inputs</h3>
                <p className="mt-0.5 text-[12.5px] text-muted">Source: {methodLabel(brief)}{brief.transcriptSource ? ` · ${brief.transcriptSource}` : ""}</p>
              </div>
              <button onClick={() => setRawOpen(false)} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="grid flex-1 gap-5 overflow-y-auto p-6 md:grid-cols-[1.7fr_1fr]">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-faint">Notes & context</label>
                <Textarea rows={14} value={rawValue} onChange={(e) => setNotes(e.target.value)} className="text-[13.5px]" />
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setNotes((rawValue || "") + "\n\nAdditional context: ")}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="-ml-0.5"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  Add more context
                </Button>
              </div>
              <div className="rounded-xl bg-warning-soft/50 p-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-black/55">Still missing before you regenerate</p>
                <ul className="mt-3 space-y-2.5">
                  {generateMissingInfo(s, brief.score!).slice(0, 4).map((m, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-snug text-black/75"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black/45" />{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">
              <Button size="md" variant="outline" onClick={() => setRawOpen(false)}>Cancel</Button>
              <Button size="md" variant="outline" onClick={() => { save(); setRawOpen(false); }}>Save</Button>
              <Button size="md" onClick={() => { regenerate(); setRawOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 0 0-14-3M4 15a8 8 0 0 0 14 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Save &amp; regenerate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Next actions */}
      <FloatCard className="lg:col-span-2">
        <CardTitle>Next actions</CardTitle>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { label: "Review missing info", to: "Questions" as Board, done: false },
            { label: "Approve sitemap", to: "Structure" as Board, done: false },
            { label: "Generate wireframe", to: "Structure" as Board, done: !!brief.wireframe?.length },
            { label: "Export scope", to: "Outputs" as Board, done: false },
          ].map((a) => (
            <button key={a.label} onClick={() => goTo(a.to)} className="flex items-center gap-3 rounded-xl border border-line/70 bg-canvas/50 p-4 text-left transition-colors hover:border-accent/40">
              <span className={`grid size-6 shrink-0 place-items-center rounded-full ${a.done ? "bg-success text-white" : "border border-line bg-surface text-faint"}`}>
                {a.done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : ""}
              </span>
              <span className="flex-1 text-[14px] font-medium text-ink">{a.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-faint"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ))}
        </div>
      </FloatCard>
    </div>
  );
}

/* ── Structure ── */
function StructureBoard({ brief }: { brief: Brief }) {
  const s = brief.structured!;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <FloatCard>
        <CardTitle>Goals</CardTitle>
        <KeyValue label="Primary goal" value={s.project.primaryGoal} />
        <div className="mt-4"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Secondary goals</p><BulletList items={s.project.secondaryGoals} /></div>
      </FloatCard>

      <FloatCard>
        <CardTitle>Features</CardTitle>
        <Chips items={s.features.selected} tone="accent" />
        <p className="mt-4 text-[13px] leading-relaxed text-muted">{s.features.technicalNotes}</p>
      </FloatCard>

      <FloatCard className="lg:col-span-2">
        <CardTitle>Pages</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.pages.map((p) => (
            <div key={p.name} className="rounded-xl border border-line/70 bg-canvas/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold text-ink">{p.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase ${prio(p.seoPriority)}`}>{p.seoPriority}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-snug text-muted">{p.goal}</p>
              <p className="mt-2 text-[11.5px] text-faint">CTA: {p.cta}</p>
            </div>
          ))}
        </div>
      </FloatCard>

      <FloatCard className="lg:col-span-2">
        <CardTitle>Sitemap</CardTitle>
        <div className="space-y-2">{(brief.sitemap ?? []).map((n) => <SitemapRow key={n.name} n={n} />)}</div>
      </FloatCard>

      <FloatCard className="lg:col-span-2">
        <CardTitle>Wireframe plan</CardTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {(brief.wireframe ?? []).map((wp) => (
            <div key={wp.page} className="rounded-xl border border-line/70 bg-canvas/50 p-4">
              <p className="mb-3 text-[14px] font-semibold text-ink">{wp.page}</p>
              <ol className="space-y-2">
                {wp.sections.map((sec, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-md bg-panel text-[11px] font-bold text-body">{i + 1}</span>
                    <span className="text-[13px] font-medium text-body">{sec.name}</span>
                    <span className="ml-auto rounded-full bg-panel px-2 py-0.5 text-[10px] text-muted">{sec.component}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </FloatCard>

      {brief.scope && (
        <FloatCard className="lg:col-span-2">
          <CardTitle>Scope of work</CardTitle>
          <p className="text-[14px] leading-relaxed text-body">{brief.scope.summary}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Included features</p><Chips items={brief.scope.includedFeatures} /></div>
            <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Exclusions</p><BulletList items={brief.scope.exclusions} /></div>
          </div>
        </FloatCard>
      )}
    </div>
  );
}
function SitemapRow({ n, depth = 0 }: { n: SitemapNode; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2.5 rounded-xl border border-line/70 bg-canvas/50 px-3.5 py-2.5">
        {depth > 0 && <span className="text-faint">↳</span>}
        <span className="text-[14px] font-semibold text-ink">{n.name}</span>
        <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase ${prio(n.seoPriority)}`}>{n.seoPriority}</span>
        <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-medium ${n.required ? "bg-accent-soft text-accent" : "bg-panel text-muted"}`}>{n.required ? "Required" : "Optional"}</span>
        <span className="ml-auto hidden text-[12px] text-muted sm:inline">{n.cta}</span>
      </div>
      {n.children && <div className="mt-2 space-y-2">{n.children.map((c) => <SitemapRow key={c.name} n={c} depth={depth + 1} />)}</div>}
    </div>
  );
}

/* ── Content & SEO ── */
function ContentBoard({ brief }: { brief: Brief }) {
  const s = brief.structured!;
  return (
    <div className="gap-5 space-y-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
      <FloatCard>
        <CardTitle>Brand direction</CardTitle>
        <div className="grid gap-3">
          <Mini label="Style" value={s.brand.style} />
          <Mini label="Typography" value={s.brand.typography} />
          <Mini label="Suggested colours" value={<Chips items={s.brand.colors} />} />
          <Mini label="References" value={s.brand.references.length ? s.brand.references.join(", ") : "None provided"} />
        </div>
      </FloatCard>

      <div><Sticky title="Tone of voice" color="#DBEAFE"><p className="text-[15px] font-medium leading-relaxed text-black/80">{s.brand.tone}</p></Sticky></div>

      <FloatCard>
        <CardTitle>SEO locations</CardTitle>
        <Chips items={s.seo.targetLocations} />
        <p className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Main services</p>
        <Chips items={s.seo.mainServices} />
      </FloatCard>

      <FloatCard>
        <CardTitle>Suggested keywords</CardTitle>
        <Chips items={s.seo.keywords} tone="success" />
      </FloatCard>

      <FloatCard>
        <CardTitle>Content opportunities</CardTitle>
        <BulletList items={[...s.seo.contentOpportunities, ...s.seo.blogIdeas]} />
      </FloatCard>

      <FloatCard>
        <CardTitle>Competitor notes</CardTitle>
        <p className="text-[14px] leading-relaxed text-body">{s.seo.competitorNotes}</p>
      </FloatCard>
    </div>
  );
}

/* ── Questions ── */
function QuestionsBoard({ brief }: { brief: Brief }) {
  const s = brief.structured!;
  const toggle = (bucket: "open" | "followUp", qid: string, patch: Partial<{ answered: boolean; answer: string }>) => {
    const q = { ...s.questions };
    q[bucket] = q[bucket].map((x) => (x.id === qid ? { ...x, ...patch } : x));
    briefStore.update(brief.id, { structured: { ...s, questions: q } });
  };
  const all = [...s.questions.open, ...s.questions.followUp];
  const answered = all.filter((q) => q.answered);
  const stickyColors = ["#FEF3C7", "#FDE68A", "#FEF9C3"];

  const QCard = ({ bucket, q, i }: { bucket: "open" | "followUp"; q: (typeof all)[number]; i: number }) => (
    <div className="rounded-2xl p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]" style={{ backgroundColor: stickyColors[i % stickyColors.length] }}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => toggle(bucket, q.id, { answered: !q.answered })} className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${q.answered ? "border-black/70 bg-black/80 text-white" : "border-black/30"}`}>
          {q.answered && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-black/85">{q.text}</p>
          <textarea rows={2} placeholder="Add answer…" value={q.answer ?? ""} onChange={(e) => toggle(bucket, q.id, { answer: e.target.value })} className="mt-2 w-full resize-none rounded-lg border border-black/10 bg-white/50 px-2.5 py-2 text-[13px] text-black/80 outline-none placeholder:text-black/40" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Missing information</h3>
          <CopyButton text={s.questions.open.map((q, i) => `${i + 1}. ${q.text}`).join("\n")} label="Copy list" />
        </div>
        <div className="gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">{s.questions.open.map((q, i) => <QCard key={q.id} bucket="open" q={q} i={i} />)}</div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Follow-up questions</h3>
          <CopyButton text={s.questions.followUp.map((q, i) => `${i + 1}. ${q.text}`).join("\n")} label="Copy list" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{s.questions.followUp.map((q, i) => <QCard key={q.id} bucket="followUp" q={q} i={i} />)}</div>
      </div>
      <div>
        <h3 className="mb-4 text-[15px] font-semibold text-ink">Answered ({answered.length})</h3>
        {answered.length ? (
          <FloatCard>
            <ul className="space-y-2.5">
              {answered.map((q) => (
                <li key={q.id} className="text-[13.5px]">
                  <span className="font-medium text-ink">{q.text}</span>
                  {q.answer && <span className="mt-0.5 block text-muted">{q.answer}</span>}
                </li>
              ))}
            </ul>
          </FloatCard>
        ) : <p className="text-[13.5px] text-muted">No questions answered yet — tick a note above to mark it done.</p>}
      </div>
    </div>
  );
}

/* ── Outputs ── */
function OutputsBoard({ brief }: { brief: Brief }) {
  const s = brief.structured!;
  const prompts = generateExportPrompts(brief);
  const briefDoc = `# ${s.business.name} — Website Brief\n\n${s.summaryOverride ?? generateClientSummary(s)}\n\n## Goal\n${s.project.primaryGoal}\n\n## Pages\n${s.pages.map((p) => `- ${p.name}`).join("\n")}\n\n## Features\n${s.features.selected.join(", ")}`;
  const sitemapDoc = (brief.sitemap ?? []).map((n) => `- ${n.name}${n.children ? "\n" + n.children.map((c) => `  - ${c.name}`).join("\n") : ""}`).join("\n");
  const wireframeDoc = (brief.wireframe ?? []).map((wp) => `## ${wp.page}\n${wp.sections.map((x, i) => `${i + 1}. ${x.name} — ${x.purpose}`).join("\n")}`).join("\n\n");
  const scopeDoc = brief.scope ? `# Scope of Work\n${brief.scope.summary}\n\nPages: ${brief.scope.includedPages.join(", ")}\nFeatures: ${brief.scope.includedFeatures.join(", ")}\nExclusions: ${brief.scope.exclusions.join("; ")}` : "";

  const EXPORTS: { title: string; ext: string; content: string; type?: string }[] = [
    { title: "Client Brief", ext: "md", content: briefDoc },
    { title: "Sitemap", ext: "md", content: sitemapDoc },
    { title: "Wireframe Plan", ext: "md", content: wireframeDoc },
    { title: "Scope of Work", ext: "md", content: scopeDoc },
    { title: "Claude Prompt", ext: "txt", content: prompts.claude },
    { title: "Lovable Prompt", ext: "txt", content: prompts.lovable },
    { title: "Cursor Prompt", ext: "txt", content: prompts.cursor },
    { title: "JSON Data", ext: "json", content: prompts.json, type: "application/json" },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {EXPORTS.map((e) => (
        <FloatCard key={e.title} pad="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-ink">{e.title}</p>
            <span className="rounded-md bg-panel px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase text-muted">.{e.ext}</span>
          </div>
          <pre className="mt-3 h-28 overflow-hidden rounded-xl bg-canvas/70 p-3 font-mono text-[11px] leading-relaxed text-muted">{e.content.slice(0, 260) || "—"}</pre>
          <div className="mt-4 flex gap-2">
            <CopyButton text={e.content} />
            <Button size="sm" variant="outline" onClick={() => downloadFile(`${brief.businessName.replace(/\s+/g, "-").toLowerCase()}-${e.title.replace(/\s+/g, "-").toLowerCase()}.${e.ext}`, e.content, e.type)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Download
            </Button>
          </div>
        </FloatCard>
      ))}
    </div>
  );
}
