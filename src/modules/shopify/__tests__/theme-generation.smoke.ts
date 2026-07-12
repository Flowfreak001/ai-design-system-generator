// Smoke test for the Shopify theme pipeline. Run: npx tsx src/modules/shopify/__tests__/theme-generation.smoke.ts
// Asserts: valid input -> valid deterministic theme -> valid zip; and that an
// unknown section id is rejected by validation.

import { strict as assert } from "node:assert";
import {
  DEFAULT_BRAND_TOKENS, generateShopifyTheme, validateShopifyTheme, validateProjectInput, createThemeZip,
} from "../index";
import type { ShopifyProjectInput } from "../types";

const input: ShopifyProjectInput = {
  storeName: "Northwind Goods",
  themeName: "Northwind",
  brand: { ...DEFAULT_BRAND_TOKENS, primaryColor: "#0f172a", secondaryColor: "#f97316" },
  pages: [
    {
      template: "index",
      sections: [
        { key: "hero", sectionId: "hero-banner", settings: { heading: "Everyday essentials" } },
        { key: "featured", sectionId: "featured-collection", settings: { heading: "Best sellers", products_to_show: 4 } },
        { key: "iwt", sectionId: "image-with-text", settings: { heading: "Made to last" } },
        { key: "faq", sectionId: "faq", blocks: [
          { key: "q1", type: "question", settings: { question: "Do you ship worldwide?" } },
          { key: "q2", type: "question", settings: { question: "What's your return policy?" } },
        ] },
      ],
    },
    { template: "product", sections: [] },
    { template: "collection", sections: [] },
    { template: "page", handle: "about", sections: [{ key: "iwt", sectionId: "image-with-text" }] },
  ],
};

// 1. Input validation passes.
const inputCheck = validateProjectInput(input);
assert.equal(inputCheck.valid, true, `input invalid: ${JSON.stringify(inputCheck.issues)}`);

// 2. Generate + validate theme.
const files = generateShopifyTheme(input);
const themeCheck = validateShopifyTheme(files);
assert.equal(themeCheck.valid, true, `theme invalid: ${JSON.stringify(themeCheck.issues, null, 2)}`);

// Required structure present.
const paths = files.map((f) => f.path);
for (const p of ["layout/theme.liquid", "templates/index.json", "sections/hero-banner.liquid", "config/settings_schema.json", "config/settings_data.json"]) {
  assert.ok(paths.includes(p), `missing ${p}`);
}

// 3. Determinism: same input -> identical zip bytes.
const zipA = createThemeZip(files);
const zipB = createThemeZip(generateShopifyTheme(input));
assert.ok(zipA.equals(zipB), "theme zip is not deterministic");
assert.ok(zipA.length > 500, "zip suspiciously small");

// 4. Unknown section id is rejected.
const bad = validateProjectInput({ ...input, pages: [{ template: "index", sections: [{ key: "x", sectionId: "made-up-section" }] }] });
assert.equal(bad.valid, false, "unknown section id should fail validation");

console.log(`OK — ${files.length} theme files, zip ${zipA.length} bytes, deterministic.`);
console.log("Files:\n" + paths.map((p) => "  " + p).join("\n"));
