import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getOrCreateShopifyProject } from "@/lib/shopify-builder/store";
import { ShopifyVisualEditor } from "@/components/shopify/visual-editor/shopify-visual-editor";

export const metadata: Metadata = { title: "Shopify visual editor" };
export const dynamic = "force-dynamic";

// Full-bleed editor — owns the viewport (like the design editor / preview).
export default async function ShopifyEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!user.agencyId) notFound();
  const project = await prisma.project.findUnique({
    where: { id, agencyId: user.agencyId },
    select: { id: true, name: true, type: true },
  });
  if (!project || project.type !== "SHOPIFY") notFound();

  const state = await getOrCreateShopifyProject(project.id, project.name);

  return (
    <ShopifyVisualEditor
      projectId={project.id}
      storeName={state.storeName}
      brand={state.brand}
      initialPages={state.pages}
    />
  );
}
