// Section theme tokens + helpers. createSectionTheme() converts the editor's
// StyleGuideCanvas (STYLE_GUIDE_CANVAS.json) into the token shape every section
// component consumes, so previews reflect approved brand tokens — never
// hardcoded colours. A grey wireframe theme drives the low-fi stage.

import type { SectionTheme, ButtonStyle } from "./types";
import type { StyleGuideCanvas } from "@/lib/canvas";

// Default preview theme for the Section Library — uses the Flowfreak brand
// accent (not a generic blue) and a distinctive Google-font pairing (Space
// Grotesk display + Manrope text) so section previews look designed, not stock.
export const DEFAULT_SECTION_THEME: SectionTheme = {
  primaryColor: "#141419",
  accentColor: "#6d28d9",
  backgroundColor: "#ffffff",
  surfaceColor: "#f5f4f7",
  textColor: "#141419",
  mutedTextColor: "#6b7280",
  borderColor: "#e7e5ea",
  buttonBgColor: "#6d28d9",
  buttonTextColor: "#ffffff",
  radius: "14px",
  shadow: "0 1px 3px rgba(20,20,25,0.08)",
  spacing: "16px",
  headingFont: "'Space Grotesk', system-ui, sans-serif",
  bodyFont: "'Manrope', system-ui, sans-serif",
  buttonStyle: "rounded",
  animationStyle: "smooth",
};

/** Monochrome low-fidelity theme for the Wireframe stage. */
export const WIREFRAME_SECTION_THEME: SectionTheme = {
  primaryColor: "#c4c4c4",
  accentColor: "#cfcfcf",
  backgroundColor: "#ffffff",
  surfaceColor: "#ededed",
  textColor: "#9b9b9b",
  mutedTextColor: "#bcbcbc",
  borderColor: "#e2e2e2",
  buttonBgColor: "#cfcfcf",
  buttonTextColor: "#ffffff",
  radius: "8px",
  shadow: "none",
  spacing: "16px",
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  buttonStyle: "rounded",
  animationStyle: "none",
};

function buttonStyleFromRadius(px: number): ButtonStyle {
  if (px >= 24) return "pill";
  if (px >= 6) return "rounded";
  return "sharp";
}

