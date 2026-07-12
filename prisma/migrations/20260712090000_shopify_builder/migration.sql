-- Shopify Builder module: new project types + isolated builder state table.
-- New enum values are additive; existing rows are unaffected.
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'SHOPIFY';
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'WEBFLOW_CLOUD';

-- ShopifyProject: 1:1 with a SHOPIFY-type Project. Brand + pages stored as JSON
-- (their shape is owned by the isolated src/modules/shopify module).
CREATE TABLE "ShopifyProject" (
  "id"        TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "storeName" TEXT NOT NULL,
  "themeName" TEXT,
  "industry"  TEXT,
  "brand"     JSONB NOT NULL,
  "pages"     JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShopifyProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShopifyProject_projectId_key" ON "ShopifyProject"("projectId");

ALTER TABLE "ShopifyProject"
  ADD CONSTRAINT "ShopifyProject_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
