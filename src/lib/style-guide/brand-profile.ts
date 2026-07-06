// Brand Profile — a full website brand system derived from the reference
// analysis + semantic tokens. Not just colours: personality, typography, layout,
// component style and imagery guidance, with confidence + extraction warnings.
// The reference INSPIRES structure; media is always placeholder (never copied).

import type { StyleGuideCanvas } from "@/lib/canvas";
import {
  COLOR_TOKENS, tokensOf, contrastWarnings, contrastRatio, type SemanticTokens,
} from "./tokens";

export type BrandColorEntry = { key: string; name: string; group: string; value: string };

export type BrandProfile = {
  brandName: string;
  industryGuess: string;
  brandPersonality: string[];
  visualTone: string;
  confidence: "high" | "medium" | "low";
  evidenceSummary: string;
  colorSystem: BrandColorEntry[];
  typographySystem: {
    headingFont: string; bodyFont: string; headingWeight: number; bodyWeight: number;
    scale: { h1: number; h2: number; h3: number };
    lineHeights: { heading: number; body: number };
    letterSpacing: string; buttonTextStyle: string;
  };
  layoutSystem: {
    maxWidth: number; sectionPaddingDesktop: number; sectionPaddingMobile: number;
    gridGap: number; cardPadding: number; density: "compact" | "balanced" | "spacious";
    radiusScale: string; shadowStyle: string;
  };
  componentStyle: {
    button: string; card: string; input: string; nav: string; cta: string; section: string; media: string;
  };
  imageryStyle: string[];
  extractionWarnings: string[];
};

function hexToRgb(hex: string): [number, number, number] | null {
  const s = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(s)) return null;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function sat([r, g, b]: [number, number, number]) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; }
function lum([r, g, b]: [number, number, number]) { return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }

const RADIUS_LABEL = (px: number) => px >= 20 ? "Pill / very rounded" : px >= 10 ? "Rounded" : px >= 4 ? "Soft" : "Sharp";

