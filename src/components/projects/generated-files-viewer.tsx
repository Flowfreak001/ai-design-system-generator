"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type ViewerFile = {
  id: string;
  name: string;
  type: string;
  content: string;
  _count: { versions: number };
};

const TYPE_BADGE: Record<string, string> = {
  markdown: "bg-accent-soft text-accent",
  prompt: "bg-info-soft text-info",
  json: "bg-warning-soft text-warning",
};

export function GeneratedFilesViewer({ files }: { files: ViewerFile[] }) {
  const [activeId, setActiveId] = useState(files[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const active = files.find((f) => f.id === activeId) ?? files[0];

  if (files.length === 0) {
    return (
      <div className="card flex flex-col items-center p-12 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-panel text-muted">📄</span>
        <p className="mt-4 text-sm font-medium text-ink">No files yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Run <span className="text-ink">Analyze website</span> for grounded data, then{" "}
          <span className="text-ink">Generate MD Files</span> to produce the design system.
        </p>
      </div>
    );
  }

  const copy = async () => {
    await navigator.clipboard?.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([active.content], {
      type: active.name.endsWith(".json") ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = active.name;
    el.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[250px_1fr]">
      <ul className="card h-fit max-h-[600px] overflow-y-auto p-2">
        {files.map((f) => {
          const on = f.id === active.id;
          return (
            <li key={f.id}>
              <button
                onClick={() => setActiveId(f.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors duration-200 ${
                  on ? "bg-accent-soft text-accent" : "text-muted hover:bg-panel hover:text-ink"
                }`}
              >
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-[10px] text-faint">v{f._count.versions}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="card min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-xs text-ink">{active.name}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                TYPE_BADGE[active.type] ?? "bg-panel text-muted"
              }`}
            >
              {active.type}
            </span>
            <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 font-mono text-[10px] text-faint">
              v{active._count.versions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copy}
              className="cursor-pointer font-mono text-[11px] text-faint transition-colors hover:text-ink"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <button
              onClick={download}
              className="cursor-pointer font-mono text-[11px] text-faint transition-colors hover:text-ink"
            >
              Download
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.pre
            key={active.id}
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[600px] overflow-auto p-5 font-mono text-[12.5px] leading-relaxed text-body whitespace-pre-wrap"
          >
            {active.content}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}
