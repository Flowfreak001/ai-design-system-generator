"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { publishToWixAction, type WixPublishResult } from "@/app/(app)/projects/[id]/wix-actions";

/** Smoke-test button: pushes a project item into the connected Wix CMS collection. */
export function WixPublishButton({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<WixPublishResult | null>(null);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => start(async () => setResult(await publishToWixAction(projectId)))}
        title="Push this project into your Wix CMS (test)"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="-ml-0.5" aria-hidden="true">
          <path d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {pending ? "Publishing…" : "Publish to Wix (test)"}
      </Button>
      {result && (
        <span className={`text-[12px] ${result.ok ? "text-success" : "text-danger"}`} role="status">
          {result.ok ? `Added to “${result.collectionId}” ✓` : result.error}
        </span>
      )}
    </div>
  );
}
