-- WixConnection: per-project instead of per-agency
ALTER TABLE "WixConnection" ADD COLUMN "projectId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "WixConnection" ALTER COLUMN "projectId" DROP DEFAULT;
DROP INDEX IF EXISTS "WixConnection_agencyId_key";
CREATE UNIQUE INDEX "WixConnection_projectId_key" ON "WixConnection"("projectId");
CREATE INDEX "WixConnection_agencyId_idx" ON "WixConnection"("agencyId");
