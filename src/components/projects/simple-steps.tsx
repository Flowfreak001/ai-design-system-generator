"use client";

// Simplified project journey: the 8 internal pipeline stages grouped into the
// 3 steps a normal user actually thinks in — Setup → Design → Export. The full
// gated pipeline (with all its actions) stays available under "All steps",
// so nothing is lost for power users; this is presentation only.

import { useState, type ReactNode } from "react";
import { LinkButton, Button } from "@/components/ui/button";
import type { ComputedStage, StageId } from "@/lib/pipeline";

type PhaseId = "setup" | "design" | "export";

const PHASES: { id: PhaseId; label: string; description: string; stageIds: StageId[] }[] = [
  { id: "setup", label: "Setup", description: "Brief, reference evidence and brand foundation.", stageIds: ["evidence", "brand"] },
  { id: "design", label: "Design", description: "Pages, sections and styling — all in one editor.", stageIds: ["sitemap", "wireframe", "style", "design"] },
  { id: "export", label: "Export", description: "Generated files and build-ready prompts.", stageIds: ["files", "export"] },
];

export function SimpleSteps({ stages, editorHref, children }: {
  stages: ComputedStage[];
  editorHref: string;
  children: ReactNode; // the full detailed pipeline (advanced view)
}) {
  const [showAll, setShowAll] = useState(false);

  const byId = new Map(stages.map((s) => [s.id, s]));
  const phases = PHASES.map((p) => {
    const own = p.stageIds.map((id) => byId.get(id)).filter(Boolean) as ComputedStage[];
    const complete = own.every((s) => s.complete);
    const doneCount = own.filter((s) => s.complete).length;
    return { ...p, complete, doneCount, total: own.length };
  });
  const activeIdx = phases.findIndex((p) => !p.complete);
  const setupDone = phases[0].complete;

  return (
    <div className="grid gap-4">
      {/* The 3-step journey */}
      <div className="grid gap-3 sm:grid-cols-3">
        {phases.map((p, i) => {
          const state = p.complete ? "done" : i === activeIdx ? "active" : "locked";
          return (
            <div key={p.id} className={`card flex flex-col gap-2.5 p-5 ${state === "active" ? "ring-1 ring-accent" : ""} ${state === "locked" ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <span className={`grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold ${state === "done" ? "bg-success text-white" : state === "active" ? "bg-accent text-white" : "bg-panel text-muted"}`}>
                  {state === "done" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : i + 1}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${state === "done" ? "bg-success-soft text-success" : state === "active" ? "bg-accent-soft text-accent" : "bg-panel text-faint"}`}>
                  {state === "done" ? "done" : state === "active" ? "current" : "next"}
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-ink">{p.label}</h3>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{p.description}</p>
              </div>
              {!p.complete && p.doneCount > 0 && (
                <p className="text-[11px] font-medium text-faint">{p.doneCount} of {p.total} parts done</p>
              )}
              <div className="mt-auto pt-1">
                {p.id === "design" ? (
                  <LinkButton href={editorHref} size="sm" className={`w-full ${state === "active" ? "" : ""}`}>
                    {p.complete ? "Open Design Editor" : setupDone ? "Continue designing" : "Open Design Editor"}
                  </LinkButton>
                ) : state === "active" ? (
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setShowAll(true)}>
                    {p.id === "setup" ? "Continue setup" : "Get your files"}
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full pipeline, tucked away — all detailed actions live here unchanged. */}
      <div>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
        >
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">All steps</span>
            <span className="block text-[12px] text-muted">The full step-by-step pipeline with every action and detail.</span>
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
