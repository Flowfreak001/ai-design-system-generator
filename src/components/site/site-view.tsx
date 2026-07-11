// Server component: load a published site and render one page with cross-page nav.
import { notFound } from "next/navigation";
import { loadPublishedSite } from "@/lib/site-runtime";
import { StorefrontRenderer, type SiteNavItem } from "@/components/site/storefront-renderer";

export async function SiteView({ slug, pageKey }: { slug: string; pageKey?: string }) {
  const site = await loadPublishedSite(slug);
  if (!site || site.pages.length === 0) notFound();

  const current = site.pages.find((p) => p.key === pageKey) ?? site.pages[0];
  if (!current) notFound();

  const nav: SiteNavItem[] = site.pages.map((p, i) => ({
    name: p.name,
    href: i === 0 ? `/s/${slug}` : `/s/${slug}/${p.key}`,
    active: p.key === current.key,
  }));

  return <StorefrontRenderer siteName={site.name} nav={nav} sections={current.sections} style={site.style} />;
}
