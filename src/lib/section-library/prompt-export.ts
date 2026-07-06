// Universal Prompt Export — turns a library section into a copy-paste prompt
// that recreates the SAME layout structure, spacing rhythm, hierarchy,
// interaction pattern, and responsive behavior in ANY AI coding tool, using
// ORIGINAL copy + neutral placeholder media (never copies images/logos/text).
//
// Deliberately structure-first, not pixel-copy: the wording says "recreate the
// same structure…", never "copy exactly".

import type { LibrarySection } from "./manual-sections";
import type { SectionTheme } from "@/components/sections/types";

export type ExportTool = "any" | "lovable" | "replit" | "cursor" | "v0" | "studio" | "html";
export type ExportFormat = "universal" | "tsx" | "tsx-config" | "html-css" | "tailwind-shadcn";
export type ExportScope = "section" | "page";

export const EXPORT_TOOLS: { id: ExportTool; label: string }[] = [
  { id: "any", label: "Any AI coding tool" },
  { id: "lovable", label: "Lovable" },
  { id: "replit", label: "Replit" },
  { id: "cursor", label: "Cursor / Codex" },
  { id: "v0", label: "v0 / shadcn" },
  { id: "studio", label: "Our Section Studio" },
  { id: "html", label: "HTML / CSS" },
];

export const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "universal", label: "Universal prompt" },
  { id: "tsx", label: "React / TSX" },
  { id: "tsx-config", label: "React / TSX + config" },
  { id: "tailwind-shadcn", label: "Tailwind / shadcn" },
  { id: "html-css", label: "HTML / CSS" },
];

/** A sensible default output format for a chosen target tool. */
export function defaultFormatForTool(tool: ExportTool): ExportFormat {
  switch (tool) {
    case "v0": return "tailwind-shadcn";
    case "html": return "html-css";
    case "studio": return "tsx";
    default: return "universal";
  }
}

export const EXPORT_NOTE =
  "Prompts recreate structure and responsive behavior using original content and placeholder media. They do not copy images, logos, text, or brand assets.";

// ── Blocks ─────────────────────────────────────────────────────────────────

const TARGET: Record<ExportTool, string> = {
  any: "Any AI coding assistant. Use the most idiomatic stack for the chosen output format below.",
  lovable: "Lovable — React + TypeScript + Tailwind CSS (Vite, shadcn/ui).",
  replit: "Replit (Agent) — React + TypeScript for the UI. Tailwind is fine if the project uses it.",
  cursor: "Cursor / Codex — React + TypeScript.",
  v0: "v0 (Vercel) — React + Next.js + Tailwind CSS + shadcn/ui.",
  studio: "Our Section Studio — a sandboxed React renderer that runs a single default-export component.",
  html: "A static site — plain HTML + CSS, no framework.",
};

/** One-line format summary shown at the TOP of the prompt so switching the
 *  output format visibly changes the prompt (not just the DELIVERABLE block). */
const FORMAT_SUMMARY: Record<ExportFormat | "studio", string> = {
  universal: "Build it in the target tool's default stack (see DELIVERABLE).",
  tsx: "A single self-contained React / TSX component (default export, no props).",
  "tsx-config": "A React / TSX component plus a typed config object holding all copy.",
  "tailwind-shadcn": "A React component styled with Tailwind CSS, shadcn/ui-compatible.",
  "html-css": "Static HTML + CSS only — no React, no framework.",
  studio: "A single sandbox-ready React component with scoped CSS (see DELIVERABLE).",
};

const ORIGINALITY = [
  "ORIGINALITY & COPYRIGHT (required):",
  "- Recreate the same layout structure, spacing rhythm, visual hierarchy, interaction pattern, and responsive behavior — do NOT copy the design pixel-for-pixel.",
  "- Write your own ORIGINAL placeholder copy in the same tone and length; do not reuse the reference text verbatim.",
  "- Use abstract / neutral placeholder media (solid or subtly patterned blocks with a simple icon). No external image URLs. No stock photos.",
  "- Never copy logos, brand marks, screenshots, or any copyrighted assets.",
].join("\n");

const RESPONSIVE = [
  "RESPONSIVE BEHAVIOR (required):",
  "- Fully responsive, mobile-first.",
  "- Multi-column layouts collapse to a single stacked column on small screens.",
  "- No horizontal overflow at any width; media and grids shrink to fit.",
  "- Scale type, spacing, and paddings down on smaller screens.",
].join("\n");

function contentSpec(s: LibrarySection): string {
  const dc = s.defaultContent ?? {};
  const lines: string[] = [];
  if (dc.eyebrow) lines.push(`- Eyebrow / kicker: "${dc.eyebrow}"`);
  if (dc.title) lines.push(`- Heading: "${dc.title}"`);
  if (dc.subtitle) lines.push(`- Subheading: "${dc.subtitle}"`);
  if (dc.description) lines.push(`- Body copy: "${dc.description}"`);
  if (dc.primaryButtonLabel) lines.push(`- Primary button: "${dc.primaryButtonLabel}"`);
  if (dc.secondaryButtonLabel) lines.push(`- Secondary button: "${dc.secondaryButtonLabel}"`);
  if (dc.items?.length) {
    lines.push(`- Repeated items (${dc.items.length}):`);
    dc.items.forEach((it, i) => lines.push(`    ${i + 1}. "${it.title ?? ""}" — "${it.text ?? ""}"`));
  }
  return lines.length ? lines.join("\n") : "- (no preset content — invent sensible original copy for this section type)";
}