export function buildBrandProfile(
  style: StyleGuideCanvas,
  meta: { brandName?: string; industry?: string; businessType?: string; host?: string | null },
): BrandProfile {
  const t: SemanticTokens = tokensOf(style);
  const c = t.colors;

  const colorSystem: BrandColorEntry[] = COLOR_TOKENS.map((ct) => ({ key: ct.key, name: ct.name, group: ct.group, value: c[ct.key] }));

  // ── Personality / tone from the palette ──
  const accentRgb = hexToRgb(c["color.action.primary"]);
  const pageRgb = hexToRgb(c["color.background.page"]);
  const isLight = pageRgb ? lum(pageRgb) > 0.6 : true;
  const accentSat = accentRgb ? sat(accentRgb) : 0;
  const radiusLg = t.radius["radius.lg"] ?? 12;

  const personality: string[] = [];
  personality.push(accentSat > 0.6 ? "Bold" : accentSat > 0.3 ? "Confident" : "Understated");
  personality.push(isLight ? "Clean" : "Dramatic");
  personality.push(radiusLg >= 16 ? "Friendly" : radiusLg <= 4 ? "Precise" : "Modern");
  const visualTone = `${isLight ? "Light" : "Dark"}, ${accentSat > 0.5 ? "energetic" : "restrained"}, ${radiusLg >= 12 ? "approachable" : "sharp"}`;

  // ── Industry guess ──
  const industryGuess = meta.industry?.trim() || (meta.businessType?.trim() ? `${meta.businessType.trim()} business` : "General / multi-purpose");

  // ── Confidence + evidence ──
  const src = style.source;
  const confidence: BrandProfile["confidence"] = src === "extracted" ? "high" : src === "reference-inspired" ? "medium" : "low";
  const evidenceSummary = src === "extracted"
    ? `Measured from the rendered reference${meta.host ? ` (${meta.host})` : ""} — colours, fonts and metrics come from the live page.`
    : src === "reference-inspired"
      ? "Inferred from the reference's stylesheet/analysis; some values are derived, not measured."
      : "No reference data — safe defaults assumed until a URL or screenshot is provided.";

  // ── Typography ──
  const typographySystem = {
    headingFont: t.fonts.heading, bodyFont: t.fonts.body,
    headingWeight: t.typography.h1?.fontWeight ?? 800, bodyWeight: t.typography.body?.fontWeight ?? 400,
    scale: { h1: t.typography.h1?.fontSize ?? 52, h2: t.typography.h2?.fontSize ?? 38, h3: t.typography.h3?.fontSize ?? 24 },
    lineHeights: { heading: t.typography.h1?.lineHeight ?? 1.05, body: t.typography.body?.lineHeight ?? 1.6 },
    letterSpacing: t.typography.h1?.letterSpacing ?? "-0.02em",
    buttonTextStyle: (t.typography.button?.fontWeight ?? 600) >= 700 ? "Bold" : "Medium",
  };

  // ── Layout ──
  const pad = t.spacingUsage.sectionDesktop;
  const density: BrandProfile["layoutSystem"]["density"] = pad >= 96 ? "spacious" : pad >= 64 ? "balanced" : "compact";
  const shadowStyle = t.shadows["shadow.md"] === "none" ? "Flat (no shadows)" : "Soft elevation";
  const layoutSystem = {
    maxWidth: 1200, sectionPaddingDesktop: pad, sectionPaddingMobile: t.spacingUsage.sectionMobile,
    gridGap: t.spacingUsage.gridGap, cardPadding: t.spacingUsage.cardPadding, density,
    radiusScale: RADIUS_LABEL(radiusLg), shadowStyle,
  };

  // ── Component style ──
  const rounded = RADIUS_LABEL(radiusLg);
  const componentStyle = {
    button: `${rounded}, solid accent fill, ${typographySystem.buttonTextStyle.toLowerCase()} label`,
    card: `${rounded} corners, ${shadowStyle.toLowerCase()}, hairline border`,
    input: `${rounded}, bordered, surface fill`,
    nav: isLight ? "Light bar, minimal links, accent CTA" : "Dark bar, high-contrast links",
    cta: accentSat > 0.4 ? "High-contrast accent band" : "Understated, neutral CTA",
    section: `${density} spacing, ${isLight ? "light" : "dark"} surfaces`,
    media: `${radiusLg >= 12 ? "Rounded" : "Square"} media, framed with border`,
  };

  // ── Imagery (described, never copied) ──
  const imageryStyle = [
    "Neutral placeholder blocks (no reference images copied)",
    radiusLg >= 12 ? "Rounded-corner media" : "Square media",
    isLight ? "Bright, airy imagery" : "Moody, high-contrast imagery",
    accentSat > 0.5 ? "Bold colour accents in graphics" : "Muted, editorial tone",
  ];

  // ── Warnings ──
  const extractionWarnings: string[] = [];
  contrastWarnings(t).forEach((w) => extractionWarnings.push(`Low contrast — ${w.label} (${w.ratio.toFixed(1)}:1).`));
  if (contrastRatio(c["color.text.inverse"], c["color.action.primary"]) < 4.5) {
    extractionWarnings.push("Button label may be hard to read on the accent — consider a darker accent or dark label.");
  }
  if (src !== "extracted") extractionWarnings.push("Add a reference URL or screenshot to measure real brand values (currently inferred).");
  if ((style.colors ?? []).length < 3) extractionWarnings.push("Few source colours found — several tokens use safe defaults.");

  return {
    brandName: meta.brandName?.trim() || "Your Brand",
    industryGuess,
    brandPersonality: personality,
    visualTone,
    confidence,
    evidenceSummary,
    colorSystem,
    typographySystem,
    layoutSystem,
    componentStyle,
    imageryStyle,
    extractionWarnings,
  };
}
