"use client";

import { useState } from "react";
import { downloadText, copyText } from "@/lib/export/file-download";

export type ExportFile = { id: string; name: string; type: string; content: string };

const TYPE_BADGE: Record<string, string> = {
  markdown: "bg-accent-soft text-accent",
  prompt: "bg-info-soft text-info",
  json: "bg-warning-soft text-warning",
  html: "bg-success-soft text-success",
};

export function ExportPanel({
  projectId,
  files,
}: {
  projectId: string;
  files: ExportFile[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!files.length) {
    return (
      <div className="card p-10 text-center text-sm text-muted">
        Nothing to export yet — generate files first.
      </div>
    );
  }

  const copy = async (f: ExportFile) => {
    if (await copyText(f.content)) {
      setCopiedId(f.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* File list */}
      <div className="card divide-y divide-line">
        {files.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="truncate font-mono text-xs text-ink">{f.name}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  TYPE_BADGE[f.type] ?? "bg-panel text-muted"
                }`}
              >
                {f.type}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => copy(f)}
                className="cursor-pointer font-mono text-[11px] text-faint transition-colors hover:text-ink"
              >
                {copiedId === f.id ? "Copied ✓" : "Copy"}
              </button>
              <button
                onClick={() => downloadText(f.name, f.content)}
                className="cursor-pointer font-mono text-[11px] text-faint transition-colors hover:text-ink"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Package card */}
      <div className="card h-fit p-5">
        <p className="text-sm font-semibold text-ink">Full package</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Everything zipped in the handoff structure: brief, analysis, design
          system, prompts, and preview.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-panel p-3 font-mono text-[10.5px] leading-relaxed text-muted">
{`…-design-system/
  00_PROJECT_BRIEF/
  01_ANALYSIS/
  02_DESIGN_SYSTEM/
  03_PROMPTS/
  04_PREVIEW/`}
        </pre>
        <a
          href={`/api/projects/${projectId}/export`}
          download
          className="mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[10px] bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Download ZIP
        </a>
        <p className="mt-2 text-center font-mono text-[10px] text-faint">
          {files.length} files · uncompressed archive
        </p>
      </div>
    </div>
  );
}
