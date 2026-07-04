"use client";

// Section Reference Library UI. Upload a section reference image → extract a
// reusable design PATTERN (never a copy) → review → save. Search/filter saved
// patterns and generate an original, reference-inspired section spec from one.

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { analyzeReferenceAction, saveReferencePatternAction, deleteReferencePatternAction } from "@/app/(app)/projects/[id]/references/actions";
import { addGeneratedSectionToPageAction } from "@/app/(app)/projects/[id]/editor/actions";
import { useRouter } from "next/navigation";
import { generateSectionFromReferencePattern, filterPatterns } from "@/lib/references/pattern";
import { GeneratedSection } from "@/components/sections/generated/GeneratedSection";
import {
  SECTION_TYPE_OPTIONS, WEBSITE_TYPE_OPTIONS, INDUSTRY_OPTIONS,
  PURPOSE_GROUPS, PURPOSE_CATEGORY_OF,
  VISUAL_STYLE_TAGS, LAYOUT_TAGS, INTERACTION_TAGS,
  type ReferenceSectionType, type SectionPattern, type GeneratedSectionSpec,
} from "@/lib/references/types";

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

export function ReferenceLibraryClient({ projectId, projectName, initialPatterns, pages = [] }: { projectId: string; projectName: string; initialPatterns: SectionPattern[]; pages?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [patterns, setPatterns] = useState<SectionPattern[]>(initialPatterns);
  const [addPageId, setAddPageId] = useState<string>(pages[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);

  const addToPage = () => {
    if (!created) return;
    setAdding(true); setAddedMsg(null);
    start(async () => {
      const res = await addGeneratedSectionToPageAction(projectId, addPageId, created.spec, created.pattern);
      setAdding(false);
      if (res.error) { setAddedMsg(res.error); return; }
      setAddedMsg("Added to the page — opening the Design Editor…");
      setTimeout(() => router.push(`/projects/${projectId}/editor`), 700);
    });
  };
  const [full, setFull] = useState<string>("");
  const [thumb, setThumb] = useState<string>("");
  const [sectionType, setSectionType] = useState<ReferenceSectionType>("hero");
  const [websiteType, setWebsiteType] = useState("");
  const [websiteTypeCustom, setWebsiteTypeCustom] = useState("");
  const [industry, setIndustry] = useState("");
  const [primaryPurpose, setPrimaryPurpose] = useState("");
  const [secondaryPurposes, setSecondaryPurposes] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [layoutTags, setLayoutTags] = useState<string[]>([]);
  const [interactionTags, setInteractionTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [draft, setDraft] = useState<SectionPattern | null>(null);
  const [busy, start] = useTransition();
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<{ spec: GeneratedSectionSpec; pattern: SectionPattern } | null>(null);
  const [showSpec, setShowSpec] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const closeAdd = () => { setAddOpen(false); setDraft(null); setErr(""); setShowMore(false); };

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
  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (t: string) =>
    setter((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const resolvedWebsiteType = websiteType === "Custom" ? websiteTypeCustom.trim() : websiteType;

  const analyze = () => {
    if (!full) { setErr("Upload a section image first."); return; }
    setErr(""); setDraft(null);
    start(async () => {
      const r = await analyzeReferenceAction(projectId, {
        imageDataUrl: full, thumbnailUrl: thumb, sectionType,
        websiteType: resolvedWebsiteType, industry,
        primaryPurpose, secondaryPurposes,
        purposeCategory: primaryPurpose ? PURPOSE_CATEGORY_OF[primaryPurpose] : undefined,
        styleTags, layoutTags, interactionTags, notes,
      });
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
      setStyleTags([]); setLayoutTags([]); setInteractionTags([]);
      setPrimaryPurpose(""); setSecondaryPurposes([]);
    });
  };
  const remove = (id: string) => start(async () => { await deleteReferencePatternAction(projectId, id); setPatterns((cur) => cur.filter((p) => p.id !== id)); });
  const generate = (p: SectionPattern) => { setShowSpec(false); setCreated({ spec: generateSectionFromReferencePattern(p, { businessName: projectName }), pattern: p }); };

  return (
    <PageContainer>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-ink">Section Reference Library</h1>
          <p className="text-[12.5px] text-muted">Upload section references → extract reusable design patterns. Originals only — never copies of text, images, logos, or exact designs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="-ml-0.5">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
            Add reference
          </Button>
          <Link href={`/projects/${projectId}/editor`}>
            <Button size="sm" variant="secondary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="-ml-0.5">
                <path d="M14.5 5.5 18.5 9.5M4 20l.9-3.6a2 2 0 0 1 .5-.9l9.9-9.9a2 2 0 0 1 2.8 0l.9.9a2 2 0 0 1 0 2.8l-9.9 9.9a2 2 0 0 1-.9.5L4 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Editor
            </Button>
          </Link>
        </div>
      </div>

      {/* Full-width library gallery */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patterns…" className="w-56 rounded-lg border border-line px-3 py-1.5 text-[13px]" />
          <select value={fType} onChange={(e) => setFType(e.target.value)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px]"><option value="all">All types</option>{SECTION_TYPE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          <select value={fApproved} onChange={(e) => setFApproved(e.target.value as typeof fApproved)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px]"><option value="all">All</option><option value="approved">Approved</option><option value="unapproved">Unapproved</option></select>
          <label className="flex items-center gap-1.5 text-[12px] text-muted"><input type="checkbox" checked={fNeedsNew} onChange={(e) => setFNeedsNew(e.target.checked)} className="accent-accent" /> Needs new component</label>
          <span className="ml-auto text-[12px] text-faint">{visible.length} pattern{visible.length === 1 ? "" : "s"}</span>
        </div>

        {visible.length === 0 ? (
          <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
            <p className="text-[13px] text-muted">No saved patterns yet.</p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="-ml-0.5">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
              Add your first reference
            </Button>
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
                        <button type="button" onClick={() => generate(p)} className="text-[12px] font-medium text-accent hover:underline">Create section →</button>
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
              <button type="button" onClick={closeAdd} className="grid h-7 w-7 place-items-center rounded-md text-faint hover:bg-panel hover:text-ink" aria-label="Close">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Left: upload + classification */}
              <div className="flex max-h-[70vh] flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <label className="grid cursor-pointer place-items-center rounded-xl border border-dashed border-line py-6 text-center hover:border-accent">
                    {thumb ? <img src={thumb} alt="reference" className="max-h-48 rounded-lg" /> : <span className="text-[12.5px] text-muted">Click to upload a section screenshot</span>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                  </label>

                  {/* Essentials — image + type + purpose is all the AI needs. */}
                  <div className="mt-3">
                    <Field label="Section type">
                      <Select value={sectionType} onChange={(e) => setSectionType(e.target.value as ReferenceSectionType)}>
                        {SECTION_TYPE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </Select>
                    </Field>
                  </div>

                  <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-faint">Section purpose</label>
                  <PurposePicker value={primaryPurpose} onSelect={(o) => setPrimaryPurpose(o)} placeholder="Search or select purpose…" />
                  <p className="mt-1 text-[11px] text-faint">Choose what this section is mainly trying to achieve. This helps AI reuse the reference correctly.</p>

                  {/* Everything else is optional — hidden by default to keep it simple. */}
                  <button type="button" onClick={() => setShowMore((s) => !s)}
                    className="mt-4 flex w-full items-center justify-between rounded-lg bg-panel px-2.5 py-2 text-[12px] font-medium text-body hover:text-ink">
                    <span>More details <span className="font-normal text-faint">(optional — website, industry, style tags)</span></span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`text-faint transition-transform ${showMore ? "rotate-180" : ""}`}>
                      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {showMore && (
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Website type">
                          <Select value={websiteType} onChange={(e) => setWebsiteType(e.target.value)}>
                            <option value="">Select…</option>
                            {WEBSITE_TYPE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </Select>
                        </Field>
                        <Field label="Industry">
                          <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                            <option value="">Select…</option>
                            {INDUSTRY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </Select>
                        </Field>
                        {websiteType === "Custom" ? (
                          <input value={websiteTypeCustom} onChange={(e) => setWebsiteTypeCustom(e.target.value)} placeholder="Describe the website type…" className="col-span-2 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" />
                        ) : null}
                      </div>

                      <label className="mt-3 block text-[11px] font-medium uppercase tracking-wide text-faint">Secondary purposes <span className="text-faint/70">(optional)</span></label>
                      {secondaryPurposes.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {secondaryPurposes.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11.5px] font-medium text-white">
                              {s}
                              <button type="button" aria-label={`Remove ${s}`} onClick={() => setSecondaryPurposes((cur) => cur.filter((x) => x !== s))}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <PurposePicker multi values={secondaryPurposes} disabledValue={primaryPurpose}
                        onSelect={(o) => setSecondaryPurposes((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]))}
                        placeholder="Add supporting purposes…" />

                      <TagGroup title="Visual style" tags={VISUAL_STYLE_TAGS} selected={styleTags} onToggle={toggle(setStyleTags)} />
                      <TagGroup title="Layout style" tags={LAYOUT_TAGS} selected={layoutTags} onToggle={toggle(setLayoutTags)} />
                      <TagGroup title="Interaction style" tags={INTERACTION_TAGS} selected={interactionTags} onToggle={toggle(setInteractionTags)} />

                      <label className="mt-4 block text-[11px] font-medium uppercase tracking-wide text-faint">What do you like about it?</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px]" placeholder="Example: I like the split layout, accordion interaction, large image area, strong headline hierarchy, and clean CTA placement." />
                    </div>
                  )}
                </div>

                {/* Bottom-anchored action */}
                <div className="mt-3 border-t border-line pt-3">
                  {err && <p className="mb-2 text-[12px] text-danger">{err}</p>}
                  <Button size="sm" className="w-full" onClick={analyze} disabled={busy || !full}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="-ml-0.5">
                      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    {busy ? "Analyzing…" : "Analyze reference"}
                  </Button>
                </div>
              </div>

              {/* Right: analysis preview */}
              <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-panel/30 p-4">
                {draft ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-ink">Extracted pattern <span className="text-[11px] font-normal text-faint">· confidence {draft.confidence}</span></p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={save} disabled={busy}>Save pattern</Button>
                        <Button size="sm" onClick={() => generate(draft)}>Create section →</Button>
                      </div>
                    </div>
                    <p className="mt-1 text-[11.5px] text-muted">Create an original editable section from this reference, or save the pattern for later.</p>
                    {draft.visionDebug && (
                      <div className={`mt-2 rounded-lg border px-2.5 py-2 text-[11px] ${draft.visionDebug.error || draft.visionDebug.finishReason === "length" ? "border-danger/40 bg-danger-soft/40 text-danger" : draft.visionDebug.fallbackUsed ? "border-warning/40 bg-warning-soft/40 text-warning" : "border-line bg-surface text-muted"}`}>
                        <span className="font-semibold uppercase tracking-wide">Vision</span>{" "}
                        requested <span className="font-mono">{draft.visionDebug.requestedModel}</span> → used <span className="font-mono">{draft.visionDebug.model}</span>
                        {" · "}fallback <span className="font-mono">{draft.visionDebug.fallbackUsed ? "yes" : "no"}</span>
                        {" · "}max {draft.visionDebug.maxTokens}
                        {" · "}finish <span className="font-mono">{draft.visionDebug.finishReason}</span>
                        {" · "}len {draft.visionDebug.responseLength}
                        {!draft.visionDebug.ran && <span> · did not run</span>}
                        {draft.visionDebug.fallbackReason && <div className="mt-0.5">fallback reason: {draft.visionDebug.fallbackReason}</div>}
                        {draft.visionDebug.error && <div className="mt-0.5">{draft.visionDebug.error}</div>}
                      </div>
                    )}
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

      {/* Created section — live preview of a NEW original editable section built
          from the reference pattern (never the uploaded screenshot). */}
      {created && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 p-4 sm:p-6" onClick={() => setCreated(null)}>
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Created section — {created.spec.name}</p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  A new original editable section, inspired by the “{created.pattern.name}” pattern. Grey placeholders only — never a copy of the uploaded screenshot.
                </p>
              </div>
              <button type="button" onClick={() => setCreated(null)} className="shrink-0 text-faint hover:text-ink" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {/* Live rendered preview of the created section. */}
              <div className="border-b border-line">
                <div className="pointer-events-none select-none">
                  <GeneratedSection spec={created.spec} pattern={created.pattern} />
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Detected pattern</p>
                  {created.spec.detected?.layoutType ? (
                    <p className="mt-1 text-[12.5px] text-body"><span className="font-medium text-ink">{created.spec.detected.layoutType}</span>{created.spec.detected.patternFamily ? ` · ${created.spec.detected.patternFamily}` : ""}</p>
                  ) : (
                    <p className="mt-1 text-[12.5px] text-body">Composed from the reference’s layout.</p>
                  )}
                  {created.spec.detected && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(["hasAccordion","hasForm","hasPricing","hasTestimonials","hasStats","hasLogos","hasGallery","hasMedia","hasSplitIntro"] as const)
                        .filter((k) => created.spec.detected?.[k]).map((k) => <span key={k} className="rounded bg-panel px-1.5 py-0.5 text-[10px] text-muted">{k.replace(/^has/, "").toLowerCase()}</span>)}
                      {created.spec.detected.isDark && <span className="rounded bg-panel px-1.5 py-0.5 text-[10px] text-muted">dark</span>}
                    </div>
                  )}
                  <p className="mt-1.5 text-[11px] text-faint">New GeneratedSectionRenderer{created.spec.inspiredByComponent ? ` · similar: ${created.spec.inspiredByComponent} (not reused)` : ""}</p>
                  {created.spec.validation && (created.spec.validation.status === "passed" ? (
                    <p className="mt-1 text-[11px] font-medium text-success">Validation passed — matches the detected pattern.</p>
                  ) : (
                    <div className="mt-1">
                      <p className="text-[11px] font-medium text-warning">Validation warnings — review before marking ready:</p>
                      <ul className="mt-0.5 grid gap-0.5 text-[11px] text-warning">
                        {created.spec.validation.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                      </ul>
                    </div>
                  ))}
                  <p className="mt-2 text-[11px] text-faint">{created.spec.responsiveNotes}</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Pattern</p>
                  <p className="mt-1 line-clamp-3 text-[12.5px] text-body">{created.spec.purpose}</p>
                  <button type="button" onClick={() => setShowSpec((s) => !s)} className="mt-2 text-[11.5px] font-medium text-accent hover:underline">{showSpec ? "Hide" : "View"} full spec (JSON)</button>
                </div>
                {showSpec && (
                  <pre className="sm:col-span-2 max-h-64 overflow-auto rounded-lg bg-panel p-3 text-[11px] leading-relaxed text-body">{JSON.stringify(created.spec, null, 2)}</pre>
                )}
              </div>
            </div>

            {/* Actions. Add-to-page / save-to-library persistence is the next phase. */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-4 py-3">
              <span className="mr-auto text-[11px] text-faint">{addedMsg ?? "source: reference-inspired · live & editable once added"}</span>
              <Button size="sm" variant="secondary" onClick={() => generate(created.pattern)}>Regenerate</Button>
              {pages.length > 0 ? (
                <>
                  <select value={addPageId} onChange={(e) => setAddPageId(e.target.value)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-[12.5px]">
                    {pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <Button size="sm" onClick={addToPage} disabled={adding || busy}>{adding ? "Adding…" : "Add to page →"}</Button>
                </>
              ) : (
                <Link href={`/projects/${projectId}/editor`}><Button size="sm">Open Design Editor</Button></Link>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

/** Searchable, grouped purpose picker. Single-select (primary) or multi (secondary). */
function PurposePicker({ value, values, multi, disabledValue, onSelect, placeholder }: {
  value?: string; values?: string[]; multi?: boolean; disabledValue?: string;
  onSelect: (option: string) => void; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = new Set(values ?? []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const q = query.trim().toLowerCase();
  const groups = PURPOSE_GROUPS
    .map((g) => ({ category: g.category, options: g.options.filter((o) => !q || o.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)) }))
    .filter((g) => g.options.length);

  return (
    <div ref={ref} className="relative mt-1">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-2.5 py-1.5 text-left text-[13px]">
        <span className={value ? "text-ink" : "text-faint"}>{multi ? placeholder : value || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`text-faint transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-[90] mt-1 max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface p-1.5 shadow-xl">
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search purposes…"
            className="mb-1 w-full rounded-md border border-line px-2 py-1 text-[12.5px]" />
          {groups.length === 0 && <p className="px-2 py-3 text-center text-[12px] text-faint">No matches.</p>}
          {groups.map((g) => (
            <div key={g.category} className="mb-1">
              <p className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">{g.category}</p>
              {g.options.map((o) => {
                const isSel = multi ? selected.has(o) : value === o;
                const isDisabled = multi && disabledValue === o;
                return (
                  <button key={o} type="button" disabled={isDisabled}
                    onClick={() => { onSelect(o); if (!multi) { setOpen(false); setQuery(""); } }}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[12.5px] ${isDisabled ? "cursor-not-allowed text-faint/50" : isSel ? "bg-accent-soft font-medium text-accent" : "text-body hover:bg-panel"}`}>
                    {o}
                    {isSel && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-wide text-faint">{label}</label>
      {children}
    </div>
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className="mt-1 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px]">
      {children}
    </select>
  );
}

/** A titled, collapsible group of selectable tag chips. */
function TagGroup({ title, tags, selected, onToggle }: {
  title: string; tags: readonly string[]; selected: string[]; onToggle: (t: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const count = selected.length;
  return (
    <div className="mt-3 rounded-lg border border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-2.5 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {title}{count > 0 && <span className="ml-1.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">{count}</span>}
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`text-faint transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="flex flex-wrap gap-1.5 px-2.5 pb-2.5">
          {tags.map((t) => {
            const active = selected.includes(t);
            return (
              <button key={t} type="button" onClick={() => onToggle(t)}
                className={`rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${active ? "border-accent bg-accent font-medium text-white" : "border-line bg-panel text-muted hover:border-accent/40 hover:text-ink"}`}>
                {t}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PatternDetail({ p }: { p: SectionPattern }) {
  const allTags = [...(p.styleTags ?? []), ...(p.layoutTags ?? []), ...(p.interactionTags ?? []), ...(p.conversionTags ?? [])];
  const rows: [string, string[] | string][] = [
    ["Classified as", [p.sectionType, p.websiteType, p.industry].filter(Boolean) as string[]],
    ["Purpose", [p.primaryPurpose ?? p.patternGoal, ...(p.secondaryPurposes ?? [])].filter(Boolean) as string[]],
    ["Tags", allTags.length ? allTags : ["—"]],
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
      <p className="text-[12px] text-body">Creates a <span className="font-medium text-ink">new generated section</span> from this reference — rendered by GeneratedSectionRenderer, not a reused component.</p>
      {p.matchedComponent && <p className="text-[11px] text-faint">Similar existing pattern (reference only): {p.matchedComponent.componentName}</p>}
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
