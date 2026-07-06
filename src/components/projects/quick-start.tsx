"use client";

// Two light steps: 1) Basics (name + reference + optional details), 2) Pages
// (website type → recommended pages, editable). Only a project name is required;
// pages are pre-selected from the type/industry so most users just click Create.

import { startTransition, useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createProjectAction, type FormState } from "@/app/(app)/projects/actions";
import { INDUSTRIES, WEBSITE_TYPES, suggestPages, suggestFeatures } from "@/lib/onboarding";

const INPUT = "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] font-normal text-ink outline-none placeholder:text-faint focus:border-accent";
const EXTRA_PAGES = ["Home", "About", "Services", "Service detail", "Contact", "Blog", "Pricing", "FAQ", "Gallery", "Portfolio / case studies", "Team", "Testimonials", "Shop", "Menu", "Booking", "Login / dashboard"];

export function QuickStart({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(createProjectAction, {});
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [name, setName] = useState("");
  const [start, setStart] = useState<"reference" | "blank">("reference");
  const [ref, setRef] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [industry, setIndustry] = useState("");
  const [clientId, setClientId] = useState("");

  // Step 2
  const [websiteType, setWebsiteType] = useState("");
  const recommended = useMemo(() => suggestPages(industry, websiteType), [industry, websiteType]);
  const [pages, setPages] = useState<string[]>([]);
  const [customPage, setCustomPage] = useState("");
  // Chip universe = recommended + common + any custom already added.
  const chips = useMemo(() => [...new Set([...recommended, ...EXTRA_PAGES, ...pages])], [recommended, pages]);

  const goToPages = () => {
    setPages(recommended);           // pre-select the recommended set
    setStep(2);
  };
  const togglePage = (p: string) => setPages((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  const addCustom = () => {
    const p = customPage.trim();
    if (p && !pages.includes(p)) setPages((prev) => [...prev, p]);
    setCustomPage("");
  };

  const submit = () => {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("businessName", name);
    if (businessType) fd.set("businessType", businessType);
    if (industry) fd.set("industry", industry);
    if (clientId) fd.set("businessId", clientId);
    if (start === "reference" && ref.trim()) fd.set("mainReferenceUrl", ref.trim());
    if (websiteType) fd.set("websiteType", websiteType);
    if (pages.length) { fd.set("keyItems", pages.join(", ")); fd.set("pageCount", String(pages.length)); }
    const feats = suggestFeatures(industry, websiteType);
    if (feats.length) fd.set("features", feats.join(", "));
    setPending(true);
    startTransition(() => formAction(fd));
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        {step === 1 ? (
          <>
            <label className="block text-[13px] font-semibold text-ink">Project name <span className="text-accent">*</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="e.g. Simba Car Hire — new website" className={`mt-1.5 ${INPUT}`} />
            </label>

            <div className="mt-6">
              <p className="text-[13px] font-semibold text-ink">How should we start?</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStart("reference")} className={`rounded-xl border p-3 text-left transition-colors ${start === "reference" ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}>
                  <span className="block text-[13px] font-semibold text-ink">Learn from a site</span>
                  <span className="mt-0.5 block text-[11.5px] text-muted">We extract the brand, colours & layout.</span>
                </button>
                <button type="button" onClick={() => setStart("blank")} className={`rounded-xl border p-3 text-left transition-colors ${start === "blank" ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong"}`}>
                  <span className="block text-[13px] font-semibold text-ink">Start blank</span>
                  <span className="mt-0.5 block text-[11.5px] text-muted">Build from the section library.</span>
                </button>
              </div>
              {start === "reference" && (
                <div className="mt-3">
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <input value={ref} onChange={(e) => setRef(e.target.value)} type="url" placeholder="https://a-site-you-like.com" className={`${INPUT} pl-9`} />
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-muted">We recreate its structure & style with original content and placeholder media — never copying images or text.</p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <p className="text-[13px] font-semibold text-ink">Business details <span className="font-normal text-faint">(optional)</span></p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-[12px] font-medium text-muted">Business type
                  <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. Car rental, restaurant" className={`mt-1 ${INPUT}`} />
                </label>
                <label className="text-[12px] font-medium text-muted">Industry
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={`mt-1 ${INPUT}`}>
                    <option value="">Select…</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </label>
                {clients.length > 0 && (
                  <label className="text-[12px] font-medium text-muted">Link to client
                    <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={`mt-1 ${INPUT}`}>
                      <option value="">No client link</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </label>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button size="lg" onClick={goToPages} disabled={!name.trim()}>Continue</Button>
            </div>
          </>
        ) : (
          <>
            <label className="block text-[13px] font-semibold text-ink">Website type
              <select value={websiteType} onChange={(e) => setWebsiteType(e.target.value)} className={`mt-1.5 ${INPUT}`}>
                <option value="">Choose a type…</option>
                {WEBSITE_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
            <p className="mt-1.5 text-[11.5px] text-muted">Pick a type and we pre-select the right pages. You can add or remove any.</p>

            <div className="mt-5">
              <p className="text-[13px] font-semibold text-ink">Pages <span className="font-normal text-muted">({pages.length} selected)</span></p>
              <div className="mt-2 flex flex-wrap gap-2">
                {chips.map((p) => {
                  const on = pages.includes(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePage(p)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-muted hover:text-ink"}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">{on
                        ? <path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        : <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}</svg>
                      {p}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input value={customPage} onChange={(e) => setCustomPage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Add another page…" className={INPUT} />
                <Button variant="secondary" onClick={addCustom} disabled={!customPage.trim()}>Add</Button>
              </div>
            </div>

            {state?.error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] text-danger">{state.error}</p>}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
              <Button size="lg" onClick={submit} disabled={pending} className="min-w-[160px]">
                {pending ? (start === "reference" && ref.trim() ? "Analyzing site…" : "Creating…") : "Create website"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
