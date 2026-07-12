// Deterministic Shopify theme generator: project data -> a full theme
// directory (GeneratedThemeFile[]). Same input ALWAYS yields the same output
// (stable key order, no timestamps, no DB ids in output).

import type { GeneratedThemeFile, ShopifyPage, ShopifyProjectInput, ShopifySectionInstance } from "../types";
import { ALL_SECTIONS, STRUCTURAL_SECTIONS, getSection } from "../sections";
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

/** Build a JSON template (Online Store 2.0) for a page from its instances. */
export function generateJsonTemplate(page: ShopifyPage): GeneratedThemeFile {
  const sections: Record<string, unknown> = {};
  const order: string[] = [];
  page.sections.forEach((inst: ShopifySectionInstance, i) => {
    const def = getSection(inst.sectionId);
    if (!def) return; // unknown ids are dropped (validation reports them)
    const key = inst.key || `${inst.sectionId}_${i}`;
    const settings = { ...def.defaultSettings, ...(inst.settings ?? {}) };
    const entry: Record<string, unknown> = { type: def.id, settings };
    if (inst.blocks && inst.blocks.length) {
      const blocks: Record<string, unknown> = {};
      const blockOrder: string[] = [];
      inst.blocks.forEach((b, bi) => {
        const bk = b.key || `${b.type}_${bi}`;
        blocks[bk] = { type: b.type, settings: b.settings ?? {} };
        blockOrder.push(bk);
      });
      entry.blocks = blocks;
      entry.block_order = blockOrder;
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

  // 2. Structural sections (always present, referenced by theme.liquid).
  for (const def of STRUCTURAL_SECTIONS) files.push(generateLiquidSection(def));

  // 3. Content section files — only the ones actually used across pages.
  const usedIds = new Set<string>();
  for (const page of input.pages) for (const inst of page.sections) usedIds.add(inst.sectionId);
  for (const id of usedIds) {
    const def = getSection(id);
    if (def && !STRUCTURAL_SECTIONS.includes(def)) files.push(generateLiquidSection(def));
  }

  // 4. JSON templates per page.
  for (const page of input.pages) files.push(generateJsonTemplate(page));

  // 5. Theme settings from brand tokens.
  files.push(...generateThemeSettings(input));

  // Stable order by path so the output (and any ZIP) is deterministic.
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return files;
}
