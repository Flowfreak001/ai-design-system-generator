// Replit prompt — simpler build prompt for Replit-style app builders: goal,
// pages, sections, style, exact copy — without deep implementation detail.

import type { ExportContext } from "./types";
import { exportPageToPlan } from "@/lib/section-editor/export-section";
import { styleGuideMarkdown } from "./export-style-guide";
import { routeFor } from "./export-full-site";
import { h1, h2, h3, bullets, numbered, jsonBlock, compact } from "./markdown-utils";

export function generateReplitPrompt(ctx: ExportContext): string {
  const plans = ctx.pages.map(exportPageToPlan);
  return (
    h1(`Replit Build Prompt — ${ctx.projectName}`) +
    h2("Goal") +
    `Build a ${ctx.websiteType ?? "website"} for ${ctx.businessName ?? ctx.projectName}${ctx.industry ? ` (${ctx.industry})` : ""}. Primary goal: ${ctx.goals?.[0] ?? "convert visitors"}.\n` +
    h2("Stack") + bullets(["React + TypeScript + Tailwind CSS", "Simple, clean component structure", "No CMS — content is hardcoded from the specs below"]) +
    h2("Pages") + bullets(ctx.pages.map((p) => `${p.name} → ${routeFor(p.name)}`)) +
    styleGuideMarkdown(ctx.style) +
    ctx.pages.map((p, i) => {
      const active = plans[i].sections.filter((s) => s.status !== "rejected");
      return (
        h2(`Page: ${p.name}`) +
        numbered(active.map((s) => `${s.name} (${s.designVariant?.label ?? "default"})`)) +
        active.map((s) => h3(s.name) + "Exact content (do not rewrite):\n" + jsonBlock(compact({ ...s.content }))).join("")
      );
    }).join("") +
    h2("Images") + bullets(["Use plain grey placeholder blocks for every image.", "Do not pull stock images.", "Alt text as specified where given."]) +
    h2("CTA / Forms") + bullets(["Buttons link to the hrefs given in content.", "Forms show a success message on submit (no backend needed)."]) +
    h2("Responsive") + bullets(["Desktop as specified; tablet reduces columns; mobile stacks to one column with full-width buttons."]) +
    h2("Final Checklist") + numbered(["All pages exist.", "All sections in order with exact copy.", "Grey placeholders for images.", "Mobile layout stacks cleanly."])
  );
}
