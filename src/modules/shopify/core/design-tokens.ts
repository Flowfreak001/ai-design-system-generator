// Maps Flowfreak BrandTokens -> Shopify theme settings (config/*) and the
// CSS-variable block injected into the theme. Deterministic: same tokens ->
// same output. Dawn-grade: colour schemes, typography scale, buttons/cards,
// layout, animations.

import type { BrandTokens, ColorScheme } from "../types";

export const DEFAULT_BRAND_TOKENS: BrandTokens = {
  primaryColor: "#111827",
  secondaryColor: "#2563eb",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  borderRadius: "10px",
  spacingScale: "1",
  headingScale: 1.1,
  bodyScale: 1,
  buttonStyle: "solid",
  cardStyle: "bordered",
  animate: true,
};

/** Derive three ready colour schemes from the core brand colours when the
 *  project hasn't defined its own. scheme-1 light, scheme-2 inverse/bold,
 *  scheme-3 accent. */
export function defaultColorSchemes(t: BrandTokens): ColorScheme[] {
  return [
    { id: "scheme-1", background: t.backgroundColor, text: t.textColor, button: t.primaryColor, buttonText: "#ffffff", secondary: t.secondaryColor, border: "#e5e7eb" },
    { id: "scheme-2", background: t.primaryColor, text: "#ffffff", button: t.secondaryColor, buttonText: "#ffffff", secondary: "#ffffff", border: "rgba(255,255,255,0.16)" },
    { id: "scheme-3", background: "#f6f6f4", text: t.textColor, button: t.primaryColor, buttonText: "#ffffff", secondary: t.secondaryColor, border: "#e6e3dd" },
  ];
}

export function resolveSchemes(t: BrandTokens): ColorScheme[] {
  return t.colorSchemes?.length ? t.colorSchemes : defaultColorSchemes(t);
}

/** The `settings_data.json` "current" object, seeded from brand tokens. */
export function brandToSettingsData(tokens: BrandTokens): Record<string, unknown> {
  const schemes = resolveSchemes(tokens);
  const color_schemes: Record<string, unknown> = {};
  for (const s of schemes) {
    color_schemes[s.id] = {
      settings: {
        background: s.background,
        text: s.text,
        button: s.button,
        button_label: s.buttonText,
        secondary: s.secondary,
        border: s.border,
      },
    };
  }
  return {
    color_primary: tokens.primaryColor,
    color_secondary: tokens.secondaryColor,
    color_background: tokens.backgroundColor,
    color_text: tokens.textColor,
    heading_font_stack: tokens.headingFont,
    body_font_stack: tokens.bodyFont,
    heading_scale: tokens.headingScale ?? 1.1,
    body_scale: tokens.bodyScale ?? 1,
    border_radius: parseInt(tokens.borderRadius, 10) || 10,
    spacing_scale: parseFloat(tokens.spacingScale) || 1,
    page_width: 1200,
    button_style: tokens.buttonStyle ?? "solid",
    card_style: tokens.cardStyle ?? "bordered",
    animations_reveal: tokens.animate !== false,
    color_schemes,
  };
}

/** CSS custom properties written from theme settings into theme.liquid <head>.
 *  Root globals keep the legacy `--color-*` names (base sections rely on them);
 *  a per-scheme class overrides them locally so any section can opt into a scheme
 *  with `class="color-{{ section.settings.color_scheme }}"`. */
