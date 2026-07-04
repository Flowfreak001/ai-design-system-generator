// Page Build Prompt — one complete page: metadata, style rules, exact section
// order, then the full section spec for every section (final edited data).

import type { CanvasPage } from "@/lib/canvas";
import type { ExportContext } from "./types";
import { exportPageToPlan } from "@/lib/section-editor/export-section";
import { sectionPromptBody } from "./export-section";
import { styleGuideMarkdown } from "./export-style-guide";
import { h1, h2, h3, bullets, numbered, jsonBlock, slugify } from "./markdown-utils";

export function pageSeo(pageName: string, ctx: ExportContext) {
  const biz = ctx.businessName ?? ctx.projectName;
  return {
    title: /^home/i.test(pageName) ? `${biz} — ${ctx.websiteType ?? "Official Site"}` : `${pageName} — ${biz}`,
    description: `${pageName} page for ${biz}${ctx.industry ? ` (${ctx.industry})` : ""}. Original copy required at build time.`,
  };
}

export function generatePagePrompt(page: CanvasPage, ctx: ExportContext): string {
  const plan = exportPageToPlan(page);
  const seo = pageSeo(page.name, ctx);
  const active = plan.sections.filter((s) => s.status !== "rejected");
  return (
    h1(`Page Build Prompt: ${page.name}`) +
    "You are building one complete page from an approved AI Design Canvas.\n" +
    h2("Page Metadata") + jsonBlock({
      pageName: page.name,
      slug: /^home/i.test(page.name) ? "/" : `/${slugify(page.name)}`,
      pageType: page.pageType ?? "standard",
      seoTitle: seo.title,
      seoDescription: seo.description,
      primaryGoal: ctx.goals?.[0] ?? "convert visitors",
      audience: ctx.audience ?? "target customers",
    }) +
    h2("Stack") + bullets(["React + TypeScript", "Tailwind CSS", "shadcn/ui where useful", "lucide-react icons where needed", "framer-motion only where a section's motion preset requires it"]) +
    styleGuideMarkdown(ctx.style) +
    h2("Exact Section Order") +
    numbered(active.map((s) => `${s.name} — ${s.component} — ${s.designVariant?.label ?? "default"}${s.global ? " (global)" : ""}`)) +
    h2("Section Specifications") +
    active.map((s, i) => h3(`${i + 1}. ${s.name}`) + sectionPromptBody(s, ctx, { includeStyle: false })).join("\n") +
    h2("Page-Level Responsive Rules") + bullets([
      "Desktop: sections render full-width in the order above.",
      "Tablet: multi-column sections reduce to 2 columns.",
      "Mobile: single-column stacking; nav collapses to a menu; forms use full-width fields; images keep aspect ratio.",
    ]) +
    h2("Page-Level SEO") + bullets([
      `Title: ${seo.title}`,
      `Description: ${seo.description}`,
      `H1: the hero title exactly as edited`,
      "H2 structure: one per section, using each section's title",
      "Internal links: navbar/footer links must point at the approved routes only",
    ]) +
    h2("Implementation Instructions") +
    "Build this page exactly from the section specs. Use shared components where possible. Do not skip sections. Do not change copy. Do not invent assets.\n"
  );
}

/** Structured JSON for one page (Copy Page JSON). */
export function generatePageJson(page: CanvasPage): string {
  return JSON.stringify(exportPageToPlan(page), null, 2);
}
