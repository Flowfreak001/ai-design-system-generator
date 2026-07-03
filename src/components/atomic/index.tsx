"use client";

// Atomic primitives — the smallest tier of the library. Theme-token driven,
// editable via props, used to compose blocks and sections. shadcn-compatible
// shape (className + props), but rendered against our SectionTheme so previews
// and exports stay brand-consistent. IMAGE RULE lives at the block/section tier.
//
// Source: shadcn primitives, normalized. See docs/COMPONENT_SOURCES.md.

import type { SectionTheme } from "../sections/types";
import { resolveTheme, btnRadius } from "../sections/section-theme";

interface Base { theme?: SectionTheme; className?: string; }

export function Container({ theme, className = "", children, padded = true }: Base & { children?: React.ReactNode; padded?: boolean }) {
  const t = resolveTheme(theme);
  return <div className={`${padded ? "px-12 py-16" : ""} ${className}`} style={{ background: t.backgroundColor, fontFamily: t.bodyFont }}>{children}</div>;
}

export function Heading({ theme, className = "", children = "Heading", level = 2 }: Base & { children?: React.ReactNode; level?: 1 | 2 | 3 }) {
  const t = resolveTheme(theme);
  const size = level === 1 ? "text-[38px]" : level === 2 ? "text-[28px]" : "text-[20px]";
  const Tag = (`h${level}` as unknown) as "h2";
  return <Tag className={`font-semibold leading-[1.1] tracking-[-0.02em] ${size} ${className}`} style={{ fontFamily: t.headingFont, color: t.textColor }}>{children}</Tag>;
}

export function Paragraph({ theme, className = "", children = "Body copy goes here." }: Base & { children?: React.ReactNode }) {
  const t = resolveTheme(theme);
  return <p className={`text-[15px] leading-relaxed ${className}`} style={{ fontFamily: t.bodyFont, color: t.mutedTextColor }}>{children}</p>;
}

export function Button({ theme, className = "", children = "Button", variant = "primary" }: Base & { children?: React.ReactNode; variant?: "primary" | "ghost" }) {
  const t = resolveTheme(theme);
  const style = variant === "primary"
    ? { background: t.accentColor, color: "#fff", borderRadius: btnRadius(t) }
    : { color: t.accentColor, border: `1px solid color-mix(in srgb, ${t.accentColor} 40%, ${t.backgroundColor})`, borderRadius: btnRadius(t) };
  return <span className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-[13.5px] font-semibold ${className}`} style={style}>{children}</span>;
}

export function Badge({ theme, className = "", children = "Badge", tone = "accent" }: Base & { children?: React.ReactNode; tone?: "accent" | "neutral" }) {
  const t = resolveTheme(theme);
  const style = tone === "accent"
    ? { background: `color-mix(in srgb, ${t.accentColor} 14%, ${t.backgroundColor})`, color: t.accentColor }
    : { background: t.surfaceColor, color: t.textColor, border: `1px solid ${t.borderColor}` };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${className}`} style={style}>{children}</span>;
}
