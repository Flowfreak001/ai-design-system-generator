import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getOrCreateShopifyProject } from "@/lib/shopify-builder/store";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ShopifyBuilder } from "@/components/shopify/shopify-builder";

export const metadata: Metadata = { title: "Shopify store builder" };
export const dynamic = "force-dynamic";

export default async function ShopifyBuilderPage({ params }: { params: Promise<{ id: string }> }) {
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
    <PageContainer>
      <PageHeader
        title="Shopify store builder"
        description="Assemble a native Shopify theme — brand, page sections, live preview, and a deterministic theme export."
        action={
          <Link href={`/projects/${project.id}`} className="rounded-md border border-line bg-white px-3 py-2 text-[13px] font-medium text-body transition-colors hover:border-ink/20">
            Back to project
          </Link>
        }
      />
      <div className="mt-7">
        <ShopifyBuilder
          projectId={project.id}
          projectName={project.name}
          storeName={state.storeName}
          themeName={state.themeName ?? ""}
          industry={state.industry ?? ""}
          brand={state.brand}
          pages={state.pages}
        />
      </div>
    </PageContainer>
  );
}
