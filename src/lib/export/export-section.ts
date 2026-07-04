// Section Build Prompt — the smallest, most focused export: everything an AI
// builder needs to recreate ONE section exactly as edited on the Design Canvas.

import type { CanvasSection } from "@/lib/canvas";
import type { ExportContext } from "./types";
import { exportSectionToPlan, type SectionPlan } from "@/lib/section-editor/export-section";
import { styleGuideMarkdown } from "./export-style-guide";
import { motionSpec, needsFramerMotion } from "./export-motion";
import { responsiveSpec } from "./export-responsive";
import { accessibilitySpec } from "./export-accessibility";
import { h1, h2, bullets, jsonBlock, codeBlock, compact } from "./markdown-utils";

const KIND_GOAL: Record<string, string> = {
  hero: "Lead with the core value proposition and drive the primary CTA.",
  services: "Present the offered services with a clear outcome per item.",
  features: "Communicate the key features as benefit statements.",
  faq: "Answer the top buyer questions and reduce hesitation.",
  cta: "One decisive nudge to act now with a low-friction next step.",
  footer: "Provide site-wide navigation, contact and legal information.",
  navbar: "Provide clear top-level navigation and a persistent CTA.",
  testimonials: "Build trust through credible customer proof.",
  pricing: "Make plans easy to compare and pick.",
  form: "Capture leads with a short, low-friction form.",
  booking: "Convert visitors into bookings with a clear form.",
  gallery: "Showcase work/product visuals with strong visual impact.",
  socialproof: "Build trust with logos, stats or reviews at a glance.",
};

const PROPS_TS = `type SectionProps = {
  content: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    description?: string;
    primaryButtonLabel?: string;
    primaryButtonHref?: string;
    secondaryButtonLabel?: string;
    secondaryButtonHref?: string;
    items?: Array<Record<string, unknown>>;
  };
  layout: {
    alignment?: string;
    columns?: number;
    spacing?: string;
    backgroundStyle?: string;
    assetPlacement?: string;
  };
  assets?: Array<{ role: string; source: string; url?: string; altText?: string; aiPrompt?: string }>;
  motion?: { preset?: string; intensity?: string };
};`;

/** Section prompt body from an already-built plan (shared with page export). */
export function sectionPromptBody(plan: SectionPlan, ctx: ExportContext, opts: { includeStyle?: boolean } = {}): string {
  const motion = motionSpec(plan.motion);
  return (
    h2("Build Target") +
    bullets([
      `Section Name: ${plan.name}`,
      `Section Type: ${plan.kind} (${plan.sectionType})`,
      `Component Name: ${plan.component}`,
      `Recommended File: src/components/sections/${plan.component}.tsx`,
      `Design Variant: ${plan.designVariant ? `${plan.designVariant.label} (${plan.designVariant.id})` : "default"}`,
      `Source: ${plan.source} · Status: ${plan.status}${plan.global ? " · global section" : ""}`,
    ]) +
    h2("Goal") + `${KIND_GOAL[plan.kind] ?? "Communicate this section's message with a clear hierarchy."}\n` +
    h2("Stack") + bullets(["React + TypeScript", "Tailwind CSS", "shadcn/ui where useful", "lucide-react for icons where needed", needsFramerMotion(plan.motion) ? "framer-motion (required by the motion preset)" : "framer-motion only if needed"]) +
    h2("Exact Content") + "Use this exact final edited content (do not rewrite copy):\n" + jsonBlock(compact({ ...plan.content, items: plan.content.items })) +
    h2("Layout Specification") + jsonBlock(compact({ ...plan.layout })) +
    (opts.includeStyle === false ? "" : styleGuideMarkdown(ctx.style)) +
    h2("Assets / Media") + jsonBlock(plan.assets.map((a) => compact({ role: a.role, source: a.source, url: a.url, altText: a.altText, aiPrompt: a.aiPrompt, notes: a.notes }))) +
    bullets([
      "No final image → render a simple grey placeholder block.",
      "Do not use random stock images.",
      "Do not copy reference website images.",
      "aiPrompt is an instruction for later image generation — not an asset.",
    ]) +
    h2("Motion / Interaction") + jsonBlock(motion) +
    h2("Responsive Rules") + (() => { const r = responsiveSpec(plan.kind, plan.layout); return bullets([`Desktop: ${r.desktop}`, `Tablet: ${r.tablet}`, `Mobile: ${r.mobile}`]); })() +
    h2("Accessibility Rules") + bullets(accessibilitySpec(plan.kind)) +
    (plan.hiddenParts.length ? h2("Hidden Elements") + bullets(plan.hiddenParts.map((p) => `Do not render: ${p}`)) : "") +
    (plan.exportNotes ? h2("Component Notes") + plan.exportNotes + "\n" : "")
  );
}

export function generateSectionPrompt(section: CanvasSection, ctx: ExportContext): string {
  const plan = exportSectionToPlan(section);
  return (
    h1(`Section Build Prompt: ${plan.name}`) +
    "You are building one section from an approved AI Design Canvas.\n" +
    sectionPromptBody(plan, ctx) +
    h2("Suggested Component Props") + codeBlock("ts", PROPS_TS) +
    h2("Implementation Instructions") + "Build this section exactly using the structure above.\n" +
    h2("Do") + bullets(["Use the exact edited content.", "Preserve the selected variant.", "Use approved style tokens.", "Use grey placeholders for missing media.", "Keep responsive behavior clean."]) +
    h2("Do Not") + bullets(["Do not invent new copy.", "Do not add extra sections.", "Do not use random stock images.", "Do not copy reference images.", "Do not ignore user edits."])
  );
}

/** Structured JSON for one section (Copy Section JSON). */
export function generateSectionJson(section: CanvasSection): string {
  return JSON.stringify(exportSectionToPlan(section), null, 2);
}
