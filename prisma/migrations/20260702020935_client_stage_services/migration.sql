-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'Onboarding';
