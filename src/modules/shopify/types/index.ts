// Shopify Builder — core types. Isolated from the standard website/section
// library: the OUTPUT here is Shopify-native (Liquid + JSON templates + theme
// settings), not React sections. See src/modules/shopify/README.md.

/** A reusable colour scheme (Dawn model) — a section picks one by id. */
export interface ColorScheme {
  id: string; // "scheme-1"
  background: string;
  text: string;
  button: string; // primary button background / brand
  buttonText: string;
  secondary: string; // accent
  border: string;
}

/** Brand design tokens shared from Flowfreak, mapped to Shopify theme settings.
 *  The first 8 fields are the stable core (back-compat); the rest are optional
 *  Dawn-grade controls with sensible fallbacks. */
export interface BrandTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string; // e.g. "8px"
  spacingScale: string; // e.g. "1" | "1.2" (multiplier)

  // Optional Dawn-grade controls (defaults applied in design-tokens.ts).
  colorSchemes?: ColorScheme[]; // when omitted, 3 schemes are derived from the core colours
  headingScale?: number; // 1.0–1.4 — heading size multiplier
  bodyScale?: number; // 0.9–1.2 — body size multiplier
  buttonStyle?: "solid" | "outline";
  cardStyle?: "elevated" | "flat" | "bordered";
  animate?: boolean; // reveal-on-scroll animations
}

export type ShopifyTemplateType =
  | "index" | "product" | "collection" | "list-collections"
  | "page" | "cart" | "search" | "blog" | "article" | "404";

/** A single field in a section's {% schema %} settings. */
export interface ShopifySettingField {
  type:
    | "text"
    | "textarea"
    | "richtext"
    | "image_picker"
    | "url"
    | "checkbox"
    | "range"
    | "select"
    | "color"
    | "collection"
    | "product"
    | "color_scheme"
    | "video_url"
    | "header"
    | "paragraph";
  id?: string; // required for input types, omitted for "header"/"paragraph"
  label?: string;
  default?: string | number | boolean;
  info?: string;
  placeholder?: string;
  options?: { value: string; label: string }[]; // select
  min?: number; // range
  max?: number;
  step?: number;
  unit?: string;
  content?: string; // header/paragraph
}

export interface ShopifyBlockDefinition {
  type: string;
  name: string;
  limit?: number;
  settings: ShopifySettingField[];
}

export interface ShopifySectionPreset {
  name: string;
  settings?: Record<string, string | number | boolean>;
  blocks?: { type: string; settings?: Record<string, string | number | boolean> }[];
}

export interface ShopifySectionSchema {
  name: string;
  tag?: string;
  class?: string;
  limit?: number;
  settings: ShopifySettingField[];
  blocks?: ShopifyBlockDefinition[];
  max_blocks?: number;
  presets?: ShopifySectionPreset[];
  enabled_on?: { templates?: string[] };
}

/** A reusable Shopify section: real Liquid + schema; the React preview is
 *  editor-only and never exported. */
export interface ShopifySectionDefinition {
  /** Stable id AND the exported section filename (`sections/<id>.liquid`). */
  id: string;
  name: string;
  category: string;
  description: string;
  /** Liquid markup WITHOUT the {% schema %} block (the generator appends it). */
  liquid: string;
  schema: ShopifySectionSchema;
  defaultSettings: Record<string, string | number | boolean>;
  supportedTemplates: ShopifyTemplateType[];
  /** Selectable design variants. Each maps to a value of the section's `variant`
   *  select setting; the section's Liquid + CSS branch on it. The editor shows a
   *  prominent "Design" picker when this is present. */
  variants?: { id: string; label: string }[];
}

/** A placed section on a page, with its edited settings + blocks. */
export interface ShopifySectionInstance {
  key: string; // unique per page (JSON template order key)
  sectionId: string; // -> ShopifySectionDefinition.id
  settings?: Record<string, string | number | boolean>;
  blocks?: { key: string; type: string; settings?: Record<string, string | number | boolean> }[];
  disabled?: boolean;
}

export interface ShopifyPage {
  template: ShopifyTemplateType;
  /** Ordered section instances that make up this page's JSON template. */
  sections: ShopifySectionInstance[];
  /** For "page" templates: the CMS page handle (e.g. "about", "faq"). */
  handle?: string;
}

export interface ShopifyProjectInput {
  storeName: string;
  themeName?: string;
  themeVersion?: string;
  currency?: string;
  brand: BrandTokens;
  pages: ShopifyPage[];
}

/** One file in the generated theme directory. */
export interface GeneratedThemeFile {
  /** Theme-relative path, e.g. "sections/hero.liquid", "config/settings_schema.json". */
  path: string;
  contents: string;
}

export interface ThemeValidationIssue {
  level: "error" | "warning";
  path?: string;
  message: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  issues: ThemeValidationIssue[];
}

/** Future Shopify integration surface — no implementation yet (spec §13). */
export interface ShopifyThemeSummary {
  id: string;
  name: string;
  role: "main" | "unpublished" | "demo";
}
export interface ShopifyDeploymentProvider {
  connectStore(): Promise<void>;
  uploadTheme(themePath: string): Promise<string>;
  publishTheme(themeId: string): Promise<void>;
  getThemes(): Promise<ShopifyThemeSummary[]>;
}
