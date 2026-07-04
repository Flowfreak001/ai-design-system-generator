"use client";

// Project Overview hero. With a full Design Editor doing sitemap → wireframe →
// style → design in one place, the user only needs ONE clear action: open the
// editor (and later, export). Everything else (evidence, brand, per-stage
// approvals) runs behind the scenes and stays available under "All steps".

import { useState, type ReactNode } from "react";
import { LinkButton } from "@/components/ui/button";
import type { ComputedStage, StageId } from "@/lib/pipeline";

const DESIGN_STAGES: StageId[] = ["sitemap", "wireframe", "style", "design"];

export function SimpleSteps({ stages, editorHref, children }: {
  stages: ComputedStage[];
  editorHref: string;
  children: ReactNode; // the full detailed pipeline (advanced view)
}) {
  const [showAll, setShowAll] = useState(false);
  const byId = new Map(stages.map((s) => [s.id, s]));
  const isDone = (id: StageId) => byId.get(id)?.complete ?? false;

  const setupReady = isDone("evidence") && isDone("brand");
  const designReady = DESIGN_STAGES.every(isDone);
  const exported = isDone("export");

  const chips: { label: string; done: boolean }[] = [
    { label: "Setup", done: setupReady },
    { label: "Design", done: designReady },
    { label: "Export", done: isDone("files") || exported },
  ];

  const headline = !designReady
    ? "Let's build your website design"
    : "Your website design is ready";
  const sub = !designReady
    ? "Open the editor to generate your pages, then edit every section, text, image and style in one place."
    : "Keep editing in the design editor, or grab your build-ready files and prompts.";

  return (
    <div className="grid gap-4">
      {/* Single hero — the one thing to do next. */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-soft/50 blur-2xl" aria-hidden="true" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".5" /></svg>
            Design workspace
          </span>
          <h2 className="mt-3 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink">{headline}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{sub}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <LinkButton href={editorHref} size="lg">✦ Open Design Editor</LinkButton>
            {designReady && (
              <a href="#export" className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-body transition-colors hover:border-line-strong hover:text-ink">
                Get build files
              </a>
            )}
          </div>

          {/* Slim, informational status — not steps to click through. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
            {chips.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-faint">·</span>}
                <span className={`grid h-4 w-4 place-items-center rounded-full ${c.done ? "bg-success text-white" : "bg-panel text-faint"}`}>
                  {c.done ? (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : <span className="h-1 w-1 rounded-full bg-faint" />}
                </span>
                <span className={c.done ? "font-medium text-body" : "text-faint"}>{c.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full pipeline, tucked away — every detailed action lives here unchanged. */}
      <div>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
        >
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">All steps &amp; details</span>
            <span className="block text-[12px] text-muted">Evidence, brand, per-stage approvals and generated files — for when you need them.</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`shrink-0 text-faint transition-transform ${showAll ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {showAll && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