/** Convert a StyleGuideCanvas into section theme tokens (with safe fallbacks). */
export function createSectionTheme(styleGuide?: StyleGuideCanvas | null): SectionTheme {
  if (!styleGuide) return DEFAULT_SECTION_THEME;

  // Prefer the semantic token map when present — it's the source of truth.
  const t = styleGuide.tokens;
  if (t?.colors) {
    const c = t.colors;
    const radiusPx = t.radius?.["radius.lg"] ?? styleGuide.radiusPx ?? 12;
    return {
      primaryColor: c["color.text.primary"] ?? DEFAULT_SECTION_THEME.primaryColor,
      accentColor: c["color.action.primary"] ?? DEFAULT_SECTION_THEME.accentColor,
      backgroundColor: c["color.background.page"] ?? DEFAULT_SECTION_THEME.backgroundColor,
      surfaceColor: c["color.background.surface"] ?? DEFAULT_SECTION_THEME.surfaceColor,
      textColor: c["color.text.primary"] ?? DEFAULT_SECTION_THEME.textColor,
      mutedTextColor: c["color.text.muted"] ?? DEFAULT_SECTION_THEME.mutedTextColor,
      borderColor: c["color.border.default"] ?? DEFAULT_SECTION_THEME.borderColor,
      buttonBgColor: c["color.action.primary"] ?? DEFAULT_SECTION_THEME.buttonBgColor,
      buttonTextColor: c["color.text.inverse"] ?? DEFAULT_SECTION_THEME.buttonTextColor,
      radius: `${radiusPx}px`,
      shadow: t.shadows?.["shadow.md"] ?? DEFAULT_SECTION_THEME.shadow,
      spacing: `${styleGuide.spacingPx ?? 16}px`,
      headingFont: t.fonts?.heading ? `${t.fonts.heading}, system-ui, sans-serif` : DEFAULT_SECTION_THEME.headingFont,
      bodyFont: t.fonts?.body ? `${t.fonts.body}, system-ui, sans-serif` : DEFAULT_SECTION_THEME.bodyFont,
      buttonStyle: buttonStyleFromRadius(radiusPx),
      animationStyle: DEFAULT_SECTION_THEME.animationStyle,
    };
  }

  const colors = styleGuide.colors ?? [];
  const byRole = (role: string) => colors.find((c) => c.role === role)?.value;
  const byName = (re: RegExp) => colors.find((c) => re.test(c.name))?.value;
  const radiusPx = styleGuide.radiusPx ?? 12;
  return {
    primaryColor: byRole("main") ?? colors[0]?.value ?? DEFAULT_SECTION_THEME.primaryColor,
    accentColor:
      byRole("accent") ?? byName(/accent|brand|primary|blue/i) ?? colors[1]?.value ?? DEFAULT_SECTION_THEME.accentColor,
    backgroundColor: byRole("background") ?? byName(/bg|background|canvas|white|50/i) ?? DEFAULT_SECTION_THEME.backgroundColor,
    surfaceColor: byName(/surface|panel|100|200|muted/i) ?? DEFAULT_SECTION_THEME.surfaceColor,
    textColor: byRole("text") ?? byName(/ink|text|black|900|800/i) ?? DEFAULT_SECTION_THEME.textColor,
    mutedTextColor: DEFAULT_SECTION_THEME.mutedTextColor,
    borderColor: byRole("border") ?? byName(/border|line|200|300/i) ?? DEFAULT_SECTION_THEME.borderColor,
    buttonBgColor: byRole("accent") ?? byName(/accent|brand|primary|cta|action/i) ?? DEFAULT_SECTION_THEME.buttonBgColor,
    buttonTextColor: DEFAULT_SECTION_THEME.buttonTextColor,
    radius: `${radiusPx}px`,
    shadow: DEFAULT_SECTION_THEME.shadow,
    spacing: `${styleGuide.spacingPx ?? 16}px`,
    headingFont: styleGuide.headingFont ? `${styleGuide.headingFont}, system-ui, sans-serif` : DEFAULT_SECTION_THEME.headingFont,
    bodyFont: styleGuide.bodyFont ? `${styleGuide.bodyFont}, system-ui, sans-serif` : DEFAULT_SECTION_THEME.bodyFont,
    buttonStyle: buttonStyleFromRadius(radiusPx),
    animationStyle: DEFAULT_SECTION_THEME.animationStyle,
  };
}

/** Always return a full theme (fallback to default) for component rendering. */
export function resolveTheme(theme?: SectionTheme | null): SectionTheme {
  return theme ?? DEFAULT_SECTION_THEME;
}

// ---- Style helpers shared by all section components ----
export const h = (t: SectionTheme) => ({ fontFamily: t.headingFont, color: t.textColor });
export const b = (t: SectionTheme) => ({ fontFamily: t.bodyFont, color: t.mutedTextColor });

export function btnRadius(t: SectionTheme): string {
  switch (t.buttonStyle) {
    case "pill": return "9999px";
    case "sharp": return "0px";
    case "soft": return "8px";
    default: return t.radius;
  }
}
export const fill = (t: SectionTheme) => ({ background: t.accentColor, color: "#ffffff", borderRadius: btnRadius(t) });
export const outline = (t: SectionTheme) => ({ border: `1px solid ${t.accentColor}`, color: t.accentColor, borderRadius: btnRadius(t) });
export const card = (t: SectionTheme) => ({ background: t.surfaceColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}` });
export const cardRaised = (t: SectionTheme) => ({ background: t.backgroundColor, borderRadius: t.radius, border: `1px solid ${t.borderColor}`, boxShadow: t.shadow });
