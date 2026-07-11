// Storefront checkout endpoint. A product's "Add to cart" form POSTs here; we
// create a Wix checkout for that product and 302 the visitor to the Wix-hosted
// checkout page. Wix returns them to /s/<slug> when done.
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { fetchWixProduct } from "@/lib/integrations/wix/stores";
import { createProductCheckoutUrl } from "@/lib/integrations/wix/checkout";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await req.formData();
  const productSlug = String(form.get("product") ?? "").trim();
  const quantity = Number(form.get("quantity") ?? 1) || 1;

  const backTo = new URL(`/s/${slug}`, req.nextUrl.origin);
  const fail = (msg: string) => NextResponse.redirect(new URL(`/s/${slug}?checkout_error=${encodeURIComponent(msg)}`, req.nextUrl.origin), 303);

  const project = await prisma.project.findFirst({ where: { siteSlug: slug, sitePublished: true }, select: { id: true } });
  if (!project) return fail("Store not found.");
  if (!productSlug) return fail("No product selected.");

  const product = await fetchWixProduct(project.id, productSlug);
  if (!product) return fail("Product not found.");

  const result = await createProductCheckoutUrl(project.id, product.id, quantity, backTo.toString());
  if ("error" in result) return fail(result.error);

  return NextResponse.redirect(result.url, 303);
}
