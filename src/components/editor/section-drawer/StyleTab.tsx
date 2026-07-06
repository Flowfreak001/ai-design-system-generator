"use client";

// Per-section Style tab — overrides theme tokens (fonts, colours, radius) for
// just this section, merged over the project theme at render. Leaving a field
// blank means "inherit from the project theme".

import type { CanvasSection } from "@/lib/canvas";
import type { SectionTheme } from "@/components/sections/types";

const FONTS = ["Space Grotesk", "Sora", "Manrope", "Poppins", "DM Sans", "Inter", "Playfair Display", "Fraunces"];
const fam = (name: string) => `'${name}', system-ui, sans-serif`;
const fontName = (v?: string) => (v ? v.replace(/^['"]?/, "").replace(/['"]?,.*$/, "") : "");

const COLORS: { key: keyof SectionTheme; label: string }[] = [
  { key: "accentColor", label: "Accent" },
  { key: "buttonBgColor", label: "Button background" },
  { key: "buttonTextColor", label: "Button text" },
  { key: "backgroundColor", label: "Background" },
  { key: "textColor", label: "Text" },
  { key: "mutedTextColor", label: "Muted text" },
  { key: "borderColor", label: "Border" },
  { key: "surfaceColor", label: "Surface / card" },
];

const inputCls = "w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-accent";

export function StyleTab({ section, onPatch }: {
  section: CanvasSection;
  onPatch: (patch: Partial<CanvasSection>) => void;
}) {
  const ov = (section.themeOverride ?? {}) as Partial<SectionTheme>;

  const set = (key: keyof SectionTheme, value: string | undefined) => {
    const next: Record<string, string> = { ...(ov as Record<string, string>) };
    if (!value) delete next[key as string];
    else next[key as string] = value;
    onPatch({ themeOverride: Object.keys(next).length ? (next as Partial<SectionTheme>) : undefined });
  };

  const radiusPx = ov.radius ? parseInt(ov.radius, 10) : "";

  return (
    <div className="grid gap-4">
      <p className="text-[11.5px] leading-relaxed text-muted">
        Style just this section. Leave a field blank to inherit the project theme.
      </p>

      {/* Fonts */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Heading font
          <select value={fontName(ov.headingFont)} onChange={(e) => set("headingFont", e.target.value ? fam(e.target.value) : undefined)} className={`mt-1 normal-case ${inputCls}`}>
            <option value="">Inherit</option>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Body font
          <select value={fontName(ov.bodyFont)} onChange={(e) => set("bodyFont", e.target.value ? fam(e.target.value) : undefined)} className={`mt-1 normal-case ${inputCls}`}>
            <option value="">Inherit</option>
            {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>

      {/* Colours */}
      <div className="grid gap-2.5">
        {COLORS.map(({ key, label }) => {
          const val = (ov[key] as string) ?? "";
          const pick = /^#([0-9a-f]{6})$/i.test(val) ? val : "#888888";
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-[12px] text-body">{label}</span>
              <input value={val} placeholder="Inherit" onChange={(e) => set(key, e.target.value || undefined)} className={`flex-1 font-mono text-[11.5px] ${inputCls}`} />
              <input type="color" value={pick} onChange={(e) => set(key, e.target.value)} aria-label={`Pick ${label}`} className="h-7 w-7 shrink-0 cursor-pointer rounded border border-line" />
            </div>
          );
        })}
      </div>

      {/* Radius */}
      <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Corner radius (px)
        <input type="number" min={0} max={48} value={radiusPx} placeholder="Inherit" onChange={(e) => set("radius", e.target.value ? `${e.target.value}px` : undefined)} className={`mt-1 ${inputCls}`} />
      </label>

      {Object.keys(ov).length > 0 && (
        <button type="button" onClick={() => onPatch({ themeOverride: undefined })} className="justify-self-start rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink">
          Clear section styles
        </button>
      )}
    </div>
  );
}
