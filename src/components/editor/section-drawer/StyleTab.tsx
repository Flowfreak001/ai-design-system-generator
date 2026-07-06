"use client";

// Per-section Style tab — overrides theme tokens (fonts, colours, radius) for
// just this section, merged over the project theme at render. Leaving a field
// blank means "inherit from the project theme".

import type { CanvasSection } from "@/lib/canvas";
import type { SectionTheme } from "@/components/sections/types";
import { PRESET_NAMES, SECTION_PRESETS } from "@/lib/section-library/section-presets";
import { DEFAULT_SECTION_THEME } from "@/components/sections/section-theme";

const FONTS = ["Space Grotesk", "Sora", "Manrope", "Poppins", "DM Sans", "Inter", "Playfair Display", "Fraunces"];
const SHADOWS: { label: string; value: string }[] = [
  { label: "None", value: "none" },
  { label: "Subtle", value: "0 1px 3px rgba(17,24,39,0.08)" },
  { label: "Medium", value: "0 10px 30px rgba(0,0,0,0.10)" },
  { label: "Large", value: "0 30px 80px rgba(0,0,0,0.18)" },
];
const ANIMATIONS = ["smooth", "spring", "subtle", "none"];
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

export function StyleTab({ section, onPatch, base, canReset, onResetToLibrary }: {
  section: CanvasSection;
  onPatch: (patch: Partial<CanvasSection>) => void;
  base?: SectionTheme;
  canReset?: boolean;
  onResetToLibrary?: () => void;
}) {
  const ov = (section.themeOverride ?? {}) as Partial<SectionTheme>;
  const projectTheme = base ?? DEFAULT_SECTION_THEME;

  const set = (key: keyof SectionTheme, value: string | undefined) => {
    const next: Record<string, string> = { ...(ov as Record<string, string>) };
    if (!value) delete next[key as string];
    else next[key as string] = value;
    onPatch({ themeOverride: Object.keys(next).length ? (next as Partial<SectionTheme>) : undefined });
  };

  const applyPreset = (name: string) => {
    const preset = SECTION_PRESETS[name as keyof typeof SECTION_PRESETS];
    if (!preset) return;
    const values = preset(projectTheme);
    onPatch({ themeOverride: Object.keys(values).length ? values : undefined });
  };

  const radiusPx = ov.radius ? parseInt(ov.radius, 10) : "";
  const spacingPx = ov.spacing ? parseInt(ov.spacing, 10) : "";

  return (
    <div className="grid gap-4">
      <p className="text-[11.5px] leading-relaxed text-muted">
        Style just this section — it starts from the project theme, and each field you set overrides it. Leave blank to inherit.
      </p>

      {/* Design preset */}
      <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Design preset
        <select value="" onChange={(e) => e.target.value && applyPreset(e.target.value)} className={`mt-1 normal-case ${inputCls}`}>
          <option value="">Apply a preset…</option>
          {PRESET_NAMES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>

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

      {/* Radius + section padding */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Corner radius (px)
          <input type="number" min={0} max={48} value={radiusPx} placeholder="Inherit" onChange={(e) => set("radius", e.target.value ? `${e.target.value}px` : undefined)} className={`mt-1 ${inputCls}`} />
        </label>
        <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Section padding (px)
          <input type="number" min={0} max={160} step={4} value={spacingPx} placeholder="Inherit" onChange={(e) => set("spacing", e.target.value ? `${e.target.value}px` : undefined)} className={`mt-1 ${inputCls}`} />
        </label>
      </div>

      {/* Shadow + animation */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Shadow
          <select value={ov.shadow ?? ""} onChange={(e) => set("shadow", e.target.value || undefined)} className={`mt-1 normal-case ${inputCls}`}>
            <option value="">Inherit</option>
            {SHADOWS.map((s) => <option key={s.label} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-medium uppercase tracking-wide text-faint">Animation
          <select value={ov.animationStyle ?? ""} onChange={(e) => set("animationStyle", e.target.value || undefined)} className={`mt-1 normal-case ${inputCls}`}>
            <option value="">Inherit</option>
            {ANIMATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        {Object.keys(ov).length > 0 && (
          <button type="button" onClick={() => onPatch({ themeOverride: undefined })} className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink">
            Clear section styles
          </button>
        )}
        {canReset && onResetToLibrary && (
          <button type="button" onClick={onResetToLibrary} title="Restore this section's content, code, and styles from its Library template" className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-danger">
            Reset to Library default
          </button>
        )}
      </div>
      {section.isCustomized && (
        <p className="text-[11px] text-faint">Customized — your edits are saved on this section and are never overwritten by Library updates.</p>
      )}
    </div>
  );
}
