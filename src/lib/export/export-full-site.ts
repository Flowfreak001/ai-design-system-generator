// Full Site Build Prompt — the complete website: project summary, brand rules,
// architecture, routes, global components, then full per-page specs.

import type { ExportContext } from "./types";
import { exportPageToPlan } from "@/lib/section-editor/export-section";
import { generatePagePrompt } from "./export-page";
import { styleGuideMarkdown } from "./export-style-guide";
import { h1, h2, bullets, jsonBlock, codeBlock, slugify } from "./markdown-utils";

export const routeFor = (pageName: string): string => (/^home/i.test(pageName) ? "/" : `/${slugify(pageName)}`);

export function siteArchitecture(ctx: ExportContext) {
  const plans = ctx.pages.map(exportPageToPlan);
  const globals = new Map<string, string>();
  for (const p of plans) for (const s of p.sections) {
    if (s.global || s.kind === "navbar" || s.kind === "footer") globals.set(s.kind, s.component);
  }
  return {
    pages: plans.map((p) => ({ pageName: p.name, slug: routeFor(p.name), pageType: p.pageType ?? "standard", sections: p.sections.filter((s) => s.status !== "rejected").map((s) => s.name) })),
    globalComponents: Object.fromEntries(globals),
  };
}

function fileStructure(ctx: ExportContext): string {
  const routes = ctx.pages.map((p) => (routeFor(p.name) === "/" ? "    page.tsx" : `    ${slugify(p.name)}/page.tsx`));
  return `src/
  app/
${routes.join("\n")}
  components/
    layout/
      Navbar.tsx
      Footer.tsx
    sections/
      (one file per section component)
    ui/
      button.tsx
      card.tsx
  lib/
    site-data.ts
    utils.ts`;
}

export function generateFullSitePrompt(ctx: ExportContext): string {
  const arch = siteArchitecture(ctx);
  return (
    h1("Full Site Build Prompt") +
    "You are building a full website from an approved AI Design Canvas.\n" +
    h2("Project Summary") + bullets([
      `Project Name: ${ctx.projectName}`,
      `Business Name: ${ctx.businessName ?? ctx.projectName}`,
      `Website Type: ${ctx.websiteType ?? "website"}`,
      ctx.industry ? `Industry: ${ctx.industry}` : undefined,
      ctx.audience ? `Audience: ${ctx.audience}` : undefined,
      `Primary Goal: ${ctx.goals?.[0] ?? "convert visitors"}`,
      ctx.goals && ctx.goals.length > 1 ? `Secondary Goals: ${ctx.goals.slice(1).join(", ")}` : undefined,
    ]) +
    h2("Stack") + bullets(["Next.js App Router (or React SPA if the project requires)", "TypeScript", "Tailwind CSS", "shadcn/ui where useful", "lucide-react icons", "framer-motion only where a motion preset requires it"]) +
    styleGuideMarkdown(ctx.style) +
    h2("Site Architecture") + jsonBlock(arch) +
    h2("Recommended File Structure") + codeBlock("txt", fileStructure(ctx)) +
    h2("Routes") + bullets(ctx.pages.map((p) => `${routeFor(p.name)} — ${p.name}`)) + "Use these approved routes exactly.\n" +
    h2("Data-Driven Build Rule") +
    "Where practical, store page/section content in a structured data file (lib/site-data.ts) and render sections from it, so copy changes don't require component edits.\n" +
    h2("Asset Rules") + bullets([
      "Use grey placeholders for missing images.",
      "Do not use random stock images.",
      "Do not copy reference images.",
      "Use uploaded/approved assets only.",
      "AI image prompts are instructions only — not assets.",
    ]) +
    "\n---\n\n" +
    ctx.pages.map((p) => generatePagePrompt(p, ctx)).join("\n---\n\n") +
    h2("Final Build Instructions") +
    "Build the website from this specification exactly. Do not invent pages, sections, copy, images, or layouts unless explicitly marked as an assumption. Keep files modular — do not put all sections into one huge file.\n"
  );
}