export function themeCssVariables(): string {
  return `:root{
  --color-primary: {{ settings.color_primary }};
  --color-secondary: {{ settings.color_secondary }};
  --color-background: {{ settings.color_background }};
  --color-text: {{ settings.color_text }};
  --color-border: #e5e7eb;
  --color-on-primary: #ffffff;
  --font-heading: {{ settings.heading_font_stack }};
  --font-body: {{ settings.body_font_stack }};
  --heading-scale: {{ settings.heading_scale | default: 1.1 }};
  --body-scale: {{ settings.body_scale | default: 1.0 }};
  --radius: {{ settings.border_radius }}px;
  --space: calc(8px * {{ settings.spacing_scale }});
  --page-width: {{ settings.page_width }}px;
}
{% for scheme in settings.color_schemes %}{%- assign s = scheme.value.settings -%}
.color-{{ scheme.id }}{
  --color-background: {{ s.background }};
  --color-text: {{ s.text }};
  --color-primary: {{ s.button }};
  --color-on-primary: {{ s.button_label }};
  --color-secondary: {{ s.secondary }};
  --color-border: {{ s.border }};
  background: {{ s.background }};
  color: {{ s.text }};
}
{% endfor %}`;
}

/** The theme-level settings schema (config/settings_schema.json content). */
export function themeSettingsSchema(): unknown[] {
  return [
    {
      name: "theme_info",
      theme_name: "Flowfreak Storefront",
      theme_version: "2.0.0",
      theme_author: "Flowfreak",
      theme_documentation_url: "https://flowfreak.app",
    },
    {
      name: "Colors",
      settings: [
        { type: "paragraph", content: "Colour schemes let each section pick its own palette." },
        {
          type: "color_scheme_group",
          id: "color_schemes",
          definition: [
            { type: "color", id: "background", label: "Background", default: "#ffffff" },
            { type: "color", id: "text", label: "Text", default: "#121212" },
            { type: "color", id: "button", label: "Primary button", default: "#121212" },
            { type: "color", id: "button_label", label: "Primary button label", default: "#ffffff" },
            { type: "color", id: "secondary", label: "Accent", default: "#2563eb" },
            { type: "color", id: "border", label: "Border", default: "#e5e7eb" },
          ],
          role: {
            background: { solid: "background" },
            text: "text",
            primary_button: "button",
            on_primary_button: "button_label",
            secondary_button: "background",
            on_secondary_button: "text",
          },
        },
        { type: "header", content: "Brand colours" },
        { type: "color", id: "color_primary", label: "Primary", default: DEFAULT_BRAND_TOKENS.primaryColor },
        { type: "color", id: "color_secondary", label: "Accent", default: DEFAULT_BRAND_TOKENS.secondaryColor },
        { type: "color", id: "color_background", label: "Background", default: DEFAULT_BRAND_TOKENS.backgroundColor },
        { type: "color", id: "color_text", label: "Text", default: DEFAULT_BRAND_TOKENS.textColor },
      ],
    },
    {
      name: "Typography",
      settings: [
        { type: "text", id: "heading_font_stack", label: "Heading font stack", default: DEFAULT_BRAND_TOKENS.headingFont },
        { type: "text", id: "body_font_stack", label: "Body font stack", default: DEFAULT_BRAND_TOKENS.bodyFont },
        { type: "range", id: "heading_scale", min: 1, max: 1.4, step: 0.1, label: "Heading scale", default: 1.1 },
        { type: "range", id: "body_scale", min: 0.9, max: 1.2, step: 0.1, label: "Body scale", default: 1 },
      ],
    },
    {
      name: "Layout",
      settings: [
        { type: "range", id: "page_width", min: 960, max: 1600, step: 20, unit: "px", label: "Page width", default: 1200 },
        { type: "range", id: "border_radius", min: 0, max: 28, step: 1, unit: "px", label: "Corner radius", default: 10 },
        { type: "range", id: "spacing_scale", min: 0.8, max: 1.6, step: 0.1, label: "Spacing scale", default: 1 },
      ],
    },
    {
      name: "Buttons & cards",
      settings: [
        { type: "select", id: "button_style", label: "Button style", default: "solid", options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }] },
        { type: "select", id: "card_style", label: "Card style", default: "bordered", options: [{ value: "elevated", label: "Elevated" }, { value: "flat", label: "Flat" }, { value: "bordered", label: "Bordered" }] },
      ],
    },
    {
      name: "Animations",
      settings: [
        { type: "checkbox", id: "animations_reveal", label: "Reveal sections on scroll", default: true },
      ],
    },
  ];
}
