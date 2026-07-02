// Shared context + helpers for the MD generator agents. Every generator
// receives the project brief plus safely-parsed analysis JSON (any of which
// may be absent) and must state assumptions where data is missing.

import type { GenerationInput } from "@/types";
import type { AnimationAnalysis } from "@/lib/analysis/animation-extractor";
import type {
  WebsiteAnalysis,
  VisualAnalysis,
  TokensAnalysis,
} from "@/lib/analysis/site-analyzer";

export type GeneratorContext = {
  input: GenerationInput;
  website: WebsiteAnalysis | null;
  visual: VisualAnalysis | null;
  tokens: TokensAnalysis | null;
  animation: AnimationAnalysis | null;
};

export type MdArtifact = { name: string; content: string };

// ---- helpers ---------------------------------------------------------------

export const orNa = (v?: string | null, fallback = "_Not specified_") =>
  v && v.trim() ? v.trim() : fallback;

export const bullets = (items: (string | null | undefined)[], fallback = "- _Not specified_") => {
  const clean = items.filter((i): i is string => Boolean(i && i.trim()));
  return clean.length ? clean.map((i) => `- ${i.trim()}`).join("\n") : fallback;
};

export const inline = (items: string[], fallback = "not specified") =>
  items.length ? items.join(", ") : fallback;

export const who = (ctx: GeneratorContext) =>
  ctx.input.clientName || ctx.input.projectName || "the business";

/** Collect assumptions across a generator run and render them once. */
export class Assumptions {
  private items: string[] = [];
  add(text: string) {
    if (!this.items.includes(text)) this.items.push(text);
  }
  section(): string {
    if (!this.items.length) return "## Assumptions\n\n- None — all inputs above come from project data or site analysis.";
    return `## Assumptions\n\n${this.items.map((a) => `- ${a}`).join("\n")}`;
  }
}

/** Tokens with graceful fallback + assumption tracking. */
export function paletteOf(ctx: GeneratorContext, a: Assumptions): { name: string; value: string }[] {
  const entries = Object.entries(ctx.tokens?.color ?? {});
  if (entries.length) return entries.map(([name, value]) => ({ name, value: String(value) }));
  const refs = ctx.input.brief.brandRefs.filter((r) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(r));
  if (refs.length) {
    a.add("Palette taken from brand references in the brief (site analysis had no color data).");
    return refs.map((value, i) => ({ name: i === 0 ? "primary" : `color-${i + 1}`, value }));
  }
  a.add("No palette detected — neutral base + one accent proposed; confirm with the client.");
  return [
    { name: "primary", value: "#111827" },
    { name: "accent", value: "#2563eb" },
    { name: "background", value: "#fafaf8" },
  ];
}

export function fontsOf(ctx: GeneratorContext, a: Assumptions): string[] {
  const fonts = Object.values(ctx.tokens?.typography ?? {}).map(String);
  if (fonts.length) return fonts;
  a.add("No fonts detected from the site — a clean sans (e.g. Inter) is proposed as default.");
  return ["Inter"];
}

export function sectionsOf(ctx: GeneratorContext, a: Assumptions): string[] {
  if (ctx.website?.sectionsDetected?.length) return ctx.website.sectionsDetected;
  if (ctx.input.brief.keyItems.length) {
    a.add("Section plan derived from the brief's key items (site structure was not analyzable).");
    return ctx.input.brief.keyItems;
  }
  a.add("Standard section flow proposed — no site structure or key items available.");
  return ["hero", "features", "testimonials", "faq", "contact/booking", "footer"];
}

export function analysisConfidenceNote(ctx: GeneratorContext): string {
  const parts: string[] = [];
  if (ctx.website) parts.push(`site structure: ${ctx.website.confidence}`);
  if (ctx.tokens) parts.push(`tokens: ${ctx.tokens.confidence}`);
  if (ctx.animation) parts.push(`animation: ${ctx.animation.meta.confidence}`);
  return parts.length
    ? `_Analysis confidence — ${parts.join(" · ")}._`
    : "_No website analysis available — run “Analyze website” for grounded values._";
}
