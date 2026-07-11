// Public product detail page for a hosted storefront. Reads a single live
// product from the project's connected Wix Store and renders an editorial PDP
// (image gallery + rich purchase panel).
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { STYLE_GUIDE_CANVAS_FILE, type StyleGuideCanvas } from "@/lib/canvas";
import { createSectionTheme } from "@/components/sections/section-theme";
import { fetchWixProduct } from "@/lib/integrations/wix/stores";
import { ProductDetail } from "@/components/site/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string; productSlug: string }> }) {
  const { slug, productSlug } = await params;
  const project = await prisma.project.findFirst({ where: { siteSlug: slug, sitePublished: true }, select: { id: true } });
  if (!project) notFound();

  const [product, styleFile] = await Promise.all([
    fetchWixProduct(project.id, productSlug),
    prisma.generatedFile.findUnique({ where: { projectId_name: { projectId: project.id, name: STYLE_GUIDE_CANVAS_FILE } } }),
  ]);
  if (!product) notFound();

  let style: StyleGuideCanvas | undefined;
  try { style = styleFile?.content ? (JSON.parse(styleFile.content) as StyleGuideCanvas) : undefined; } catch { /* default */ }
  const t = createSectionTheme(style);
  const img = product.image ? `${product.image}/v1/fill/w_900,h_1100,q_90/${product.slug}.jpg` : "";

  return (
    <main style={{ background: t.backgroundColor, color: t.textColor, minHeight: "100dvh", fontFamily: t.bodyFont }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 90px" }}>
        <Link href={`/s/${slug}`} style={{ color: t.mutedTextColor, fontSize: 13, textDecoration: "none" }}>← Back to store</Link>

        <div style={{ marginTop: 20, display: "grid", gap: 44, gridTemplateColumns: "minmax(0, 1.05fr) minmax(300px, 0.95fr)", alignItems: "start" }}>
          {/* Gallery */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {(img ? [img, img, img, img] : ["", "", "", ""]).map((src, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "4 / 5", background: t.surfaceColor, borderRadius: t.radius, overflow: "hidden" }}>
                {src ? <img src={src} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                {i === 0 && product.ribbon ? (
                  <span style={{ position: "absolute", top: 12, left: 12, background: /sale/i.test(product.ribbon) ? "#d7263d" : t.textColor, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6 }}>{product.ribbon}</span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Purchase panel — sticky on desktop */}
          <div style={{ position: "sticky", top: 100 }}>
            <ProductDetail product={product} slug={slug} theme={t} />
          </div>
        </div>
      </div>
    </main>
  );
}
