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
- Content (Phase 1): `hero-banner`, `image-with-text`, `featured-collection`, `faq`

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

## Not yet implemented (next phases)

- Prisma models (`ProjectType.SHOPIFY`, `ShopifyProject`, `ShopifyPage`,
  `ShopifySectionInstance`, `ShopifyThemeVersion`, `ShopifyExport`) + migration
- Routes/UI under `(app)/projects/[id]/shopify/*` (brand, pages, editor, preview, export)
- React storefront preview renderer (renders from the same structured section data)
- Remaining sections (collection-list, featured-product, usp-bar, testimonials, newsletter, rich-text)
- Shopify OAuth + theme upload/publish (a `ShopifyDeploymentProvider` interface exists; no live impl)
