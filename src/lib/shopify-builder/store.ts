// Data layer for the Shopify Builder module. Bridges the isolated
// src/modules/shopify module (pure, DB-agnostic) to the ShopifyProject Prisma
// row. Prisma access stays here in lib/*, never in components.

import { prisma } from "@/lib/db/client";
import {
  DEFAULT_BRAND_TOKENS,
  getSection,
  type BrandTokens,
  type ShopifyPage,
  type ShopifyProjectInput,
} from "@/modules/shopify";

/** Drop section instances that reference a section id no longer in the registry
 *  (e.g. a retired section), and drop blocks whose type the section no longer
 *  declares. Keeps saved projects exportable after the library changes. */
function prunePages(pages: ShopifyPage[]): ShopifyPage[] {
  return pages.map((page) => ({
    ...page,
    sections: page.sections.filter((inst) => {
      const def = getSection(inst.sectionId);
      if (!def) return false;
      if (inst.blocks && def.schema.blocks) {
        const allowed = new Set(def.schema.blocks.map((b) => b.type));
        inst.blocks = inst.blocks.filter((b) => allowed.has(b.type));
      }
      return true;
    }),
  }));
}

/** Starter homepage + core templates so a new store is immediately previewable. */
export function defaultPages(): ShopifyPage[] {
  return [
    {
      template: "index",
      sections: [
        { key: "hero", sectionId: "hero-banner", settings: { heading: "Designed for everyday living", height: "large", alignment: "left", button_label: "Shop now" } },
        { key: "featured", sectionId: "featured-collection", settings: { heading: "Shop our favourites", products_to_show: 4, columns: "4", show_view_all: true } },
        { key: "iwt", sectionId: "image-with-text", settings: { heading: "Built with care", image_position: "left", body: "<p>Describe a product benefit, your story, or what sets you apart.</p>" } },
        { key: "faq", sectionId: "faq", settings: { heading: "Frequently asked questions" }, blocks: [
          { key: "q1", type: "question", settings: { question: "What is your return policy?", answer: "<p>Returns are accepted within 30 days of delivery.</p>" } },
          { key: "q2", type: "question", settings: { question: "How long does shipping take?", answer: "<p>Orders ship in 1–2 business days.</p>" } },
        ] },
      ],
    },
    { template: "product", sections: [] },
    { template: "collection", sections: [] },
    { template: "page", handle: "about", sections: [
      { key: "iwt", sectionId: "image-with-text", settings: { heading: "Our story", image_position: "right" } },
    ] },
  ];
}

export interface ShopifyBuilderState {
  id: string;
  projectId: string;
  storeName: string;
  themeName: string | null;
  industry: string | null;
  brand: BrandTokens;
  pages: ShopifyPage[];
}

function toState(row: {
  id: string; projectId: string; storeName: string; themeName: string | null;
  industry: string | null; brand: unknown; pages: unknown;
}): ShopifyBuilderState {
  return {
    id: row.id,
    projectId: row.projectId,
    storeName: row.storeName,
    themeName: row.themeName,
    industry: row.industry,
    brand: { ...DEFAULT_BRAND_TOKENS, ...(row.brand as Partial<BrandTokens>) },
    pages: prunePages((row.pages as ShopifyPage[]) ?? []),
  };
}

/** Read the builder state for a project, or null if the row doesn't exist yet. */
export async function getShopifyProject(projectId: string): Promise<ShopifyBuilderState | null> {
  const row = await prisma.shopifyProject.findUnique({ where: { projectId } });
  return row ? toState(row) : null;
}

/** Read the builder state, creating a default one on first access. */
export async function getOrCreateShopifyProject(
  projectId: string,
  fallbackStoreName: string,
): Promise<ShopifyBuilderState> {
  const existing = await getShopifyProject(projectId);
  if (existing) return existing;
  const row = await prisma.shopifyProject.create({
    data: {
      projectId,
      storeName: fallbackStoreName || "My store",
      themeName: (fallbackStoreName || "My store").slice(0, 40),
      brand: DEFAULT_BRAND_TOKENS as unknown as object,
      pages: defaultPages() as unknown as object,
    },
  });
  return toState(row);
}

export async function updateShopifyBrand(
  projectId: string,
  storeName: string,
  themeName: string,
  industry: string,
  brand: BrandTokens,
): Promise<ShopifyBuilderState> {
  const row = await prisma.shopifyProject.update({
    where: { projectId },
    data: { storeName, themeName, industry, brand: brand as unknown as object },
  });
  return toState(row);
}

export async function updateShopifyPages(
  projectId: string,
  pages: ShopifyPage[],
): Promise<ShopifyBuilderState> {
  const row = await prisma.shopifyProject.update({
    where: { projectId },
    data: { pages: pages as unknown as object },
  });
  return toState(row);
}

/** Shape the builder state into the module's generator input. */
export function toProjectInput(state: ShopifyBuilderState): ShopifyProjectInput {
  return {
    storeName: state.storeName,
    themeName: state.themeName ?? state.storeName,
    brand: state.brand,
    pages: state.pages,
  };
}
