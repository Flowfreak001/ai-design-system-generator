-- CreateTable
CREATE TABLE "SavedSection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedSection_userId_idx" ON "SavedSection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedSection_userId_sectionId_key" ON "SavedSection"("userId", "sectionId");

-- AddForeignKey
ALTER TABLE "SavedSection" ADD CONSTRAINT "SavedSection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
