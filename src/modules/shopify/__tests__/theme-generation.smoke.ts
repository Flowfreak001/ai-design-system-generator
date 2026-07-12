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
        { key: "custom", sectionId: "custom-section", settings: { content_width: "normal" }, blocks: [
          { key: "h", type: "heading", settings: { text: "Everyday essentials" } },
          { key: "t", type: "text", settings: { text: "<p>Made to last.</p>" } },
          { key: "b", type: "button", settings: { label: "Shop" } },
          { key: "f", type: "feature", settings: { title: "Free shipping" } },
        ] },
        { key: "featured", sectionId: "featured-collection", settings: { heading: "Best sellers", products_to_show: 4 } },
        { key: "cl", sectionId: "collection-list", blocks: [{ key: "c1", type: "collection_item", settings: { title: "New" } }] },
        { key: "fp", sectionId: "featured-product", settings: { eyebrow: "Featured" } },
      ],
    },
    { template: "product", sections: [] },
    { template: "collection", sections: [] },
    { template: "page", handle: "about", sections: [{ key: "custom", sectionId: "custom-section", blocks: [{ key: "h", type: "heading", settings: { text: "About" } }] }] },
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
for (const p of ["layout/theme.liquid", "templates/index.json", "sections/custom-section.liquid", "config/settings_schema.json", "config/settings_data.json"]) {
  assert.ok(paths.includes(p), `missing ${p}`);
}

// Full storefront: required templates + their main sections present (even though
// the input only customized the homepage).
for (const p of [
  "templates/product.json", "templates/collection.json", "templates/cart.json", "templates/search.json",
  "templates/blog.json", "templates/article.json", "templates/list-collections.json", "templates/page.json",
  "sections/main-product.liquid", "sections/main-collection.liquid", "sections/main-cart.liquid",
  "sections/header-group.json", "sections/footer-group.json",
  "layout/password.liquid", "templates/password.liquid", "templates/gift_card.liquid",
]) {
  assert.ok(paths.includes(p), `missing storefront file ${p}`);
}
// settings_data carries colour schemes.
const settingsData = JSON.parse(files.find((f) => f.path === "config/settings_data.json")!.contents);
assert.ok(settingsData.current.color_schemes && settingsData.current.color_schemes["scheme-1"], "color schemes missing");

// 3. Determinism: same input -> identical zip bytes.
const zipA = createThemeZip(files);
const zipB = createThemeZip(generateShopifyTheme(input));
assert.ok(zipA.equals(zipB), "theme zip is not deterministic");
assert.ok(zipA.length > 500, "zip suspiciously small");

// 4. Unknown section id is rejected.
const bad = validateProjectInput({ ...input, pages: [{ template: "index", sections: [{ key: "x", sectionId: "made-up-section" }] }] });
assert.equal(bad.valid, false, "unknown section id should fail validation");

// 5. User-content sanitization: hostile values are coerced to Shopify-safe
//    forms so the importer can never silently drop a template again.
const hostile: ShopifyProjectInput = {
  ...input,
  pages: [{
    template: "index",
    sections: [
      {
        key: "cs", sectionId: "custom-section",
        settings: { padding_top: 999, content_width: "gigantic", unknown_key: "drop me" },
        blocks: [
          { key: "t1", type: "text", settings: { text: "unwrapped quote" } },
          { key: "zz", type: "made-up-block", settings: {} },
        ],
      },
    ],
  }],
};
const hostileFiles = generateShopifyTheme(hostile);
const idx = JSON.parse(hostileFiles.find((f) => f.path === "templates/index.json")!.contents);
assert.equal(idx.sections.cs.settings.padding_top, 140, "range clamped to max");
assert.equal(idx.sections.cs.settings.content_width, "normal", "invalid select falls back to default");
assert.equal(idx.sections.cs.settings.unknown_key, undefined, "unknown setting keys dropped");
assert.equal(idx.sections.cs.blocks.t1.settings.text, "<p>unwrapped quote</p>", "block richtext wrapped");
assert.equal(idx.sections.cs.blocks.zz, undefined, "unknown block types dropped");
assert.ok(!idx.sections.cs.block_order.includes("zz"), "unknown block not in block_order");
const hostileCheck = validateShopifyTheme(hostileFiles);
assert.equal(hostileCheck.valid, true, `sanitized theme should validate: ${JSON.stringify(hostileCheck.issues.filter((i) => i.level === "error"))}`);

// 6. Validator rejects the known-fatal schema mistakes (the exact classes that
//    made Shopify silently drop templates/index.json on ZIP upload).
const badSection = validateShopifyTheme([
  ...files.filter((f) => f.path !== "sections/custom-section.liquid"),
  {
    path: "sections/custom-section.liquid",
    contents: `<div>x</div>\n{% schema %}\n${JSON.stringify({
      name: "Bad",
      settings: [
        { type: "richtext", id: "body", label: "Body", default: "not wrapped" },
        { type: "range", id: "scale", label: "Scale", min: 0, max: 1, step: 0.05, default: 2 },
        { type: "select", id: "align", label: "Align", default: "middle", options: [{ value: "left", label: "L" }] },
      ],
    })}\n{% endschema %}\n`,
  },
]);
assert.equal(badSection.valid, false, "fatal schema mistakes must fail validation");
const msgs = badSection.issues.filter((i) => i.level === "error").map((i) => i.message).join(" | ");
assert.ok(msgs.includes("<p>"), "flags unwrapped richtext default");
assert.ok(msgs.includes("divisible by 0.1"), "flags invalid range step");
assert.ok(msgs.includes("outside"), "flags out-of-bounds range default");
assert.ok(msgs.includes("not one of its options"), "flags invalid select default");

console.log(`OK — ${files.length} theme files, zip ${zipA.length} bytes, deterministic.`);
console.log("Files:\n" + paths.map((p) => "  " + p).join("\n"));
