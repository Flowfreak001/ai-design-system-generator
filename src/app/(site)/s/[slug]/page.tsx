// Public multi-tenant storefront. Renders a published project's assembled
// sections with live Wix data. No auth — this is the visitor-facing site.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPublishedSite } from "@/lib/site-runtime";
import { StorefrontRenderer } from "@/components/site/storefront-renderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadPublishedSite(slug);
  return { title: site ? site.name : "Store", robots: { index: false } };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkout_error?: string }>;
}) {
  const { slug } = await params;
  const { checkout_error } = await searchParams;
  const site = await loadPublishedSite(slug);
  if (!site) notFound();
  return (
    <>
      {checkout_error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 16px", fontSize: 13, textAlign: "center" }}>
          Checkout couldn’t start: {checkout_error}
        </div>
      )}
      <StorefrontRenderer sections={site.sections} style={site.style} />
    </>
  );
}
