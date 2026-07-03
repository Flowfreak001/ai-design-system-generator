"use client";

// Section Reference Library UI. Upload a section reference image → extract a
// reusable design PATTERN (never a copy) → review → save. Search/filter saved
// patterns and generate an original, reference-inspired section spec from one.

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { analyzeReferenceAction, saveReferencePatternAction, deleteReferencePatternAction } from "@/app/(app)/projects/[id]/references/actions";
import { generateSectionFromReferencePattern, filterPatterns } from "@/lib/references/pattern";
import { STYLE_TAGS, type ReferenceSectionType, type SectionPattern } from "@/lib/references/types";

const SECTION_TYPES: ReferenceSectionType[] = ["hero", "features", "services", "showcase", "gallery", "pricing", "testimonials", "faq", "cta", "footer", "navbar", "booking", "contact", "product", "dashboard", "custom"];

async function downscale(file: File, max: number): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); });
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  });
}

export function ReferenceLibraryClient({ projectId, projectName, initialPatterns }: { projectId: string; projectName: string; initialPatterns: SectionPattern[] }) {
  const [patterns, setPatterns] = useState<SectionPattern[]>(initialPatterns);
  const [full, setFull] = useState<string>("");
  const [thumb, setThumb] = useState<string>("");
  const [sectionType, setSectionType] = useState<ReferenceSectionType>("features");
  const [websiteType, setWebsiteType] = useState("");
  const [industry, setIndustry] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<SectionPattern | null>(null);
  const [busy, start] = useTransition();
  const [err, setErr] = useState("");
  const [genSpec, setGenSpec] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const closeAdd = () => { setAddOpen(false); setDraft(null); setErr(""); };

  // Filters
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fApproved, setFApproved] = useState<"all" | "approved" | "unapproved">("all");
  const [fNeedsNew, setFNeedsNew] = useState(false);
  const visible = useMemo(() => filterPatterns(patterns, { text: q, sectionType: fType, approved: fApproved, needsNewComponent: fNeedsNew }), [patterns, q, fType, fApproved, fNeedsNew]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setErr("");
    setFull(await downscale(f, 1024));
    setThumb(await downscale(f, 360));
  };
  const toggleTag = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const analyze = () => {
    if (!full) { setErr("Upload a section image first."); return; }
    setErr(""); setDraft(null);
    start(async () => {
      const r = await analyzeReferenceAction(projectId, { imageDataUrl: full, thumbnailUrl: thumb, sectionType, websiteType, industry, styleTags: tags, notes });
      if (r.error) setErr(r.error); else setDraft(r.pattern ?? null);
    });
  };
  const save = () => {
    if (!draft) return;
    start(async () => {
      const r = await saveReferencePatternAction(projectId, draft);
      if (r.error) { setErr(r.error); return; }
      setPatterns((cur) => [{ ...draft, approved: true }, ...cur.filter((p) => p.id !== draft.id)]);
      setDraft(null); setFull(""); setThumb(""); setNotes(""); setAddOpen(false);
    });
  };
  const remove = (id: string) => start(async () => { await deleteReferencePatternAction(projectId, id); setPatterns((cur) => cur.filter((p) => p.id !== id)); });
  const generate = (p: SectionPattern) => setGenSpec(JSON.stringify(generateSectionFromReferencePattern(p, { businessName: projectName }), null, 2));

  return (
    <PageContainer>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-ink">Section Reference Library</h1>
          <p className="text-[12.5px] text-muted">Upload section references → extract reusable design patterns. Originals only — never copies of text, images, logos, or exact designs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}>＋ Add reference</Button>
          <Link href={`/projects/${projectId}/editor`}><Button size="sm" variant="secondary">← Editor</Button></Link>
        </div>
      </div>

      {/* Full-width library gallery */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patterns…" className="w-56 rounded-lg border border-line px-3 py-1.5 text-[13px]" />
          <select value={fType} onChange={(e) => setFType(e.target.value)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px] capitalize"><option value="all">All types</option>{SECTION_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={fApproved} onChange={(e) => setFApproved(e.target.value as typeof fApproved)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px]"><option value="all">All</option><option value="approved">Approved</option><option value="unapproved">Unapproved</option></select>
          <label className="flex items-center gap-1.5 text-[12px] text-muted"><input type="checkbox" checked={fNeedsNew} onChange={(e) => setFNeedsNew(e.target.checked)} className="accent-accent" /> Needs new component</label>
          <span className="ml-auto text-[12px] text-faint">{visible.length} pattern{visible.length === 1 ? "" : "s"}</span>
        </div>

        {visible.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
            <p className="text-[13px] text-muted">No saved patterns yet.</p>
            <Button size="sm" onClick={() => setAddOpen(true)}>＋ Add your first reference</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
                  <div key={p.id} className="card overflow-hidden p-0">
                    {p.referenceImageUrl && <img src={p.referenceImageUrl} alt="" className="h-28 w-full object-cover opacity-90" />}
                    <div className="p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold text-ink">{p.name}</span>
                        <span className="shrink-0 rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted">{p.sectionType}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] text-muted">{p.layoutPattern}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.matchedComponent ? <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-medium text-success">→ {p.matchedComponent.componentName}</span>
                          : <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">needs new component</span>}
                        {p.styleTags.slice(0, 3).map((t) => <span key={t} className="rounded bg-panel px-1.5 py-0.5 text-[10px] text-faint">{t}</span>)}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <button type="button" onClick={() => generate(p)} className="text-[12px] font-medium text-accent hover:underline">Generate section →</button>
                        <button type="button" onClick={() => remove(p.id)} className="text-[12px] text-faint hover:text-danger">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>

      {/* Add reference modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/30 p-4" onClick={closeAdd}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-ink">Add a reference</p>
                <p className="text-[12px] text-muted">Upload a section screenshot — we extract a reusable pattern, not a copy.</p>
              </div>
              <button type="button" onClick={closeAdd} className="grid h-7 w-7 place-items-center rounded-md text-faint hover:bg-panel hover:text-ink">✕</button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Form */}
              <div>
                <label className="grid cursor-pointer place-items-center rounded-xl border border-dashed border-line py-6 text-center hover:border-accent">
                  {thumb ? <img src={thumb} alt="reference" className="max-h-48 rounded-lg" /> : <span className="text-[12.5px] text-muted">Click to upload a section screenshot</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>

                <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-faint">Section type</label>
                <select value={sectionType} onChange={(e) => setSectionType(e.target.value as ReferenceSectionType)} className="mt-1 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] capitalize">
                  {SECTION_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div><label className="block text-[11px] font-medium uppercase tracking-wide text-faint">Website type</label><input value={websiteType} onChange={(e) => setWebsiteType(e.target.value)} placeholder="SaaS, agency…" className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" /></div>
                  <div><label className="block text-[11px] font-medium uppercase tracking-wide text-faint">Industry</label><input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="fintech…" className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" /></div>
                </div>

                <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-faint">Style tags</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {STYLE_TAGS.map((t) => (
                    <button key={t} type="button" onClick={() => toggleTag(t)} className={`rounded-full px-2.5 py-1 text-[11.5px] ${tags.includes(t) ? "bg-accent text-white" : "bg-panel text-muted hover:text-ink"}`}>{t}</button>
                  ))}
                </div>

                <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-faint">What do you like about it?</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" placeholder="e.g. the split layout and the accordion interaction" />

                {err && <p className="mt-2 text-[12px] text-danger">{err}</p>}
                <Button size="sm" className="mt-3 w-full" onClick={analyze} disabled={busy || !full}>{busy ? "Analyzing…" : "✦ Analyze reference"}</Button>
              </div>

              {/* Extracted pattern review */}
              <div className="rounded-xl border border-line bg-panel/30 p-4">
                {draft ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-ink">Extracted pattern <span className="text-[11px] font-normal text-faint">· confidence {draft.confidence}</span></p>
                      <Button size="sm" onClick={save} disabled={busy}>Save to library</Button>
                    </div>
                    <PatternDetail p={draft} />
                  </>
                ) : (
                  <div className="grid h-full min-h-40 place-items-center text-center text-[12.5px] text-faint">Analyze a reference to see the extracted pattern here.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated section spec modal */}
      {genSpec && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/30 p-6" onClick={() => setGenSpec(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-surface p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Generated section spec <span className="text-[11px] font-normal text-faint">· reference-inspired original (grey placeholders)</span></p>
              <button type="button" onClick={() => setGenSpec(null)} className="text-faint hover:text-ink">✕</button>
            </div>
            <pre className="overflow-auto rounded-lg bg-panel p-3 text-[11px] leading-relaxed text-body">{genSpec}</pre>
            <p className="mt-2 text-[11px] text-faint">TODO: “Insert into page” / “Replace section” wiring in the Design Canvas.</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function PatternDetail({ p }: { p: SectionPattern }) {
  const rows: [string, string[] | string][] = [
    ["Layout", p.layoutPattern],
    ["Hierarchy", p.visualHierarchy],
    ["Components", p.componentStructure],
    ["Typography", p.typographyDirection],
    ["Colour direction", p.colorDirection],
    ["Spacing", p.spacingDirection],
    ["Image treatment", p.imageTreatment],
    ["Interaction", p.interactionPattern],
    ["Content slots", p.contentSlots],
  ];
  return (
    <div className="mt-3 grid gap-2 text-[12.5px]">
      <p className="text-[12px] text-muted">Match: {p.matchedComponent ? <span className="font-medium text-success">{p.matchedComponent.componentName} ({p.matchedComponent.variantId})</span> : <span className="font-medium text-warning">needs new component — {p.customSpec?.suggestedComponentName}</span>}</p>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-faint">{k}</span>
          <span className="text-body">{Array.isArray(v) ? v.join(" · ") : v}</span>
        </div>
      ))}
      {p.warnings.length > 0 && <p className="mt-1 rounded-md bg-warning-soft px-2 py-1 text-[11.5px] text-warning">⚠ {p.warnings.join(" ")}</p>}
      <p className="rounded-md bg-panel px-2 py-1 text-[11px] text-faint">Originality: create a similar structure with original copy + grey placeholders. Do not copy text, images, logos, or the exact design.</p>
    </div>
  );
}
