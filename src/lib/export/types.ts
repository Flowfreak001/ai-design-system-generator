// Export system — shared types. Pure TS (no React) so both the editor UI and
// server generators can import. The approved/edited Design Canvas is the
// single source of truth for everything generated here.

import type { CanvasPage, StyleGuideCanvas } from "@/lib/canvas";

/** Everything the export modules need, resolved once by the caller. */
export interface ExportContext {
  projectName: string;
  businessName?: string;
  websiteType?: string;
  industry?: string;
  audience?: string;
  goals?: string[];
  /** Final edited canvas pages (live editor state or saved SITEMAP_CANVAS). */
  pages: CanvasPage[];
  /** Approved style guide (falls back to sensible defaults when missing). */
  style?: StyleGuideCanvas | null;
  designApproved: boolean;
}

export type ExportStatus = "current" | "outdated" | "draft" | "missing-data" | "failed";

export interface ExportWarning {
  level: "error" | "warning";
  message: string;
}

export interface PromptFile {
  filename: string;
  title: string;
  content: string;
  tokens: number;
}
