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
import type { AiScreenshotAnalysis } from "@/lib/ai/types";
import type { SitemapCanvas } from "@/lib/canvas";

export type GeneratorContext = {
  input: GenerationInput;
  website: WebsiteAnalysis | null;
  visual: VisualAnalysis | null;
  tokens: TokensAnalysis | null;
  animation: AnimationAnalysis | null;
  /** OpenAI Vision screenshot analysis, when it has been run. */
  ai: AiScreenshotAnalysis | null;
  /** The user's edited Design Editor sitemap/wireframe — the source of truth
   *  for page + section structure when present. */
  canvas: SitemapCanvas | null;
};

export type MdArtifact = { name: string; content: string };

/** A compact, labelled block summarising OpenAI Vision findings for a set of
 *  section types — reused across DESIGN/COMPONENTS/ANIMATION/CREATIVE. Returns
 *  "" when no vision analysis exists so generators stay clean. */
export function visionBlock(ctx: GeneratorContext, keys: (keyof import("@/lib/ai/types").VisionAnalysis)[]): string {
  const ai = ctx.ai;
  if (!ai || ai.source !== "openai_vision" || !ai.sections.length) return "";
  const lines: string[] = [];
  for (const s of ai.sections) {
    const bits: string[] = [];
    for (const k of keys) {
      const v = s[k];
      if (Array.isArray(v) && v.length) bits.push(...v.map((x) => `  - ${x}`));
      else if (typeof v === "string" && v) bits.push(`  - ${v}`);
    }
    if (bits.length) lines.push(`**${s.label ?? s.sectionType}** (${s.pageType} · confidence ${s.confidence}):\n${bits.slice(0, 8).join("\n")}`);
  }
  if (!lines.length) return "";
  return `\n## Detected from screenshot (OpenAI Vision)\n_Visual interpretation only — computed styles above remain the factual source._\n\n${lines.join("\n\n")}\n`;
}

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
  /** Raw list — for JSON artifacts (e.g. STYLE_DIRECTION.json). */
  list(): string[] {
    return [...this.items];
  }
}

/** Tokens with graceful fallback + assumption tracking. */
export function paletteOf(ctx: GeneratorContext, a: Assumptions): { name: string; value: string }[] {
  // Priority: user-provided brand colors → analyzed tokens → legacy refs → assumed neutral.
  const { brief } = ctx.input;
  const provided = [brief.primaryColor, brief.secondaryColor].filter(
    (c): c is string => Boolean(c && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)),
  );
  if (provided.length) {
    return provided.map((value, i) => ({ name: i === 0 ? "primary" : "secondary", value }));
  }
  const entries = Object.entries(ctx.tokens?.color ?? {});
  if (entries.length) {
    a.add("Palette extracted from the analyzed website — confirm it matches current brand assets.");
    return entries.map(([name, value]) => ({ name, value: String(value) }));
  }
  const refs = brief.brandRefs.filter((r) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(r));
  if (refs.length) {
    a.add("Palette taken from brand references in the brief.");
    return refs.map((value, i) => ({ name: i === 0 ? "primary" : `color-${i + 1}`, value }));
  }
  a.add(
    "Brand colors were not provided, so the system recommends a clean neutral palette until final brand assets are available.",
  );
  return [
    { name: "primary", value: "#111827" },
    { name: "accent", value: "#2563eb" },
    { name: "background", value: "#fafaf8" },
  ];
}

export function fontsOf(ctx: GeneratorContext, a: Assumptions): string[] {
  // Priority: user preference → analyzed tokens → assumed clean sans.
  if (ctx.input.brief.fontPreference?.trim()) return [ctx.input.brief.fontPreference.trim()];
  const fonts = Object.values(ctx.tokens?.typography ?? {}).map(String);
  if (fonts.length) return fonts;
  a.add(
    "A font was not provided, so the system recommends a clean sans (Inter) until brand typography is confirmed.",
  );
  return ["Inter"];
}

/** Pages to build — the edited Design Editor sitemap wins, then the brief. */
export function pagesOf(ctx: GeneratorContext): string[] {
  const canvasPages = ctx.canvas?.pages?.map((p) => p.name).filter(Boolean);
  if (canvasPages?.length) return canvasPages;
  return ctx.input.brief.keyItems.length ? ctx.input.brief.keyItems : ["Home"];
}

export function sectionsOf(ctx: GeneratorContext, a: Assumptions): string[] {
  // 1) The user's edited wireframe (homepage section stack) is authoritative.
  const home =
    ctx.canvas?.pages?.find((p) => /^home$/i.test(p.name)) ?? ctx.canvas?.pages?.[0];
  if (home?.sections?.length) {
    a.add("Section flow follows the approved Design Editor wireframe.");
    return home.sections.map((s) => s.name);
  }
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
