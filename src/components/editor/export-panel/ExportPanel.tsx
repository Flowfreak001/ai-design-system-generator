"use client";

// Export panel — copy-ready build prompts from the FINAL edited Design Canvas.
// Tabs: Overview / Section / Page / Full Site / Claude Code / Replit / Lovable /
// React JSON / Prompt Pack. All generation lives in lib/export (pure modules);
// this component only selects, previews, copies and downloads.

import { useMemo, useState } from "react";
import type { ExportContext } from "@/lib/export/types";
import { generateSectionPrompt, generateSectionJson } from "@/lib/export/export-section";
import { generatePagePrompt, generatePageJson } from "@/lib/export/export-page";
import { generateFullSitePrompt } from "@/lib/export/export-full-site";
import { generateClaudeCodePrompt } from "@/lib/export/export-claude-code-prompt";
import { generateReplitPrompt } from "@/lib/export/export-replit-prompt";
import { generateLovablePrompt } from "@/lib/export/export-lovable-prompt";
import { generateReactPlanJson } from "@/lib/export/export-react-plan";
import { generatePromptPack } from "@/lib/export/export-prompt-pack";
import { validateExportData, exportStatus } from "@/lib/export/validation";
import { estimateTokens, formatTokens, isLargePrompt } from "@/lib/export/token-estimator";
import { CopyButton, DownloadButton } from "./CopyButton";

type TabId = "overview" | "section" | "page" | "site" | "claude" | "replit" | "lovable" | "json" | "pack";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "section", label: "Section Prompt" },
  { id: "page", label: "Page Prompt" },
  { id: "site", label: "Full Site" },
  { id: "claude", label: "Claude Code" },
  { id: "replit", label: "Replit" },
  { id: "lovable", label: "Lovable" },
  { id: "json", label: "React JSON" },
  { id: "pack", label: "Prompt Pack" },
];

const STATUS_STYLE: Record<string, string> = {
  current: "bg-success-soft text-success",
  outdated: "bg-warning-soft text-warning",
  draft: "bg-panel text-muted",
  "missing-data": "bg-danger-soft text-danger",
  failed: "bg-danger-soft text-danger",
};

function Preview({ text }: { text: string }) {
  return (
    <pre className="max-h-[46vh] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-panel/50 p-3 text-[11px] leading-relaxed text-body">
      {text.length > 6000 ? text.slice(0, 6000) + "\n\n… (truncated preview — Copy includes the full prompt)" : text}
    </pre>
  );
}

function SizeRow({ text }: { text: string }) {
  const large = isLargePrompt(text);
  return (
    <div className="flex items-center gap-2 text-[11.5px]">
      <span className="text-faint">{formatTokens(estimateTokens(text))}</span>
      {large && <span className="rounded-full bg-warning-soft px-2 py-0.5 font-medium text-warning">This prompt is large — for best results use the Prompt Pack.</span>}
    </div>
  );
}

