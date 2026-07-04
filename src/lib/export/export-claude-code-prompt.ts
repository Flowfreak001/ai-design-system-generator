// Claude Code prompt — the most detailed developer-ready implementation prompt:
// full site spec plus setup, architecture guidance and an acceptance checklist.

import type { ExportContext } from "./types";
import { generateFullSitePrompt } from "./export-full-site";
import { h1, h2, bullets, numbered } from "./markdown-utils";

export function generateClaudeCodePrompt(ctx: ExportContext): string {
  return (
    h1(`Claude Code Build Prompt — ${ctx.projectName}`) +
    h2("Build Objective") +
    `Implement the complete ${ctx.websiteType ?? "website"} below, exactly as specified by the approved Design Canvas. Every content value is final edited data — treat it as the source of truth.\n` +
    h2("Setup Assumptions") + bullets([
      "Fresh Next.js (App Router) + TypeScript + Tailwind CSS project.",
      "Install: shadcn/ui, lucide-react, framer-motion.",
      "No CMS — content lives in a typed data file (lib/site-data.ts).",
    ]) +
    h2("Modular Architecture (required)") + bullets([
      "Keep files modular. Do not put all sections into one huge file.",
      "layout components (Navbar/Footer) in components/layout/.",
      "one section component per file in components/sections/.",
      "shared ui primitives in components/ui/.",
      "content in lib/site-data.ts; helpers in lib/utils.ts.",
      "Aim for files under ~300 lines.",
    ]) +
    "\n---\n\n" +
    generateFullSitePrompt(ctx) +
    h2("Final Acceptance Checklist") + numbered([
      "Every approved page exists at its exact route.",
      "Every section renders in the specified order with its selected variant.",
      "All copy matches the edited content exactly (no invented text).",
      "Missing images render as grey placeholders (no stock images).",
      "Repeatable items match the final edited order (deleted items absent).",
      "Motion presets implemented and disabled under prefers-reduced-motion.",
      "Responsive behavior verified at desktop / tablet / mobile.",
      "Headings, labels, alt text and focus states meet the accessibility rules.",
      "npm run build passes with no TypeScript errors.",
    ])
  );
}
