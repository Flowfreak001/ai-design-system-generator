"use client";

// Universal Prompt Export modal — pick a target tool + output format + scope,
// preview the generated prompt, and copy it. The prompt recreates structure +
// responsive behavior with original copy and placeholder media (never copies
// images/logos/text).

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SectionTheme } from "@/components/sections/types";
import type { LibrarySection } from "@/lib/section-library/manual-sections";
import {
  buildExportPrompt, defaultFormatForTool, EXPORT_TOOLS, EXPORT_FORMATS, EXPORT_NOTE,
  type ExportTool, type ExportFormat,
} from "@/lib/section-library/prompt-export";

const SELECT = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-accent";

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

export function ExportModal({
  section, theme, onClose,
}: {
  section: LibrarySection; theme: SectionTheme; onClose: () => void;
}) {
  const [tool, setTool] = useState<ExportTool>("any");
  const [format, setFormat] = useState<ExportFormat>("universal");
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildExportPrompt(section, theme, { tool, format, scope: "section" }), [section, theme, tool, format]);

  const onTool = (t: ExportTool) => { setTool(t); setFormat(defaultFormatForTool(t)); };
  const copy = async () => {
    if (await copyText(prompt)) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header. */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-ink">Export prompt — {section.name}</h3>
            <p className="truncate text-[12px] text-muted">Copy one prompt into any AI coding tool to rebuild this design.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Options. */}
        <div className="grid gap-3 border-b border-line px-5 py-4 sm:grid-cols-2">
          <label className="text-[11px] font-medium text-muted">Export prompt for
            <select value={tool} onChange={(e) => onTool(e.target.value as ExportTool)} className={SELECT}>
              {EXPORT_TOOLS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-medium text-muted">Output format
            <select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)} disabled={tool === "studio" || tool === "html"} className={SELECT}>
              {EXPORT_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </label>
        </div>

        {/* Prompt preview. */}
        <div className="min-h-0 flex-1 overflow-auto bg-panel/40 p-4">
          <pre className="whitespace-pre-wrap break-words rounded-xl border border-line bg-surface p-4 font-mono text-[11.5px] leading-relaxed text-ink">{prompt}</pre>
        </div>

        {/* Footer: note + copy. */}
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
          <p className="max-w-md text-[11.5px] leading-relaxed text-muted">{EXPORT_NOTE}</p>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={copy}>
              {copied ? (
                <><svg className="-ml-0.5 text-success" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4 4 10-10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied</>
              ) : (
                <><svg className="-ml-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>Copy prompt</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