function themeBlock(theme: SectionTheme): string {
  return [
    "THEME TOKENS (use these values; adapt to the target's theming):",
    `- accent: ${theme.accentColor}`,
    `- background: ${theme.backgroundColor}`,
    `- surface: ${theme.surfaceColor}`,
    `- text: ${theme.textColor}`,
    `- muted text: ${theme.mutedTextColor}`,
    `- border: ${theme.borderColor}`,
    `- radius: ${theme.radius}`,
    `- heading font: ${theme.headingFont}`,
    `- body font: ${theme.bodyFont}`,
  ].join("\n");
}

const MEDIA = [
  "MEDIA PLACEHOLDER RULES:",
  "- Every image is a neutral placeholder block (subtle background + centered icon + tiny caption).",
  "- No external image URLs, no <img src> to remote hosts, no logos.",
  "- Keep aspect ratios sensible (e.g. 4:3 on desktop, 16:9 when stacked).",
].join("\n");

function deliverableBlock(format: ExportFormat, tool: ExportTool): string {
  if (tool === "studio") {
    return [
      "DELIVERABLE (Section Studio component):",
      "- A single default-export React component with NO props.",
      "- NO external dependencies (only React; framer-motion is allowed).",
      "- Scoped CSS INSIDE the component using a unique class prefix (e.g. `.sx-<name>-…`) or inline styles — must not leak globally.",
      "- Accessible, semantic HTML.",
      "- Responsive to its OWN container width (use a ResizeObserver or container query) so it works inside preview frames of any width.",
      "- Return ONLY the final component code, no explanation.",
    ].join("\n");
  }
  switch (format) {
    case "universal":
      return [
        "DELIVERABLE (universal):",
        "- Build the section/page in the target tool's default stack.",
        "- Keep it responsive and self-contained; no required external data.",
      ].join("\n");
    case "tsx":
      return [
        "DELIVERABLE (React / TSX):",
        "- A single self-contained React component: default export, NO required props, values hardcoded.",
        "- Inline styles or CSS modules; no external UI libraries.",
        "- Return ONLY the final code, no explanation.",
      ].join("\n");
    case "tsx-config":
      return [
        "DELIVERABLE (React / TSX + config):",
        "- (1) A typed `config` (or `content`) object holding all copy and repeated items.",
        "- (2) A React component (default export) that renders from that object.",
        "- Inline styles or CSS modules; no external UI libraries.",
        "- Return ONLY the final code, no explanation.",
      ].join("\n");
    case "tailwind-shadcn":
      return [
        "DELIVERABLE (Tailwind / shadcn):",
        "- A React component styled with Tailwind CSS classes, shadcn/ui-compatible structure.",
        "- Put any reusable UI primitives under `/components/ui`.",
        "- Clearly list any dependencies to install.",
        "- Return ONLY the final code, no explanation.",
      ].join("\n");
    case "html-css":
      return [
        "DELIVERABLE (HTML / CSS):",
        "- A single `index.html` plus `styles.css` (or one HTML file with a <style> block). NO React.",
        "- No external images; use CSS/inline SVG placeholders.",
        "- Responsive with CSS media queries; single-column stacking on mobile.",
        "- Return ONLY the final code, no explanation.",
      ].join("\n");
  }
}

/** Assemble the full export prompt. */
export function buildExportPrompt(
  section: LibrarySection,
  theme: SectionTheme,
  opts: { tool: ExportTool; format: ExportFormat; scope: ExportScope },
): string {
  const { tool, format, scope } = opts;
  const kind = scope === "page" ? "full web page" : "website section";
  const isHtmlRef = section.codeMode === "html";
  const code = (section.componentCode ?? "").trim();
  const fence = "```";

  const parts: string[] = [];

  parts.push(
    `ROLE: You are a senior front-end engineer and product designer. Recreate the ${kind} specified below as clean, production-quality, responsive code.`,
  );
  parts.push(`OUTPUT TARGET: ${TARGET[tool]}`);
  parts.push(`OUTPUT FORMAT: ${FORMAT_SUMMARY[tool === "studio" ? "studio" : format]}`);
  parts.push(ORIGINALITY);
  parts.push(RESPONSIVE);

  // Layout structure
  parts.push(
    [
      "LAYOUT STRUCTURE:",
      `- Section type: ${section.name} (${section.category} · ${section.layoutType}).`,
      scope === "page"
        ? "- Compose a full page: a top navigation bar (logo + placeholder links + CTA), this section as the primary content, and a footer (placeholder columns). Keep the same visual rhythm across all."
        : "- Reproduce the section's grid/stack, alignment, max-width container, and spacing rhythm.",
    ].join("\n"),
  );

  // Component anatomy (derived from content)
  parts.push(["COMPONENT ANATOMY (regions to build):", contentSpec(section)].join("\n"));

  // Interaction behavior
  parts.push(
    [
      "INTERACTION BEHAVIOR:",
      "- Reproduce any expand/collapse, tabs, hover, or carousel behavior shown in the reference implementation (open one item at a time for accordions, etc.).",
      "- Interactions must be keyboard accessible and honor prefers-reduced-motion.",
    ].join("\n"),
  );

  parts.push(themeBlock(theme));
  parts.push(MEDIA);
  parts.push(deliverableBlock(format, tool));

  parts.push(
    [
      `REFERENCE IMPLEMENTATION (structure & interactions to match — it currently takes { content, theme } props; treat it as the STRUCTURE spec, rewrite copy as original, inline values):`,
      `${fence}${isHtmlRef ? "html" : "tsx"}`,
      code || "// (no reference code available — build from the anatomy + layout notes above)",
      fence,
    ].join("\n"),
  );

  return parts.join("\n\n");
}
