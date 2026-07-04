// Style-guide export: turn the approved StyleGuideCanvas into (a) a structured
// token object for JSON exports and (b) a markdown block for prompts. Safe
// fallbacks when the style guide is missing (marked as assumptions).

import type { StyleGuideCanvas } from "@/lib/canvas";
import { h2, bullets } from "./markdown-utils";

export interface StyleTokens {
  source: "approved-style-guide" | "assumed-defaults";
  colors: { name: string; value: string; role?: string }[];
  typography: { headingFont: string; bodyFont: string };
  spacingPx: number;
  radiusPx: number;
  buttons: string;
  cards: string;
  images: string;
  motion: string;
}

export function buildStyleTokens(style?: StyleGuideCanvas | null): StyleTokens {
  const radiusPx = style?.radiusPx ?? 12;
  return {
    source: style ? "approved-style-guide" : "assumed-defaults",
    colors: (style?.colors ?? []).map((c) => ({ name: c.name, value: c.value, role: c.role })),
    typography: {
      headingFont: style?.headingFont ?? "Inter",
      bodyFont: style?.bodyFont ?? "Inter",
    },
    spacingPx: style?.spacingPx ?? 16,
    radiusPx,
    buttons: radiusPx >= 24 ? "pill buttons" : radiusPx >= 6 ? "rounded buttons" : "sharp buttons",
    cards: `surface cards, ${radiusPx}px radius, 1px subtle border, soft shadow`,
    images: "grey placeholder blocks by default; uploaded/approved assets only",
    motion: "subtle, purposeful; honour prefers-reduced-motion",
  };
}

export function styleGuideMarkdown(style?: StyleGuideCanvas | null): string {
  const t = buildStyleTokens(style);
  const colorLines = t.colors.length
    ? t.colors.map((c) => `${c.name}: ${c.value}${c.role ? ` (${c.role})` : ""}`)
    : ["No approved palette — use a restrained neutral palette with ONE accent (assumption)."];
  return (
    h2("Global Style Rules") +
    `Source: ${t.source}\n` +
    bullets([
      `Colors: ${colorLines.join(" · ")}`,
      `Typography: headings ${t.typography.headingFont}, body ${t.typography.bodyFont}`,
      `Spacing rhythm: ${t.spacingPx}px base; generous section padding`,
      `Radius: ${t.radiusPx}px · ${t.buttons}`,
      `Cards: ${t.cards}`,
      `Images: ${t.images}`,
      `Motion: ${t.motion}`,
    ])
  );
}
