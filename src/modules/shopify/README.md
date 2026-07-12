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

- Structural (emitted + referenced by the header/footer **section groups**): `announcement-bar`, `header`, `footer`
- Content (addable): `hero-banner`, `image-banner`, `slideshow`, `image-with-text`, `multirow`,
  `featured-collection`, `collection-list`, `featured-product`, `product-recommendations`,
  `multicolumn`, `usp-bar`, `rich-text`, `testimonials`, `logo-list`, `countdown`, `blog-posts`,
  `contact-form`, `newsletter`, `faq`
- Storefront "main" sections (auto-injected into required templates, not addable): `main-product`,
  `main-collection`, `main-list-collections`, `main-cart`, `main-search`, `main-blog`,
  `main-article`, `main-page`, `main-404`

## Dawn-grade foundation

- **Colour schemes** (`color_scheme_group` in settings, `color_schemes` in `settings_data`); each
  section picks a scheme via a `color_scheme` setting → `.color-{id}` CSS class.
- Typography scale, buttons/cards styles, layout, and a reveal-on-scroll toggle
  (`assets/theme.js` IntersectionObserver). Header/footer live in **section groups**.
- Snippets: `image` (srcset), `button`, `meta-tags` (SEO + JSON-LD), `product-card`, `price`.

## Complete store on export

`generateShopifyTheme` ALWAYS emits the required template set — `index`, `product`, `collection`,
`list-collections`, `cart`, `search`, `blog`, `article`, `page`, `404` — with each template's main
section injected, so the export is a real installable store. User page customizations merge on top.
`resolveTemplatePages(input)` exposes the merged set.

## Live preview

`src/components/shopify/storefront-preview.tsx` renders every template (home/product/collection/
cart/search/blog) from mock data with the active colour scheme, type scale, and reveal animations
applied — editor-only, never exported.

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

## Out of scope (by decision)

- **Shopify OAuth + theme upload/publish — not planned right now.** The delivery
  path is the export ZIP (Shopify admin → Online Store → Themes → Upload). The
  `ShopifyDeploymentProvider` interface is kept as a seam if this is ever revisited,
  but there is no live implementation and none is planned.

## Possible future work

- Product/collection template section editing beyond the starter set
