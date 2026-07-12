// Maps Flowfreak BrandTokens -> Shopify theme settings (config/*) and the
// CSS-variable block injected into the theme. Deterministic: same tokens ->
// same output.

import type { BrandTokens } from "../types";

export const DEFAULT_BRAND_TOKENS: BrandTokens = {
  primaryColor: "#111827",
  secondaryColor: "#2563eb",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  headingFont: "Inter, system-ui, sans-serif",
  bodyFont: "Inter, system-ui, sans-serif",
  borderRadius: "10px",
  spacingScale: "1",
};

/** The `settings_data.json` "current" object, seeded from brand tokens. */
export function brandToSettingsData(tokens: BrandTokens): Record<string, string | number | boolean> {
  return {
    color_primary: tokens.primaryColor,
    color_secondary: tokens.secondaryColor,
    color_background: tokens.backgroundColor,
    color_text: tokens.textColor,
    heading_font_stack: tokens.headingFont,
    body_font_stack: tokens.bodyFont,
    border_radius: parseInt(tokens.borderRadius, 10) || 10,
    spacing_scale: parseFloat(tokens.spacingScale) || 1,
    page_width: 1200,
    button_style: "solid",
  };
}

/** CSS custom properties written from theme settings into theme.liquid <head>.
 *  Uses Liquid so a merchant editing settings in the Shopify editor updates them. */
export function themeCssVariables(): string {
  return `:root{
  --color-primary: {{ settings.color_primary }};
  --color-secondary: {{ settings.color_secondary }};
  --color-background: {{ settings.color_background }};
  --color-text: {{ settings.color_text }};
  --font-heading: {{ settings.heading_font_stack }};
  --font-body: {{ settings.body_font_stack }};
  --radius: {{ settings.border_radius }}px;
  --space: calc(8px * {{ settings.spacing_scale }});
  --page-width: {{ settings.page_width }}px;
}`;
}

/** The theme-level settings schema (config/settings_schema.json content). */
export function themeSettingsSchema(): unknown[] {
  return [
    {
      name: "theme_info",
      theme_name: "Flowfreak Storefront",
      theme_version: "1.0.0",
      theme_author: "Flowfreak",
      theme_documentation_url: "https://flowfreak.app",
    },
    {
      name: "Colors",
      settings: [
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
      ],
    },
    {
      name: "Layout",
      settings: [
        { type: "range", id: "page_width", min: 960, max: 1600, step: 20, unit: "px", label: "Page width", default: 1200 },
        { type: "range", id: "border_radius", min: 0, max: 28, step: 1, unit: "px", label: "Corner radius", default: 10 },
        { type: "range", id: "spacing_scale", min: 0.8, max: 1.6, step: 0.1, label: "Spacing scale", default: 1 },
        {
          type: "select", id: "button_style", label: "Button style", default: "solid",
          options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }],
        },
      ],
    },
  ];
}
