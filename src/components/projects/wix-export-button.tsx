"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { exportWixSiteAction } from "@/app/(app)/projects/[id]/wix-actions";

/** Generates + downloads a runnable Next.js + Wix SDK headless-site starter. */
export function WixExportButton({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = () =>
    start(async () => {
      const res = await exportWixSiteAction(projectId);
      if (!res.ok) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      // Trigger a browser download of the generated starter bundle.
      const blob = new Blob([res.bundle], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg({ ok: true, text: `Downloaded starter (${res.fileCount} files) ✓` });
    });

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" disabled={pending} onClick={run} title="Generate a Next.js + Wix SDK site that renders this project from the Wix CMS">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="-ml-0.5" aria-hidden="true">
          <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {pending ? "Generating…" : "Get Wix site"}
      </Button>
      {msg && (
        <span className={`text-[12px] ${msg.ok ? "text-success" : "text-danger"}`} role="status">
          {msg.text}
        </span>
      )}
    </div>
  );
}
