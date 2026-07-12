// Shopify Builder module — public API. Isolated from the standard website
// builder and React section library. Output is Shopify-native (Liquid + JSON
// templates + theme settings).

export type {
  BrandTokens, ColorScheme, ShopifyTemplateType, ShopifySectionDefinition, ShopifySectionInstance,
  ShopifyPage, ShopifyProjectInput, GeneratedThemeFile, ThemeValidationResult, ShopifyDeploymentProvider,
  ShopifySettingField, ShopifyBlockDefinition, ShopifySectionSchema,
} from "./types";

export { ALL_SECTIONS, CONTENT_SECTIONS, STRUCTURAL_SECTIONS, STOREFRONT_SECTIONS, getSection, isValidSectionId } from "./sections";
export { DEFAULT_BRAND_TOKENS, defaultColorSchemes, resolveSchemes } from "./core/design-tokens";
export { generateShopifyTheme, generateLiquidSection, generateJsonTemplate, generateThemeSettings, resolveTemplatePages } from "./generators/theme-generator";
export { validateShopifyTheme, validateProjectInput } from "./validators/theme-validator";
export { createThemeZip } from "./export/zip";
