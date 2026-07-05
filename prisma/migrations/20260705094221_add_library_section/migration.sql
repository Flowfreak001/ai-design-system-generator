-- CreateTable
CREATE TABLE "LibrarySection" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "layoutType" TEXT NOT NULL DEFAULT 'custom',
    "componentName" TEXT NOT NULL DEFAULT '',
    "sourceType" TEXT NOT NULL DEFAULT 'custom',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "codeMode" TEXT NOT NULL DEFAULT 'studio-tsx',
    "tsxCode" TEXT,
    "config" JSONB,
    "defaultContent" JSONB,
    "editableFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "originality" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "history" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibrarySection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibrarySection_agencyId_status_idx" ON "LibrarySection"("agencyId", "status");
