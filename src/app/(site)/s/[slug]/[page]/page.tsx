// Public storefront — a named page (e.g. /s/<slug>/shop). No auth.
import type { Metadata } from "next";
import { loadPublishedSite } from "@/lib/site-runtime";
import { SiteView } from "@/components/site/site-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadPublishedSite(slug);
  return { title: site ? site.name : "Store", robots: { index: false } };
}

export default async function StorefrontPageRoute({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  return <SiteView slug={slug} pageKey={page} />;
}
