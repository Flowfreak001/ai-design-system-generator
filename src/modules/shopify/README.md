# Shopify Builder module

Isolated module that turns Flowfreak project data into a **Shopify-native theme**
(Liquid + JSON templates + theme settings), separate from the standard
React/website section library. Output is a real Online Store 2.0 theme, not React.

## Pipeline

```
ShopifyProjectInput (store + BrandTokens + pages[])
  -> validateProjectInput()         reject unknown section ids / bad input
  -> generateShopifyTheme()         deterministic GeneratedThemeFile[]
       core skeleton (theme.liquid, base.css, theme.js, snippets, locales, 404)
       + structural sections (announcement-bar, header, footer)
       + used content sections (sections/<id>.liquid with {% schema %})
       + JSON templates per page (templates/*.json)
       + config/settings_schema.json + settings_data.json (from BrandTokens)
  -> validateShopifyTheme()         required files, unique paths, valid schema/JSON, refs
  -> createThemeZip()               dependency-free STORE zip, deterministic bytes
```

Determinism: same input always produces byte-identical output (sorted paths,
fixed zip timestamps, no DB ids / timestamps in the theme).

## Section registry (`sections/index.ts`)

The **only** source of valid section ids. AI page-plans and JSON templates must
resolve every section here; unknown ids are rejected before generation.

- Structural (always emitted, referenced by `theme.liquid`): `announcement-bar`, `header`, `footer`
- Content: `hero-banner`, `image-with-text`, `featured-collection`, `collection-list`,
  `featured-product`, `rich-text`, `usp-bar`, `testimonials`, `newsletter`, `faq`

Each section carries real Liquid + a valid `{% schema %}` (settings, blocks,
presets), default settings, responsive scoped CSS, accessibility, theme-token
CSS variables, and image/collection pickers where relevant.

## Public API (`index.ts`)

`generateShopifyTheme`, `generateLiquidSection`, `generateJsonTemplate`,
`generateThemeSettings`, `validateShopifyTheme`, `validateProjectInput`,
`createThemeZip`, `getSection`, `isValidSectionId`, `ALL_SECTIONS`,
`DEFAULT_BRAND_TOKENS`, and the types.

## Test

```
npx tsx src/modules/shopify/__tests__/theme-generation.smoke.ts
```

Asserts a valid, deterministic theme + zip and that unknown section ids fail.

## Wired into the app (built)

- `ProjectType.SHOPIFY` (+ `WEBFLOW_CLOUD`) and the `ShopifyProject` model
  (migration `20260712090000_shopify_builder`). Brand + pages are stored as JSON
  so this module owns their shape; data layer in `src/lib/shopify-builder/store.ts`.
- New-project chooser → "Shopify Store" card creates a SHOPIFY project and opens
  the builder at `(app)/projects/[id]/shopify`.
- Builder workspace (`src/components/shopify/shopify-builder.tsx`): Overview,
  Brand, Pages (section add/reorder/remove + settings & block editing), Preview,
  Export. Server actions in `(app)/projects/[id]/shopify/actions.ts`
  (`saveBrandAction`, `savePagesAction`, `exportThemeAction`) — all Zod-validated
  and funnelled through `validateProjectInput` / `validateShopifyTheme`.
- React storefront preview (`src/components/shopify/storefront-preview.tsx`)
  renders the SAME structured section data with mock Shopify data. Editor-only,
  never exported.
- Export: `exportThemeAction` generates + validates + zips and streams the ZIP to
  the browser (base64 → Blob download).

## Not yet implemented (next phases)

- Product/collection template section editing beyond the starter set
- Shopify OAuth + theme upload/publish (a `ShopifyDeploymentProvider` interface exists; no live impl)