export function ExportPanel({ ctx, outdated }: { ctx: ExportContext; outdated: boolean }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [pageId, setPageId] = useState<string>(ctx.pages[0]?.id ?? "");
  const [sectionId, setSectionId] = useState<string>("");

  const page = ctx.pages.find((p) => p.id === pageId) ?? ctx.pages[0];
  const section = page?.sections.find((s) => s.id === sectionId) ?? page?.sections[0];
  const warnings = useMemo(() => validateExportData(ctx), [ctx]);
  const status = exportStatus(ctx, outdated);

  // Generated lazily per tab (memoized against canvas identity).
  const sectionPrompt = useMemo(() => (section ? generateSectionPrompt(section, ctx) : ""), [section, ctx]);
  const pagePrompt = useMemo(() => (page ? generatePagePrompt(page, ctx) : ""), [page, ctx]);
  const sitePrompt = useMemo(() => (tab === "site" ? generateFullSitePrompt(ctx) : ""), [tab, ctx]);
  const claudePrompt = useMemo(() => (tab === "claude" ? generateClaudeCodePrompt(ctx) : ""), [tab, ctx]);
  const replitPrompt = useMemo(() => (tab === "replit" ? generateReplitPrompt(ctx) : ""), [tab, ctx]);
  const lovablePrompt = useMemo(() => (tab === "lovable" ? generateLovablePrompt(ctx) : ""), [tab, ctx]);
  const planJson = useMemo(() => (tab === "json" || tab === "overview" ? generateReactPlanJson(ctx) : ""), [tab, ctx]);
  const pack = useMemo(() => (tab === "pack" ? generatePromptPack(ctx) : []), [tab, ctx]);

  const selectCls = "rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px]";

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 pb-2 pt-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors ${tab === t.id ? "bg-accent text-white" : "text-muted hover:bg-panel hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}>{status}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {status === "outdated" && (
          <p className="mb-3 rounded-lg bg-warning-soft px-3 py-2 text-[12px] font-medium text-warning">Generated files are outdated. Regenerate from approved Design — prompts below already use the latest edits.</p>
        )}

        {tab === "overview" && (
          <div className="grid gap-3">
            <p className="text-[13px] leading-relaxed text-body">
              Copy build-ready prompts from your final edited Design Canvas. Use <b>Section</b> for one section, <b>Page</b> for one page, <b>Full Site</b> / <b>Claude Code</b> for everything — or the <b>Prompt Pack</b> for large sites (avoids AI context limits).
            </p>
            <div className="grid gap-1.5">
              {warnings.length === 0 && <p className="text-[12.5px] text-success">✓ Export data looks complete.</p>}
              {warnings.map((w, i) => (
                <p key={i} className={`rounded-lg px-3 py-1.5 text-[12px] ${w.level === "error" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}>{w.message}</p>
              ))}
            </div>
            <div className="rounded-xl border border-line p-3 text-[12px] text-muted">
              {ctx.pages.length} pages · {ctx.pages.reduce((n, p) => n + p.sections.length, 0)} sections · React plan {formatTokens(estimateTokens(planJson))}
            </div>
          </div>
        )}

        {tab === "section" && page && section && (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <select value={page.id} onChange={(e) => { setPageId(e.target.value); setSectionId(""); }} className={selectCls}>
                {ctx.pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={section.id} onChange={(e) => setSectionId(e.target.value)} className={selectCls}>
                {page.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <CopyButton primary label="Copy Section Prompt" getText={() => sectionPrompt} />
              <CopyButton label="Copy Section JSON" getText={() => generateSectionJson(section)} />
            </div>
            <SizeRow text={sectionPrompt} />
            <Preview text={sectionPrompt} />
          </div>
        )}

        {tab === "page" && page && (
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <select value={page.id} onChange={(e) => setPageId(e.target.value)} className={selectCls}>
                {ctx.pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <CopyButton primary label="Copy Page Prompt" getText={() => pagePrompt} />
              <CopyButton label="Copy Page JSON" getText={() => generatePageJson(page)} />
            </div>
            <SizeRow text={pagePrompt} />
            <Preview text={pagePrompt} />
          </div>
        )}

        {tab === "site" && <PromptTab text={sitePrompt} copyLabel="Copy Full Site Prompt" />}
        {tab === "claude" && <PromptTab text={claudePrompt} copyLabel="Copy Claude Code Prompt" />}
        {tab === "replit" && <PromptTab text={replitPrompt} copyLabel="Copy Replit Prompt" />}
        {tab === "lovable" && <PromptTab text={lovablePrompt} copyLabel="Copy Lovable Prompt" />}
        {tab === "json" && <PromptTab text={planJson} copyLabel="Copy React Export JSON" />}

        {tab === "pack" && (
          <div className="grid gap-2">
            <p className="text-[12.5px] text-muted">Split prompt files for large sites — feed them to an AI builder one at a time (see 99_BUILD_INSTRUCTIONS).</p>
            {pack.map((f) => (
              <div key={f.filename} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[12px] font-medium text-ink">{f.filename}</span>
                  <span className="text-[11px] text-faint">{f.title} · {formatTokens(f.tokens)}</span>
                </span>
                <span className="flex shrink-0 gap-1.5">
                  <CopyButton label="Copy" getText={() => f.content} />
                  <DownloadButton filename={f.filename} getText={() => f.content} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PromptTab({ text, copyLabel }: { text: string; copyLabel: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton primary label={copyLabel} getText={() => text} />
        <SizeRow text={text} />
      </div>
      <Preview text={text} />
    </div>
  );
}
