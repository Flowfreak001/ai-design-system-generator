// Section theme tokens + helpers. createSectionTheme() converts the editor's
// StyleGuideCanvas (STYLE_GUIDE_CANVAS.json) into the token shape every section
// component consumes, so previews reflect approved brand tokens — never
// hardcoded colours. A grey wireframe theme drives the low-fi stage.

import type { SectionTheme, ButtonStyle } from "./types";
import type { StyleGuideCanvas } from "@/lib/canvas";

export const DEFAULT_SECTION_THEME: SectionTheme = {
  primaryColor: "#111827",
  accentColor: "#2563eb",
  backgroundColor: "#ffffff",
  surfaceColor: "#f6f7f9",
  textColor: "#111827",
  mutedTextColor: "#6b7280",
  borderColor: "#e5e7eb",
  radius: "12px",
  shadow: "0 1px 3px rgba(17,24,39,0.08)",
  spacing: "16px",
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  buttonStyle: "rounded",
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
  radius: "8px",
  shadow: "none",
  spacing: "16px",
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  buttonStyle: "rounded",
};

function buttonStyleFromRadius(px: number): ButtonStyle {
  if (px >= 24) return "pill";
  if (px >= 6) return "rounded";
  return "sharp";
}

/** Convert a StyleGuideCanvas into section theme tokens (with safe fallbacks). */
export function createSectionTheme(styleGuide?: StyleGuideCanvas | null): SectionTheme {
  if (!styleGuide) return DEFAULT_SECTION_THEME;
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
    radius: `${radiusPx}px`,
    shadow: DEFAULT_SECTION_THEME.shadow,
    spacing: `${styleGuide.spacingPx ?? 16}px`,
    headingFont: styleGuide.headingFont ? `${styleGuide.headingFont}, system-ui, sans-serif` : DEFAULT_SECTION_THEME.headingFont,
    bodyFont: styleGuide.bodyFont ? `${styleGuide.bodyFont}, system-ui, sans-serif` : DEFAULT_SECTION_THEME.bodyFont,
    buttonStyle: buttonStyleFromRadius(radiusPx),
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
