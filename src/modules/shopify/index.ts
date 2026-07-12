// Shopify Builder module — public API. Isolated from the standard website
// builder and React section library. Output is Shopify-native (Liquid + JSON
// templates + theme settings).

export type {
  BrandTokens, ShopifyTemplateType, ShopifySectionDefinition, ShopifySectionInstance,
  ShopifyPage, ShopifyProjectInput, GeneratedThemeFile, ThemeValidationResult, ShopifyDeploymentProvider,
  ShopifySettingField, ShopifyBlockDefinition, ShopifySectionSchema,
} from "./types";

export { ALL_SECTIONS, CONTENT_SECTIONS, STRUCTURAL_SECTIONS, getSection, isValidSectionId } from "./sections";
export { DEFAULT_BRAND_TOKENS } from "./core/design-tokens";
export { generateShopifyTheme, generateLiquidSection, generateJsonTemplate, generateThemeSettings } from "./generators/theme-generator";
export { validateShopifyTheme, validateProjectInput } from "./validators/theme-validator";
export { createThemeZip } from "./export/zip";
