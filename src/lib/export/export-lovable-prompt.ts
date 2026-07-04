// Lovable prompt — app-builder-friendly language: what to build, pages,
// sections, brand style, content and behavior. No deep code detail.

import type { ExportContext } from "./types";
import { exportPageToPlan } from "@/lib/section-editor/export-section";
import { styleGuideMarkdown } from "./export-style-guide";
import { routeFor } from "./export-full-site";
import { h1, h2, h3, bullets, numbered, jsonBlock, compact } from "./markdown-utils";

export function generateLovablePrompt(ctx: ExportContext): string {
  const plans = ctx.pages.map(exportPageToPlan);
  return (
    h1(`Lovable Build Prompt — ${ctx.projectName}`) +
    h2("What to Build") +
    `A ${ctx.websiteType ?? "website"} for ${ctx.businessName ?? ctx.projectName}${ctx.industry ? ` in the ${ctx.industry} industry` : ""}. It should ${ctx.goals?.[0] ?? "convert visitors into customers"}. The design and content below are already approved — build them exactly, do not invent extra pages or copy.\n` +
    h2("Pages") + bullets(ctx.pages.map((p) => `${p.name} (${routeFor(p.name)})`)) +
    styleGuideMarkdown(ctx.style) +
    ctx.pages.map((p, i) => {
      const active = plans[i].sections.filter((s) => s.status !== "rejected");
      return (
        h2(`Page: ${p.name}`) +
        "Sections in this exact order:\n" +
        numbered(active.map((s) => `${s.name} — ${s.designVariant?.label ?? "standard layout"}`)) +
        active.map((s) => h3(s.name) + jsonBlock(compact({ ...s.content })) +
          (s.motion.preset && s.motion.preset !== "none" ? `Interaction: ${s.motion.preset.replace(/-/g, " ")} (subtle).\n` : "")).join("")
      );
    }).join("") +
    h2("Layout Requirements") + bullets(["Follow each section's column count and alignment.", "Generous section padding; consistent spacing rhythm.", "Mobile: everything stacks to one clean column."]) +
    h2("Forms & CTAs") + bullets(["Buttons use the exact labels and links given.", "Forms validate required fields and show a friendly success message."]) +
    h2("Images") + bullets(["Every image is a plain grey placeholder unless an uploaded asset is provided.", "Never use stock photos or images from reference sites."]) +
    h2("Final Checklist") + numbered(["All listed pages exist with their sections in order.", "Copy matches exactly.", "Grey placeholders everywhere an image is missing.", "Mobile layout is clean.", "No invented pages, sections or text."])
  );
}
