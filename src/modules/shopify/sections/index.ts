// Section registry — the ONLY source of valid Shopify section ids. The theme
// generator and AI page-planner must resolve every section against this.

import type { ShopifySectionDefinition } from "../types";
import { featuredCollectionSection } from "./content";
import { collectionListSection, featuredProductSection } from "./content-extra";
import { announcementBarSection, headerSection, footerSection } from "./structural";
import { STOREFRONT_SECTIONS } from "./storefront";
import { productRecommendationsSection } from "./creative";
import { customSection } from "./custom";

/** Sections always included in a generated theme (referenced by theme.liquid). */
export const STRUCTURAL_SECTIONS: ShopifySectionDefinition[] = [announcementBarSection, headerSection, footerSection];

/** Sections a user can place on a page. The old presentational/creative sections
 *  were retired in favour of the manual block composer (customSection); commerce
 *  sections are kept because they bind to live Shopify data. New sections get
 *  added here as they are built. */
export const CONTENT_SECTIONS: ShopifySectionDefinition[] = [
  customSection,
  featuredCollectionSection, collectionListSection, featuredProductSection, productRecommendationsSection,
];

/** "main" sections injected into required storefront templates (not user-addable). */
export { STOREFRONT_SECTIONS } from "./storefront";

export const ALL_SECTIONS: ShopifySectionDefinition[] = [...STRUCTURAL_SECTIONS, ...CONTENT_SECTIONS, ...STOREFRONT_SECTIONS];

const BY_ID = new Map(ALL_SECTIONS.map((s) => [s.id, s]));

export function getSection(id: string): ShopifySectionDefinition | undefined {
  return BY_ID.get(id);
}

export function isValidSectionId(id: string): boolean {
  return BY_ID.has(id);
}
