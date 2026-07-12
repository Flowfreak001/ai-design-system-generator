// Deterministic Shopify theme generator: project data -> a full theme
// directory (GeneratedThemeFile[]). Same input ALWAYS yields the same output
// (stable key order, no timestamps, no DB ids in output).

import type { GeneratedThemeFile, ShopifyPage, ShopifyProjectInput, ShopifySectionInstance, ShopifyTemplateType } from "../types";
import { ALL_SECTIONS, STRUCTURAL_SECTIONS, getSection } from "../sections";

/** The template set every exported theme MUST include for a complete store, and
 *  the "main" section injected into each. index/page carry only user content. */
const TEMPLATE_MAIN: Partial<Record<ShopifyTemplateType, string>> = {
  product: "main-product",
  collection: "main-collection",
  "list-collections": "main-list-collections",
  cart: "main-cart",
  search: "main-search",
  blog: "main-blog",
  article: "main-article",
  page: "main-page",
};
const REQUIRED_TEMPLATES: ShopifyTemplateType[] = [
  "index", "product", "collection", "list-collections", "cart", "search", "blog", "article", "page",
];

/** Merge the user's pages with the required template set, injecting each
 *  template's main section so the export is a complete, installable store. */
export function resolveTemplatePages(input: ShopifyProjectInput): ShopifyPage[] {
  const byKey = new Map<string, ShopifyPage>();
  for (const p of input.pages) byKey.set(`${p.template}|${p.handle ?? ""}`, p);

  const pages: ShopifyPage[] = [];
  for (const template of REQUIRED_TEMPLATES) {
    const existing = byKey.get(`${template}|`);
    let sections: ShopifySectionInstance[] = existing ? [...existing.sections] : [];
    const mainId = TEMPLATE_MAIN[template];
    if (mainId && !sections.some((sec) => sec.sectionId === mainId)) {
      sections.unshift({ key: "main", sectionId: mainId });
    }
    // Safety net: a template that would render EMPTY gets a sensible default so
    // the storefront is never blank (the homepage especially must have content).
    if (sections.length === 0) {
      if (template === "index") {
        sections = [
          {
            key: "intro", sectionId: "custom-section",
            settings: { content_width: "normal", padding_top: 72, padding_bottom: 40 },
            blocks: [
              { key: "b-eyebrow", type: "heading", settings: { eyebrow: "Welcome", text: "Your store, your way", size: 48, align: "center" } },
              { key: "b-text", type: "text", settings: { text: "<p>Build every section exactly how you want it. Start here.</p>", align: "center" } },
              { key: "b-btn", type: "button", settings: { label: "Shop now", align: "center" } },
            ],
          },
          { key: "featured", sectionId: "featured-collection", settings: { heading: "Featured products" } },
        ];
      }
    }
    pages.push({ template, sections });
  }
  // Extra custom page templates (page.<handle>) the user added.
  for (const p of input.pages) {
    if (p.handle) pages.push(p);
  }
  return pages;
}
import { themeCoreFiles } from "../core/theme-core";
import { brandToSettingsData, themeSettingsSchema } from "../core/design-tokens";

/** Serialise a JS object to a stable JSON string (sorted keys) for determinism. */
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) => v, 2);
}

/** Render a section file: the definition's Liquid + its {% schema %} block. */
export function generateLiquidSection(def: (typeof ALL_SECTIONS)[number]): GeneratedThemeFile {
  const schema = JSON.stringify(def.schema, null, 2);
  return { path: `sections/${def.id}.liquid`, contents: `${def.liquid}\n{% schema %}\n${schema}\n{% endschema %}\n` };
}

type SettingValue = string | number | boolean;
type SettingField = { type: string; id?: string; default?: SettingValue; options?: { value: string }[]; min?: number; max?: number; step?: number };

/** Coerce ONE user-entered setting value to a Shopify-safe form. Shopify's
 *  ZIP-upload validation silently DROPS a whole JSON template over a single
 *  invalid value (unwrapped richtext, out-of-range number, unknown select
 *  option), so everything user-editable is sanitized at generation time. */
function sanitizeSettingValue(field: SettingField, value: SettingValue): SettingValue {
  switch (field.type) {
    case "richtext": {
      const s = String(value).trim();
      if (s === "") return "";
      return s.startsWith("<") ? s : `<p>${s}</p>`;
    }
    case "range": {
      let n = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(n)) n = typeof field.default === "number" ? field.default : field.min ?? 0;
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const step = field.step && field.step > 0 ? field.step : 1;
      n = Math.min(max, Math.max(min, n));
      // snap onto the step grid (float-safe)
      n = min + Math.round((n - min) / step) * step;
      n = Math.min(max, Number(n.toFixed(4)));
      return n;
    }
    case "select": {
      const allowed = (field.options ?? []).map((o) => o.value);
      if (allowed.length === 0) return value;
      if (allowed.includes(String(value))) return String(value);
      return typeof field.default === "string" && allowed.includes(field.default) ? field.default : allowed[0];
    }
    case "checkbox":
      return typeof value === "boolean" ? value : String(value) === "true";
    default:
      return value;
  }
}

