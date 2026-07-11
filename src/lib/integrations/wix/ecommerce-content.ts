// The reusable ecommerce content contract. EVERY ecommerce library section
// consumes SectionContent.items in this exact shape, so any user's store data
// (from any connected Wix site) flows into any ecommerce section uniformly.
// SectionContentItem carries { title, text, icon, image } — we map product
// fields onto those so the sections stay inside the standard section contract:
//   title → product name
//   text  → price line (e.g. "68 · was 129 · Out of stock")
//   icon  → ribbon label (Best Seller / New / Sale)
//   image → main image URL
import type { WixProduct } from "./stores";
import type { SectionItem } from "@/lib/section-editor/types";

/** Format a product's price line into the single `text` field. */
function priceLine(p: WixProduct): string {
  const parts: string[] = [];
  if (p.price) parts.push(p.price);
  if (p.compareAtPrice && p.compareAtPrice !== p.price) parts.push(`was ${p.compareAtPrice}`);
  if (!p.inStock) parts.push("Out of stock");
  return parts.join(" · ");
}

/** Map live Wix products → the shared ecommerce section item contract. */
export function productsToItems(products: WixProduct[]): SectionItem[] {
  return products.map((p) => ({
    title: p.name,
    text: priceLine(p),
    icon: p.ribbon ?? "",
    image: p.image ? `${p.image}/v1/fill/w_640,h_640,q_85/${p.slug || "product"}.jpg` : "",
    href: p.slug ? `/product/${p.slug}` : undefined,
  }));
}
