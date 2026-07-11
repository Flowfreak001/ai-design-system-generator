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

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await loadPublishedSite(slug);
  if (!site) notFound();
  return <StorefrontRenderer sections={site.sections} style={site.style} />;
}
