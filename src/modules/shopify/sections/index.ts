// Section registry — the ONLY source of valid Shopify section ids. The theme
// generator and AI page-planner must resolve every section against this.

import type { ShopifySectionDefinition } from "../types";
import { heroSection } from "./hero";
import { imageWithTextSection, featuredCollectionSection, faqSection } from "./content";
import {
  richTextSection, uspBarSection, newsletterSection, testimonialsSection,
  collectionListSection, featuredProductSection,
} from "./content-extra";
import { announcementBarSection, headerSection, footerSection } from "./structural";

/** Sections always included in a generated theme (referenced by theme.liquid). */
export const STRUCTURAL_SECTIONS: ShopifySectionDefinition[] = [announcementBarSection, headerSection, footerSection];

/** Sections a user can place on a page. */
export const CONTENT_SECTIONS: ShopifySectionDefinition[] = [
  heroSection, imageWithTextSection, featuredCollectionSection, collectionListSection,
  featuredProductSection, richTextSection, uspBarSection, testimonialsSection,
  newsletterSection, faqSection,
];

export const ALL_SECTIONS: ShopifySectionDefinition[] = [...STRUCTURAL_SECTIONS, ...CONTENT_SECTIONS];

const BY_ID = new Map(ALL_SECTIONS.map((s) => [s.id, s]));

export function getSection(id: string): ShopifySectionDefinition | undefined {
  return BY_ID.get(id);
}

export function isValidSectionId(id: string): boolean {
  return BY_ID.has(id);
}
