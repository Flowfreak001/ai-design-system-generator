// Public product detail page for a hosted storefront. Reads a single live
// product from the project's connected Wix Store.
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { STYLE_GUIDE_CANVAS_FILE, type StyleGuideCanvas } from "@/lib/canvas";
import { createSectionTheme } from "@/components/sections/section-theme";
import { fetchWixProduct } from "@/lib/integrations/wix/stores";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string; productSlug: string }> }) {
  const { slug, productSlug } = await params;
  const project = await prisma.project.findFirst({
    where: { siteSlug: slug, sitePublished: true },
    select: { id: true },
  });
  if (!project) notFound();

  const [product, styleFile] = await Promise.all([
    fetchWixProduct(project.id, productSlug),
    prisma.generatedFile.findUnique({ where: { projectId_name: { projectId: project.id, name: STYLE_GUIDE_CANVAS_FILE } } }),
  ]);
  if (!product) notFound();

  let style: StyleGuideCanvas | undefined;
  try { style = styleFile?.content ? (JSON.parse(styleFile.content) as StyleGuideCanvas) : undefined; } catch { /* default theme */ }
  const t = createSectionTheme(style);
  const img = product.image ? `${product.image}/v1/fill/w_900,h_900,q_90/${product.slug}.jpg` : "";

  return (
    <main style={{ background: t.backgroundColor, color: t.textColor, minHeight: "100dvh", fontFamily: t.bodyFont }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 96px" }}>
        <Link href={`/s/${slug}`} style={{ color: t.mutedTextColor, fontSize: 13, textDecoration: "none" }}>← Back to store</Link>
        <div style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: 24, alignItems: "start" }}>
          <div style={{ aspectRatio: "1 / 1", background: t.surfaceColor, borderRadius: t.radius, overflow: "hidden", border: `1px solid ${t.borderColor}` }}>
            {img ? <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
          <div>
            {product.ribbon ? (
              <span style={{ display: "inline-block", background: t.surfaceColor, border: `1px solid ${t.borderColor}`, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>{product.ribbon}</span>
            ) : null}
            <h1 style={{ margin: "14px 0 0", fontFamily: t.headingFont, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{product.name}</h1>
            <p style={{ margin: "12px 0 0", fontSize: 22, fontWeight: 600 }}>
              {product.price}
              {product.compareAtPrice && product.compareAtPrice !== product.price ? (
                <span style={{ marginLeft: 10, color: t.mutedTextColor, textDecoration: "line-through", fontSize: 16, fontWeight: 400 }}>{product.compareAtPrice}</span>
              ) : null}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: product.inStock ? t.mutedTextColor : "#b45309" }}>
              {product.inStock ? "In stock" : "Out of stock"}{product.variantCount > 1 ? ` · ${product.variantCount} options` : ""}
            </p>
            <button
              type="button"
              disabled={!product.inStock}
              style={{
                marginTop: 24, width: "100%", maxWidth: 320, padding: "14px 20px",
                background: t.buttonBgColor, color: t.buttonTextColor, border: "none",
                borderRadius: t.radius, fontSize: 15, fontWeight: 600, cursor: product.inStock ? "pointer" : "not-allowed", opacity: product.inStock ? 1 : 0.5,
              }}
            >
              Add to cart
            </button>
            <p style={{ marginTop: 10, fontSize: 12, color: t.mutedTextColor }}>Checkout is handled securely by Wix.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
