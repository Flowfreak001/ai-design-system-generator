// Theme derived from the Style Guide canvas and passed to every real section
// component so previews reflect the approved tokens (not fixed styling).

import type { StyleGuideCanvas } from "@/lib/canvas";

export type SectionTheme = {
  primary: string;
  accent: string;
  ink: string;
  muted: string;
  bg: string;
  surface: string;
  radius: number;
  headingFont: string;
  bodyFont: string;
};

export const DEFAULT_THEME: SectionTheme = {
  primary: "#1f2937",
  accent: "#2563eb",
  ink: "#111827",
  muted: "#6b7280",
  bg: "#ffffff",
  surface: "#f7f7f5",
  radius: 12,
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
};

export function themeFromStyle(style?: StyleGuideCanvas | null): SectionTheme {
  if (!style) return DEFAULT_THEME;
  const colors = style.colors ?? [];
  const byRole = (role: string) => colors.find((c) => c.role === role)?.value;
  const accent = byRole("accent") ?? colors.find((c) => /accent|blue|primary|brand/i.test(c.name))?.value ?? colors[1]?.value ?? DEFAULT_THEME.accent;
  const primary = byRole("main") ?? colors[0]?.value ?? DEFAULT_THEME.primary;
  return {
    primary,
    accent,
    ink: colors.find((c) => /ink|text|black|900|800/i.test(c.name))?.value ?? DEFAULT_THEME.ink,
    muted: DEFAULT_THEME.muted,
    bg: colors.find((c) => /bg|background|canvas|white|50/i.test(c.name))?.value ?? DEFAULT_THEME.bg,
    surface: colors.find((c) => /surface|panel|100|200/i.test(c.name))?.value ?? DEFAULT_THEME.surface,
    radius: style.radiusPx ?? DEFAULT_THEME.radius,
    headingFont: style.headingFont ? `${style.headingFont}, system-ui, sans-serif` : DEFAULT_THEME.headingFont,
    bodyFont: style.bodyFont ? `${style.bodyFont}, system-ui, sans-serif` : DEFAULT_THEME.bodyFont,
  };
}

/** Section components share this prop shape. */
export type SectionProps = {
  /** Section name / heading text hint. */
  title?: string;
  /** Copy direction / description. */
  note?: string;
  theme: SectionTheme;
  mobile?: boolean;
  /** Which side the image/asset sits on in split layouts (default "right"). */
  assetSide?: "left" | "right";
};
