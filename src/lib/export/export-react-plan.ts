// React Export Plan JSON — strict machine-readable build data (§7 shape).
// Mirrors the server generator but built from live editor state, so the JSON
// tab always reflects the latest edits.

import type { ExportContext } from "./types";
import { exportPageToPlan } from "@/lib/section-editor/export-section";
import { buildStyleTokens } from "./export-style-guide";
import { pageSeo } from "./export-page";
import { routeFor } from "./export-full-site";

export function buildReactPlan(ctx: ExportContext) {
  const pagePlans = ctx.pages.map(exportPageToPlan);
  const globals: { type: string; componentName: string; content: unknown; layout: unknown; assets: unknown[]; motion: unknown }[] = [];
  const seen = new Set<string>();
  for (const p of pagePlans) for (const s of p.sections) {
    const gType = s.kind === "navbar" ? "navbar" : s.kind === "footer" ? "footer" : s.global ? "globalCTA" : null;
    if (gType && !seen.has(gType)) { seen.add(gType); globals.push({ type: gType, componentName: s.component, content: s.content, layout: s.layout, assets: s.assets, motion: s.motion }); }
  }

  return {
    project: {
      name: ctx.projectName,
      businessName: ctx.businessName ?? ctx.projectName,
      websiteType: ctx.websiteType ?? "",
      industry: ctx.industry ?? "",
      primaryGoal: ctx.goals?.[0] ?? "",
      audience: ctx.audience ?? "",
    },
    styleGuide: buildStyleTokens(ctx.style),
    dependencies: ["next", "react", "typescript", "tailwindcss", "shadcn/ui", "lucide-react", "framer-motion"],
    routes: ctx.pages.map((p) => ({ name: p.name, slug: routeFor(p.name), pageType: p.pageType ?? "standard" })),
    globalComponents: globals,
    pages: ctx.pages.map((p, i) => {
      const plan = pagePlans[i];
      const seo = pageSeo(p.name, ctx);
      return {
        id: p.id,
        name: p.name,
        slug: routeFor(p.name),
        pageType: p.pageType ?? "standard",
        seo: { title: seo.title, description: seo.description },
        sections: p.sections.map((s, j) => ({
          id: s.id,
          recommendedFile: `src/components/sections/${plan.sections[j].component}.tsx`,
          ...plan.sections[j],
        })),
      };
    }),
    assetInstructions: [
      "Grey placeholder for every asset with source 'placeholder'.",
      "Assets with source 'AI-suggested' carry an aiPrompt — an instruction, not an image.",
      "Never use assets marked 'reference-only' as final imagery.",
    ],
    buildInstructions: [
      "Build pages from `pages[].sections` in order; skip status 'rejected'.",
      "Import each section's component; pass content/layout/assets/motion as props.",
      "Keep files modular — one component per file.",
    ],
    doRules: ["Use exact edited content.", "Preserve selected variants and item order.", "Use approved style tokens.", "Honour prefers-reduced-motion."],
    doNotRules: ["Do not invent copy or pages.", "Do not use random stock images.", "Do not copy reference imagery.", "Do not revert user edits to defaults."],
  };
}

export function generateReactPlanJson(ctx: ExportContext): string {
  return JSON.stringify(buildReactPlan(ctx), null, 2);
}
