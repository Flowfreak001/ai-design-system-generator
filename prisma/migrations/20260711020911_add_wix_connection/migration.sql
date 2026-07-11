-- CreateTable
CREATE TABLE "WixConnection" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "siteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WixConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WixConnection_agencyId_key" ON "WixConnection"("agencyId");