/** Sanitize a settings record against a schema-field list: unknown keys are
 *  dropped (Shopify rejects them), every kept value is coerced to a safe form. */
function sanitizeSettings(fields: SettingField[], settings: Record<string, SettingValue>): Record<string, SettingValue> {
  const byId = new Map(fields.filter((f) => f.id).map((f) => [f.id as string, f]));
  const out: Record<string, SettingValue> = {};
  for (const [key, value] of Object.entries(settings)) {
    const field = byId.get(key);
    if (!field) continue; // not in schema -> would invalidate the template
    out[key] = sanitizeSettingValue(field, value);
  }
  return out;
}

/** Build a JSON template (Online Store 2.0) for a page from its instances. */
export function generateJsonTemplate(page: ShopifyPage): GeneratedThemeFile {
  const sections: Record<string, unknown> = {};
  const order: string[] = [];
  page.sections.forEach((inst: ShopifySectionInstance, i) => {
    const def = getSection(inst.sectionId);
    if (!def) return; // unknown ids are dropped (validation reports them)
    const key = inst.key || `${inst.sectionId}_${i}`;
    const settings = sanitizeSettings(
      def.schema.settings as SettingField[],
      { ...def.defaultSettings, ...(inst.settings ?? {}) },
    );
    const entry: Record<string, unknown> = { type: def.id, settings };
    if (inst.blocks && inst.blocks.length) {
      const blockDefs = new Map((def.schema.blocks ?? []).map((b) => [b.type, b.settings as SettingField[]]));
      const blocks: Record<string, unknown> = {};
      const blockOrder: string[] = [];
      inst.blocks.forEach((b, bi) => {
        const blockFields = blockDefs.get(b.type);
        if (!blockFields) return; // unknown block type -> template would be dropped on import
        const bk = b.key || `${b.type}_${bi}`;
        blocks[bk] = { type: b.type, settings: sanitizeSettings(blockFields, b.settings ?? {}) };
        blockOrder.push(bk);
      });
      if (blockOrder.length) {
        entry.blocks = blocks;
        entry.block_order = blockOrder;
      }
    }
    if (inst.disabled) entry.disabled = true;
    sections[key] = entry;
    order.push(key);
  });
  const templateName = page.template === "page" && page.handle ? `page.${page.handle}` : page.template;
  return { path: `templates/${templateName}.json`, contents: stableJson({ sections, order }) };
}

/** config/settings_schema.json + config/settings_data.json from brand tokens. */
export function generateThemeSettings(input: ShopifyProjectInput): GeneratedThemeFile[] {
  const schema = themeSettingsSchema();
  const current = brandToSettingsData(input.brand);
  return [
    { path: "config/settings_schema.json", contents: stableJson(schema) },
    { path: "config/settings_data.json", contents: stableJson({ current }) },
  ];
}

/** Full theme directory for a project. Deterministic. */
export function generateShopifyTheme(input: ShopifyProjectInput): GeneratedThemeFile[] {
  const files: GeneratedThemeFile[] = [];

  // 1. Core skeleton (layout, assets, snippets, locales, 404).
  files.push(...themeCoreFiles());

  // 2. Structural sections (always present, referenced by the header/footer groups).
  for (const def of STRUCTURAL_SECTIONS) files.push(generateLiquidSection(def));

  // 3. Resolve the full template set (required storefront templates + user pages,
  //    with each template's main section injected) so the export is a complete store.
  const pages = resolveTemplatePages(input);

  // 4. Content + main section files — only the ones actually used across templates.
  const usedIds = new Set<string>();
  for (const page of pages) for (const inst of page.sections) usedIds.add(inst.sectionId);
  for (const id of usedIds) {
    const def = getSection(id);
    if (def && !STRUCTURAL_SECTIONS.includes(def)) files.push(generateLiquidSection(def));
  }

  // 5. JSON templates per page.
  for (const page of pages) files.push(generateJsonTemplate(page));

  // 5. Theme settings from brand tokens.
  files.push(...generateThemeSettings(input));

  // Stable order by path so the output (and any ZIP) is deterministic.
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return files;
}
