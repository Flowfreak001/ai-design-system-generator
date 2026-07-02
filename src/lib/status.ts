// Derived project status + recommended next action. Status is computed from
// what actually exists (files, preview, export mark) rather than stored flags,
// so it can never drift from reality.

import type { DerivedStatus } from "@/types";

export type StatusInput = {
  status: string; // Prisma ProjectStatus — DELIVERED marks "Exported"
  files: { name: string; type: string }[];
  hasReferenceUrls: boolean;
};

const MD_SET = new Set(["BRAND.md", "DESIGN.md", "CONTENT.md", "COMPONENTS.md"]);

export function deriveStatus(p: StatusInput): DerivedStatus {
  if (p.status === "DELIVERED") return "Exported";
  const hasPreview = p.files.some((f) => f.name === "preview.html");
  if (hasPreview) return "Preview Ready";
  const hasMd = p.files.some((f) => MD_SET.has(f.name));
  const hasAny = p.files.length > 0;
  if (hasMd || hasAny) return "Files Generated";
  return p.hasReferenceUrls ? "Ready to Generate" : "Draft";
}

export const STATUS_STYLES: Record<DerivedStatus, string> = {
  Draft: "bg-panel text-muted border-line",
  "Ready to Generate": "bg-info-soft text-info border-info/25",
  "Files Generated": "bg-accent-soft text-accent border-accent/25",
  "Preview Ready": "bg-warning-soft text-warning border-warning/25",
  Exported: "bg-success-soft text-success border-success/25",
};

export type NextAction = {
  title: string;
  description: string;
  action: "generate-md" | "generate-preview" | "export" | "add-references";
};

export function recommendedNextAction(p: StatusInput): NextAction {
  const status = deriveStatus(p);
  if (status === "Draft" || status === "Ready to Generate") {
    return {
      title: "Generate your first MD files",
      description: p.hasReferenceUrls
        ? "Your inputs and reference URLs are enough — the system marks any gaps as assumptions."
        : "Your inputs are enough to start. Adding a reference website later improves design accuracy.",
      action: "generate-md",
    };
  }
  if (status === "Files Generated") {
    return {
      title: "Generate visual preview",
      description: "Render the design system as a visual sheet you can review with the client.",
      action: "generate-preview",
    };
  }
  return {
    title: "Export the design system",
    description: "Download the full package — brief, analysis, design system, prompts, and preview.",
    action: "export",
  };
}
