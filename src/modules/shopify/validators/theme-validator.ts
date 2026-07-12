// Validates a generated theme directory before export. Blocks export on any
// "error"; "warning" is advisory.

import type { GeneratedThemeFile, ShopifyProjectInput, ThemeValidationResult, ThemeValidationIssue } from "../types";
import { getSection } from "../sections";

const REQUIRED_FILES = [
  "layout/theme.liquid",
  "config/settings_schema.json",
  "config/settings_data.json",
  "sections/header.liquid",
  "sections/footer.liquid",
  "sections/announcement-bar.liquid",
  "sections/header-group.json",
  "sections/footer-group.json",
  "locales/en.default.json",
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
    } catch {
      issues.push({ level: "error", path: f.path, message: "Section {% schema %} is not valid JSON" });
    }
  }

  // Every JSON template parses and references existing section files.
  for (const f of files) {
    if (!f.path.startsWith("templates/") || !f.path.endsWith(".json")) continue;
    let tpl: { sections?: Record<string, { type?: string }>; order?: string[] };
    try { tpl = JSON.parse(f.contents); } catch { issues.push({ level: "error", path: f.path, message: "Template is not valid JSON" }); continue; }
    const order = tpl.order ?? [];
    for (const key of order) {
      const sec = tpl.sections?.[key];
      if (!sec) { issues.push({ level: "error", path: f.path, message: `order references missing section key: ${key}` }); continue; }
      if (sec.type && !byPath.has(`sections/${sec.type}.liquid`)) {
        issues.push({ level: "error", path: f.path, message: `template references missing section file: sections/${sec.type}.liquid` });
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
