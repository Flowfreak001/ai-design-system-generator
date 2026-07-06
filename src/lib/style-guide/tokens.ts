// Semantic design-token system for the Style Guide. Raw extracted colours are
// classified into meaningful website roles (accent/text/background/border/…),
// with safe defaults generated for anything the reference didn't provide. This
// is what turns "a pile of hexes" into a usable website theme.

import type { StyleGuideCanvas } from "@/lib/canvas";

export type TypographyToken = {
  fontFamily: string; // "" = inherit heading/body font
  fontSize: number;   // px
  lineHeight: number; // unitless
  fontWeight: number;
  letterSpacing: string; // e.g. "-0.02em"
};

export type SemanticTokens = {
  colors: Record<string, string>;               // keyed by token key
  fonts: { heading: string; body: string };
  typography: Record<string, TypographyToken>;   // keyed by type key
  spacing: Record<string, number>;               // space.1 … space.24 (px)
  spacingUsage: { sectionDesktop: number; sectionMobile: number; cardPadding: number; gridGap: number };
  radius: Record<string, number>;                // px (radius.full = 999)
  shadows: Record<string, string>;               // css box-shadow
};

// ── Token catalogues (key → display name + group) ───────────────────────────

export const COLOR_TOKENS: { key: string; name: string; group: string }[] = [
  { key: "color.action.primary", name: "Primary Accent", group: "Brand" },
  { key: "color.action.primaryHover", name: "Accent Hover", group: "Brand" },
  { key: "color.text.primary", name: "Primary Text", group: "Text" },
  { key: "color.text.muted", name: "Muted Text", group: "Text" },
  { key: "color.text.inverse", name: "Inverse Text", group: "Text" },
  { key: "color.background.page", name: "Page Background", group: "Backgrounds" },
  { key: "color.background.surface", name: "Surface Background", group: "Backgrounds" },
  { key: "color.background.card", name: "Card Background", group: "Backgrounds" },
  { key: "color.background.inverse", name: "Strong Surface", group: "Backgrounds" },
  { key: "color.border.default", name: "Border Default", group: "UI Borders" },
  { key: "color.border.subtle", name: "Divider", group: "UI Borders" },
  { key: "color.focus.ring", name: "Focus Ring", group: "UI Borders" },
  { key: "color.state.success", name: "Success", group: "States" },
  { key: "color.state.warning", name: "Warning", group: "States" },
  { key: "color.state.error", name: "Error", group: "States" },
  { key: "color.state.info", name: "Info", group: "States" },
];

export const COLOR_GROUPS = ["Brand", "Text", "Backgrounds", "UI Borders", "States"];

export const TYPE_TOKENS: { key: string; name: string }[] = [
  { key: "h1", name: "H1" },
  { key: "h2", name: "H2" },
  { key: "h3", name: "H3" },
  { key: "bodyLarge", name: "Body Large" },
  { key: "body", name: "Body" },
  { key: "small", name: "Small" },
  { key: "button", name: "Button" },
];

export const SPACING_STEPS: [string, number][] = [
  ["space.1", 4], ["space.2", 8], ["space.3", 12], ["space.4", 16], ["space.5", 20],
  ["space.6", 24], ["space.8", 32], ["space.10", 40], ["space.12", 48], ["space.16", 64],
  ["space.20", 80], ["space.24", 96],
];

export const RADIUS_STEPS: [string, number][] = [
  ["radius.none", 0], ["radius.sm", 6], ["radius.md", 10], ["radius.lg", 16], ["radius.xl", 24], ["radius.full", 999],
];

export const SHADOW_STEPS: [string, string][] = [
  ["shadow.none", "none"],
  ["shadow.sm", "0 1px 2px rgba(17,24,39,0.06)"],
  ["shadow.md", "0 4px 12px rgba(17,24,39,0.08)"],
  ["shadow.lg", "0 12px 32px rgba(17,24,39,0.12)"],
  ["shadow.float", "0 24px 60px rgba(17,24,39,0.18)"],
];

