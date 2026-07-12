// Validates a generated theme directory before export. Blocks export on any
// "error"; "warning" is advisory.

import type { GeneratedThemeFile, ShopifyProjectInput, ThemeValidationResult, ThemeValidationIssue } from "../types";
import { getSection } from "../sections";

const REQUIRED_FILES = [
  "layout/theme.liquid",
  "layout/password.liquid",
  "config/settings_schema.json",
  "config/settings_data.json",
  "sections/header.liquid",
  "sections/footer.liquid",
  "sections/announcement-bar.liquid",
  "sections/header-group.json",
  "sections/footer-group.json",
  "locales/en.default.json",
  "templates/password.liquid",
  "templates/gift_card.liquid",
];

// A complete, installable store needs these templates.
const REQUIRED_TEMPLATES = [
  "templates/index.json",
  "templates/product.json",
  "templates/collection.json",
  "templates/cart.json",
  "templates/search.json",
  "templates/page.json",
  "templates/404.json",
];

/** Structural checks on the generated files (self-consistency). */
export function validateShopifyTheme(files: GeneratedThemeFile[]): ThemeValidationResult {
  const issues: ThemeValidationIssue[] = [];
  const byPath = new Map(files.map((f) => [f.path, f]));

  // Required files present.
  for (const req of REQUIRED_FILES) {
    if (!byPath.has(req)) issues.push({ level: "error", path: req, message: `Missing required file: ${req}` });
  }

  // Required storefront templates present (a complete, installable store).
  for (const req of REQUIRED_TEMPLATES) {
    if (!byPath.has(req)) issues.push({ level: "error", path: req, message: `Missing required template: ${req}` });
  }

  // theme.liquid MUST contain Shopify's mandatory objects or the upload is rejected.
  const themeLiquid = byPath.get("layout/theme.liquid")?.contents ?? "";
  if (!themeLiquid.includes("content_for_header")) issues.push({ level: "error", path: "layout/theme.liquid", message: "layout/theme.liquid must contain {{ content_for_header }}" });
  if (!themeLiquid.includes("content_for_layout")) issues.push({ level: "error", path: "layout/theme.liquid", message: "layout/theme.liquid must contain {{ content_for_layout }}" });

  // Unique filenames.
  const seen = new Set<string>();
  for (const f of files) {
    if (seen.has(f.path)) issues.push({ level: "error", path: f.path, message: `Duplicate file path: ${f.path}` });
    seen.add(f.path);
  }

  // Every section file has a valid {% schema %} JSON block.
  for (const f of files) {
    if (!f.path.startsWith("sections/") || !f.path.endsWith(".liquid")) continue;
    const m = f.contents.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
    if (!m) { issues.push({ level: "error", path: f.path, message: "Section is missing a {% schema %} block" }); continue; }
    try {
      const schema = JSON.parse(m[1].trim());
      if (!schema.name) issues.push({ level: "error", path: f.path, message: "Section schema is missing 'name'" });
      // Shopify's ZIP-upload validation is strict: an invalid setting default makes
      // the whole section invalid, and any JSON template referencing it is then
      // SILENTLY DROPPED on import (observed: templates/index.json). Catch the
      // known-fatal cases here so they can never ship.
      type Field = { type?: string; id?: string; default?: unknown; step?: number; min?: number; max?: number; options?: { value: string }[] };
      const allSettings: Field[] = [
        ...(schema.settings ?? []),
        ...(schema.blocks ?? []).flatMap((b: { settings?: unknown[] }) => b.settings ?? []),
      ];
      // ids must be unique within the section's settings, and within each block.
      for (const group of [schema.settings ?? [], ...(schema.blocks ?? []).map((b: { settings?: Field[] }) => b.settings ?? [])]) {
        const seen = new Set<string>();
        for (const st of group as Field[]) {
          if (!st.id) continue;
          if (seen.has(st.id)) issues.push({ level: "error", path: f.path, message: `duplicate setting id '${st.id}' in section schema` });
          seen.add(st.id);
        }
      }
      for (const st of allSettings) {
        if (st.type === "richtext" && typeof st.default === "string" && st.default !== "" && !/^<p[\s>]/.test(st.default.trim())) {
          issues.push({ level: "error", path: f.path, message: `richtext setting '${st.id}' default must be wrapped in <p> tags (Shopify rejects the section, then drops any template referencing it)` });
        }
        if (st.type === "range") {
          const { min = 0, max = 100, step = 1, default: def } = st;
          if (Math.round(step * 10) !== step * 10) {
            issues.push({ level: "error", path: f.path, message: `range setting '${st.id}' step must be divisible by 0.1` });
          }
          if (Math.abs(Math.round((max - min) / step) * step - (max - min)) > 1e-9) {
            issues.push({ level: "error", path: f.path, message: `range setting '${st.id}': (max - min) must be a multiple of step` });
          }
          if (typeof def === "number" && (def < min || def > max)) {
            issues.push({ level: "error", path: f.path, message: `range setting '${st.id}' default ${def} is outside [${min}, ${max}]` });
          }
        }
        if (st.type === "select" && typeof st.default === "string" && st.options?.length) {
          if (!st.options.some((o) => o.value === st.default)) {
            issues.push({ level: "error", path: f.path, message: `select setting '${st.id}' default '${st.default}' is not one of its options` });
          }
        }
      }
      if (typeof schema.max_blocks === "number" && schema.max_blocks > 50) {
        issues.push({ level: "error", path: f.path, message: "max_blocks cannot exceed 50" });
      }
    } catch {
      issues.push({ level: "error", path: f.path, message: "Section {% schema %} is not valid JSON" });
    }
  }

  // Map sectionId -> parsed schema (for block-type checks in templates below).
  const schemaBySectionId = new Map<string, { blocks?: { type: string }[] }>();
  for (const f of files) {
    if (!f.path.startsWith("sections/") || !f.path.endsWith(".liquid")) continue;
    const m = f.contents.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
    if (!m) continue;
    try { schemaBySectionId.set(f.path.slice("sections/".length, -".liquid".length), JSON.parse(m[1].trim())); } catch { /* reported above */ }
  }

  // Every JSON template AND section group parses and references existing section
  // files; template blocks must use block types the section's schema declares
  // (an unknown type gets the whole template silently dropped on ZIP upload).
  for (const f of files) {
    const isTemplate = f.path.startsWith("templates/") && f.path.endsWith(".json");
    const isGroup = f.path.startsWith("sections/") && f.path.endsWith(".json");
    if (!isTemplate && !isGroup) continue;
    let tpl: { sections?: Record<string, { type?: string; blocks?: Record<string, { type?: string }>; block_order?: string[] }>; order?: string[] };
    try { tpl = JSON.parse(f.contents); } catch { issues.push({ level: "error", path: f.path, message: "Template/group is not valid JSON" }); continue; }
    const order = tpl.order ?? [];
    for (const key of order) {
      const sec = tpl.sections?.[key];
      if (!sec) { issues.push({ level: "error", path: f.path, message: `order references missing section key: ${key}` }); continue; }
      if (sec.type && !byPath.has(`sections/${sec.type}.liquid`)) {
        issues.push({ level: "error", path: f.path, message: `references missing section file: sections/${sec.type}.liquid` });
      }
      // Block types must exist in the section's schema.
      if (sec.type && sec.blocks) {
        const allowed = new Set((schemaBySectionId.get(sec.type)?.blocks ?? []).map((b) => b.type));
        for (const [bk, block] of Object.entries(sec.blocks)) {
          if (block.type && !allowed.has(block.type)) {
            issues.push({ level: "error", path: f.path, message: `section '${key}' block '${bk}' uses unknown block type '${block.type}' for ${sec.type}` });
          }
        }
        for (const bk of sec.block_order ?? []) {
          if (!sec.blocks[bk]) issues.push({ level: "error", path: f.path, message: `section '${key}' block_order references missing block '${bk}'` });
        }
      }
    }
    for (const key of Object.keys(tpl.sections ?? {})) {
      if (!order.includes(key)) issues.push({ level: "warning", path: f.path, message: `section '${key}' not present in order[]` });
    }
  }

  return { valid: issues.every((i) => i.level !== "error"), issues };
}

/** Input-level validation before generation — reports unsupported section ids. */
export function validateProjectInput(input: ShopifyProjectInput): ThemeValidationResult {
  const issues: ThemeValidationIssue[] = [];
  if (!input.storeName?.trim()) issues.push({ level: "error", message: "storeName is required" });
  input.pages.forEach((page, pi) => {
    page.sections.forEach((inst, si) => {
      const def = getSection(inst.sectionId);
      if (!def) issues.push({ level: "error", message: `Unsupported section id "${inst.sectionId}" (page ${pi}, position ${si})` });
      else if (!def.supportedTemplates.includes(page.template)) {
        issues.push({ level: "warning", message: `Section "${inst.sectionId}" is not designed for the ${page.template} template` });
      }
    });
  });
  return { valid: issues.every((i) => i.level !== "error"), issues };
}
