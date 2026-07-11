// Public multi-tenant storefront (home page). No auth — visitor-facing.
import type { Metadata } from "next";
import { loadPublishedSite } from "@/lib/site-runtime";
import { SiteView } from "@/components/site/site-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadPublishedSite(slug);
  return { title: site ? site.name : "Store", robots: { index: false } };
}

export default async function StorefrontHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkout_error?: string }>;
}) {
  const { slug } = await params;
  const { checkout_error } = await searchParams;
  return (
    <>
      {checkout_error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 16px", fontSize: 13, textAlign: "center" }}>
          Checkout couldn’t start: {checkout_error}
        </div>
      )}
      <SiteView slug={slug} />
    </>
  );
}