// ── Colour maths ─────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  const s = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-f]{6}$/i.test(s)) return null;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function relLum([r, g, b]: [number, number, number]): number {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrastRatio(a: string, b: string): number {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  if (!ra || !rb) return 1;
  const la = relLum(ra), lb = relLum(rb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
function saturation([r, g, b]: [number, number, number]): number {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
}
function shade(hex: string, amt: number): string {
  const rgb = hexToRgb(hex); if (!rgb) return hex;
  return rgbToHex(rgb[0] + 255 * amt, rgb[1] + 255 * amt, rgb[2] + 255 * amt);
}
function dedupe(hexes: string[], delta = 12): string[] {
  const out: string[] = [];
  for (const h of hexes) {
    const rgb = hexToRgb(h); if (!rgb) continue;
    if (!out.some((o) => { const p = hexToRgb(o)!; return Math.abs(p[0] - rgb[0]) + Math.abs(p[1] - rgb[1]) + Math.abs(p[2] - rgb[2]) < delta; })) out.push(h.toLowerCase());
  }
  return out;
}

const DEFAULTS: Record<string, string> = {
  "color.action.primary": "#2563eb",
  "color.action.primaryHover": "#1d4ed8",
  "color.text.primary": "#111827",
  "color.text.muted": "#6b7280",
  "color.text.inverse": "#ffffff",
  "color.background.page": "#ffffff",
  "color.background.surface": "#f6f7f9",
  "color.background.card": "#ffffff",
  "color.background.inverse": "#111827",
  "color.border.default": "#e5e7eb",
  "color.border.subtle": "#f1f2f4",
  "color.focus.ring": "#2563eb",
  "color.state.success": "#16a34a",
  "color.state.warning": "#d97706",
  "color.state.error": "#dc2626",
  "color.state.info": "#2563eb",
};

const DEFAULT_TYPO: Record<string, TypographyToken> = {
  h1: { fontFamily: "", fontSize: 52, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.02em" },
  h2: { fontFamily: "", fontSize: 38, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-0.02em" },
  h3: { fontFamily: "", fontSize: 24, lineHeight: 1.25, fontWeight: 700, letterSpacing: "-0.01em" },
  bodyLarge: { fontFamily: "", fontSize: 18, lineHeight: 1.6, fontWeight: 400, letterSpacing: "0" },
  body: { fontFamily: "", fontSize: 16, lineHeight: 1.6, fontWeight: 400, letterSpacing: "0" },
  small: { fontFamily: "", fontSize: 13, lineHeight: 1.5, fontWeight: 500, letterSpacing: "0" },
  button: { fontFamily: "", fontSize: 15, lineHeight: 1, fontWeight: 600, letterSpacing: "0" },
};

/** Classify raw extracted colours into semantic roles, generating safe defaults
 *  for anything missing. Returns a complete token map. */
export function buildSemanticTokens(style: StyleGuideCanvas): SemanticTokens {
  const raw = dedupe((style.colors ?? []).map((c) => c.value).filter((v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)));
  const rgbOf = (h: string) => hexToRgb(h)!;
  const lumOf = (h: string) => relLum(rgbOf(h));

  const colors: Record<string, string> = { ...DEFAULTS };

  if (raw.length) {
    const sorted = [...raw].sort((a, b) => lumOf(a) - lumOf(b));
    const darkest = sorted[0];
    const lightest = sorted[sorted.length - 1];
    // Most saturated, mid-luminance → the accent.
    const accent = [...raw].sort((a, b) => saturation(rgbOf(b)) - saturation(rgbOf(a)))[0];
    // A light-but-not-white neutral → default border.
    const border = [...raw].filter((h) => { const l = lumOf(h); return l > 0.55 && l < 0.95 && saturation(rgbOf(h)) < 0.2; }).sort((a, b) => lumOf(b) - lumOf(a))[0];
    // A near-black that isn't the primary text → strong/inverse surface.
    const inverse = [...raw].filter((h) => h !== darkest && lumOf(h) < 0.08).sort((a, b) => lumOf(a) - lumOf(b))[0];

    if (accent && saturation(rgbOf(accent)) > 0.25) {
      colors["color.action.primary"] = accent;
      colors["color.action.primaryHover"] = shade(accent, -0.12);
    }
    if (darkest && lumOf(darkest) < 0.25) colors["color.text.primary"] = darkest;
    if (lightest && lumOf(lightest) > 0.9) colors["color.background.page"] = lightest;
    if (border) colors["color.border.default"] = border;
    if (inverse) colors["color.background.inverse"] = inverse;
    else if (darkest) colors["color.background.inverse"] = darkest;
  }

  const headingFont = style.headingFont || "Inter";
  const bodyFont = style.bodyFont || "Inter";
  const radiusPx = style.radiusPx ?? 12;

  return {
    colors,
    fonts: { heading: headingFont, body: bodyFont },
    typography: { ...DEFAULT_TYPO },
    spacing: Object.fromEntries(SPACING_STEPS),
    spacingUsage: { sectionDesktop: 88, sectionMobile: 48, cardPadding: 24, gridGap: 24 },
    radius: { "radius.none": 0, "radius.sm": 6, "radius.md": 10, "radius.lg": Math.max(12, radiusPx), "radius.xl": 24, "radius.full": 999 },
    shadows: Object.fromEntries(SHADOW_STEPS),
  };
}

/** Return the tokens for a style guide, building them from raw colours if the
 *  guide hasn't been converted to the semantic system yet. */
export function tokensOf(style: StyleGuideCanvas): SemanticTokens {
  return (style.tokens as SemanticTokens | undefined) ?? buildSemanticTokens(style);
}

export type ContrastWarning = { label: string; ratio: number; pair: [string, string] };

/** WCAG-ish contrast checks for the key text/background + button pairs. */
export function contrastWarnings(t: SemanticTokens): ContrastWarning[] {
  const c = t.colors;
  const checks: { label: string; fg: string; bg: string; min: number }[] = [
    { label: "Primary text on page", fg: c["color.text.primary"], bg: c["color.background.page"], min: 4.5 },
    { label: "Muted text on page", fg: c["color.text.muted"], bg: c["color.background.page"], min: 4.5 },
    { label: "Button label on accent", fg: c["color.text.inverse"], bg: c["color.action.primary"], min: 4.5 },
    { label: "Inverse text on strong surface", fg: c["color.text.inverse"], bg: c["color.background.inverse"], min: 4.5 },
  ];
  return checks
    .map((k) => ({ label: k.label, ratio: contrastRatio(k.fg, k.bg), pair: [k.fg, k.bg] as [string, string], min: k.min }))
    .filter((r) => r.ratio < (checks.find((k) => k.label === r.label)!.min))
    .map(({ label, ratio, pair }) => ({ label, ratio, pair }));
}
