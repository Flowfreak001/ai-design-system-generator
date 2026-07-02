"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type ViewerFile = {
  id: string;
  name: string;
  content: string;
  _count: { versions: number };
};

export function GeneratedFilesViewer({ files }: { files: ViewerFile[] }) {
  const [activeId, setActiveId] = useState(files[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const active = files.find((f) => f.id === activeId) ?? files[0];

  if (files.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-muted">
          No files yet — run <span className="text-ink">Generate files</span> to
          produce the delivery documents for this project type.
        </p>
      </div>
    );
  }

  const copy = async () => {
    await navigator.clipboard?.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <ul className="card h-fit p-2">
        {files.map((f) => {
          const on = f.id === active.id;
          return (
            <li key={f.id}>
              <button
                onClick={() => setActiveId(f.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors duration-200 ${
                  on ? "bg-brand/15 text-brand" : "text-muted hover:bg-white/[0.04] hover:text-ink"
                }`}
              >
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-[10px] text-faint">
                  v{f._count.versions}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="card min-w-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-xs text-ink">{active.name}</span>
          <button
            onClick={copy}
            className="cursor-pointer font-mono text-[11px] text-faint transition-colors hover:text-ink"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.pre
            key={active.id}
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[560px] overflow-auto p-5 font-mono text-[12.5px] leading-relaxed text-muted whitespace-pre-wrap"
          >
            {active.content}
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
}
