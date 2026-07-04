// Prompt Pack — split export for large sites so no single prompt overflows an
// AI builder's context window. One file per page + overview/style/globals/
// build-instructions + the React plan JSON.

import type { ExportContext, PromptFile } from "./types";
import { exportPageToPlan } from "@/lib/section-editor/export-section";
import { generatePagePrompt } from "./export-page";
import { generateReactPlanJson } from "./export-react-plan";
import { styleGuideMarkdown } from "./export-style-guide";
import { siteArchitecture, routeFor } from "./export-full-site";
import { estimateTokens } from "./token-estimator";
import { h1, h2, bullets, numbered, jsonBlock, slugify } from "./markdown-utils";

const file = (filename: string, title: string, content: string): PromptFile =>
  ({ filename, title, content, tokens: estimateTokens(content) });

export function generatePromptPack(ctx: ExportContext): PromptFile[] {
  const files: PromptFile[] = [];

  files.push(file("00_PROJECT_OVERVIEW.md", "Project Overview",
    h1(`Project Overview — ${ctx.projectName}`) +
    bullets([
      `Business: ${ctx.businessName ?? ctx.projectName}`,
      `Website type: ${ctx.websiteType ?? "website"}`,
      ctx.industry ? `Industry: ${ctx.industry}` : undefined,
      `Primary goal: ${ctx.goals?.[0] ?? "convert visitors"}`,
      ctx.audience ? `Audience: ${ctx.audience}` : undefined,
    ]) +
    h2("Site Architecture") + jsonBlock(siteArchitecture(ctx)) +
    h2("Stack") + bullets(["Next.js App Router + TypeScript + Tailwind CSS", "shadcn/ui, lucide-react, framer-motion (only where specified)"])));

  files.push(file("01_STYLE_GUIDE.md", "Style Guide",
    h1("Style Guide") + styleGuideMarkdown(ctx.style)));

  const globals = ctx.pages.flatMap((p) => exportPageToPlan(p).sections).filter((s) => s.global || s.kind === "navbar" || s.kind === "footer");
  const seen = new Set<string>();
  const uniqueGlobals = globals.filter((s) => !seen.has(s.kind) && seen.add(s.kind));
  files.push(file("02_GLOBAL_COMPONENTS.md", "Global Components",
    h1("Global Components") +
    (uniqueGlobals.length
      ? uniqueGlobals.map((s) => h2(`${s.name} (${s.component})`) + jsonBlock({ content: s.content, layout: s.layout, motion: s.motion })).join("")
      : "No global components defined — add a Navbar and Footer with standard behavior.\n")));

  ctx.pages.forEach((p, i) => {
    files.push(file(`${String(i + 3).padStart(2, "0")}_PAGE_${slugify(p.name).toUpperCase().replace(/-/g, "_")}.md`, `Page: ${p.name}`, generatePagePrompt(p, ctx)));
  });

  files.push(file("99_BUILD_INSTRUCTIONS.md", "Build Instructions",
    h1("Build Instructions") +
    h2("How to use this pack") + numbered([
      "Start a fresh Next.js + TypeScript + Tailwind project.",
      "Give the AI builder 00_PROJECT_OVERVIEW.md + 01_STYLE_GUIDE.md first (project setup + tokens).",
      "Then 02_GLOBAL_COMPONENTS.md (Navbar/Footer shared across pages).",
      "Then one PAGE file at a time, in order — never paste all pages at once.",
      "Finish by verifying against the checklist below.",
    ]) +
    h2("Avoiding context overflow") + bullets([
      "One page file per prompt; reference (don't re-paste) the style guide after the first prompt.",
      "REACT_EXPORT_PLAN.json is for tools that accept structured data — don't paste it alongside page files.",
      "If only building one page, use 00 + 01 + that page's file.",
    ]) +
    h2("Checklist") + numbered([
      "All routes exist: " + ctx.pages.map((p) => routeFor(p.name)).join(", "),
      "Sections match each page file's order and variants.",
      "Copy matches exactly; grey placeholders for missing images.",
      "prefers-reduced-motion honoured.",
    ])));

  files.push(file("REACT_EXPORT_PLAN.json", "React Export Plan", generateReactPlanJson(ctx)));
  return files;
}
