"use client";

// Project Overview hero. With a full Design Editor doing sitemap → wireframe →
// style → design in one place, the user only needs ONE clear action: open the
// editor (and later, export). Everything else (evidence, brand, per-stage
// approvals) runs behind the scenes and stays available under "All steps".

import { useState, type ReactNode } from "react";
import type { ComputedStage } from "@/lib/pipeline";

export function SimpleSteps({ children }: {
  stages?: ComputedStage[];
  editorHref?: string;
  children: ReactNode; // the detailed pipeline (evidence → brand → sitemap)
}) {
  // Collapsed by default — the primary "Open Design Editor" action lives in the
  // workspace header. These crawl/brand/sitemap steps run automatically after
  // onboarding and are only here for users who want to review or re-run them.
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="grid gap-4">
      <div>
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
        >
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Advanced setup <span className="font-normal text-faint">(optional)</span></span>
            <span className="block text-[12px] text-muted">Review or re-run the crawl, brand and sitemap steps. Everything else happens in the Design Editor.</span>
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
