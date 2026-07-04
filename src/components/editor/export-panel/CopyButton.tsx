"use client";

// Copy-to-clipboard button with a "Copied to clipboard." toast state, plus a
// small download variant for prompt-pack files. UI only — no export logic.

import { useState } from "react";

export function CopyButton({ getText, label = "Copy", primary }: { getText: () => string; label?: string; primary?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button type="button" onClick={copy}
      className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${primary ? "bg-accent text-white hover:bg-accent-hover" : "border border-line text-body hover:bg-panel"}`}>
      {copied ? "Copied to clipboard ✓" : label}
    </button>
  );
}

export function DownloadButton({ filename, getText }: { filename: string; getText: () => string }) {
  const download = () => {
    const blob = new Blob([getText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" onClick={download} className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-body hover:bg-panel">
      Download
    </button>
  );
}
