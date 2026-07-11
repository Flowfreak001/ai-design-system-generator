-- Hosted "Wix Site" module fields on Project.
ALTER TABLE "Project" ADD COLUMN "siteSlug" TEXT;
ALTER TABLE "Project" ADD COLUMN "sitePublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "siteTemplate" TEXT;
CREATE UNIQUE INDEX "Project_siteSlug_key" ON "Project"("siteSlug");
