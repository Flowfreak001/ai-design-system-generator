// Section design presets — one-click bundles of theme overrides that give each
// section a distinct look while staying on-brand. A preset is a function of the
// project theme so accent-based presets (Soft accent, Bold CTA, Gradient) derive
// from the brand accent rather than a hardcoded hue. Applied as a section's
// themeOverride; "Default brand" clears overrides (inherit the project theme).

import type { SectionTheme } from "@/components/sections/types";

export type PresetName =
  | "Default brand" | "Light clean" | "Dark contrast" | "Soft accent"
  | "Bold CTA" | "Editorial" | "Minimal" | "Premium card" | "Gradient background";

export const PRESET_NAMES: PresetName[] = [
  "Default brand", "Light clean", "Dark contrast", "Soft accent",
  "Bold CTA", "Editorial", "Minimal", "Premium card", "Gradient background",
];

type Override = Partial<SectionTheme>;

export const SECTION_PRESETS: Record<PresetName, (t: SectionTheme) => Override> = {
  "Default brand": () => ({}),
  "Light clean": () => ({
    backgroundColor: "#ffffff", surfaceColor: "#f6f7f9", textColor: "#111827",
    mutedTextColor: "#6b7280", borderColor: "#e6e8ec", shadow: "0 1px 3px rgba(17,24,39,0.08)",
  }),
  "Dark contrast": () => ({
    backgroundColor: "#0b0b0f", surfaceColor: "#17181c", textColor: "#ffffff",
    mutedTextColor: "rgba(255,255,255,0.66)", borderColor: "rgba(255,255,255,0.14)",
    buttonTextColor: "#ffffff",
  }),
  "Soft accent": (t) => ({
    backgroundColor: t.accentColor + "14", surfaceColor: "#ffffff", textColor: "#111827",
    mutedTextColor: "#5b6470", borderColor: t.accentColor + "33",
  }),
  "Bold CTA": (t) => ({
    backgroundColor: t.accentColor, surfaceColor: "rgba(255,255,255,0.12)", textColor: "#ffffff",
    mutedTextColor: "rgba(255,255,255,0.82)", buttonBgColor: "#ffffff", buttonTextColor: t.accentColor,
    borderColor: "rgba(255,255,255,0.28)",
  }),
  "Editorial": () => ({
    headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'Manrope', system-ui, sans-serif",
    backgroundColor: "#fbfaf8", surfaceColor: "#ffffff", textColor: "#1c1a17",
    mutedTextColor: "#6b6459", borderColor: "#e7e1d8", radius: "6px",
  }),
  "Minimal": () => ({
    backgroundColor: "#ffffff", surfaceColor: "#ffffff", textColor: "#111111",
    mutedTextColor: "#8a8a8a", borderColor: "#ececec", radius: "4px", shadow: "none",
  }),
  "Premium card": () => ({
    backgroundColor: "#0e1116", surfaceColor: "#171b22", textColor: "#f5f5f7",
    mutedTextColor: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.1)",
    radius: "18px", shadow: "0 30px 80px rgba(0,0,0,0.35)",
  }),
  "Gradient background": (t) => ({
    backgroundColor: "linear-gradient(135deg, " + t.accentColor + "22, " + t.accentColor + "55)",
    surfaceColor: "#ffffff", textColor: "#111827", mutedTextColor: "#5b6470",
    borderColor: t.accentColor + "33",
  }),
};

/** Suggest a preset for a section type/kind — used when generating sections so
 *  each type gets a fitting look instead of all defaulting to the brand theme. */
export function presetForKind(kind?: string): PresetName {
  const k = (kind ?? "").toLowerCase();
  if (/hero|banner/.test(k)) return "Dark contrast";
  if (/cta|call.to.action|newsletter|subscribe/.test(k)) return "Bold CTA";
  if (/pricing/.test(k)) return "Premium card";
  if (/testimonial|review/.test(k)) return "Soft accent";
  if (/footer|site.header|navbar|header/.test(k)) return "Dark contrast";
  if (/feature|services|logos|gallery|process|stats/.test(k)) return "Light clean";
  if (/about|editorial|blog|content/.test(k)) return "Editorial";
  return "Default brand";
}
