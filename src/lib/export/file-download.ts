// Client-side download/copy helpers (no server round-trip for content the
// browser already has).
"use client";

export function downloadText(filename: string, content: string) {
  const type = filename.endsWith(".json")
    ? "application/json"
    : filename.endsWith(".html")
      ? "text/html"
      : "text/markdown";
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}
