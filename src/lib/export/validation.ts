// Pre-export validation — clear warnings + safe fallbacks, never silent staleness.

import type { ExportContext, ExportStatus, ExportWarning } from "./types";
import { sectionKind } from "@/lib/sections";

export function validateExportData(ctx: ExportContext): ExportWarning[] {
  const warnings: ExportWarning[] = [];
  if (ctx.pages.length === 0) warnings.push({ level: "error", message: "No pages in the Design Canvas — build the sitemap/wireframe first." });
  for (const p of ctx.pages) {
    if (p.sections.length === 0) warnings.push({ level: "warning", message: `Page “${p.name}” has no sections.` });
    for (const s of p.sections) {
      if (!s.name.trim()) warnings.push({ level: "warning", message: `A section on “${p.name}” has no name.` });
      if (sectionKind(s.name) === "generic") warnings.push({ level: "warning", message: `“${s.name}” (${p.name}) maps to a generic component — consider a more specific section name.` });
    }
  }
  if (!ctx.style || (ctx.style.colors ?? []).length === 0) warnings.push({ level: "warning", message: "No approved style guide colors — exports fall back to assumed defaults." });
  if (!ctx.designApproved) warnings.push({ level: "warning", message: "Design is not approved yet — exports use the current draft." });
  return warnings;
}

export function exportStatus(ctx: ExportContext, dirtyOrOutdated: boolean): ExportStatus {
  if (ctx.pages.length === 0) return "missing-data";
  if (!ctx.designApproved) return "draft";
  if (dirtyOrOutdated) return "outdated";
  return "current";
}
